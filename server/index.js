import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, withTransaction } from './db.js';
import { getRecommendations } from './recommendation.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function toUser(row) {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    phone: row.phone || '',
    email: row.email,
  };
}

function toAttribute(row) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    group: row.group_name,
  };
}

function toTreatment(row) {
  const attributes = Array.isArray(row.attributes) ? row.attributes : [];

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    articleDescription: row.summary,
    summary: row.summary,
    price: Number(row.price),
    duration: Number(row.duration_minutes),
    rating: Number(row.rating || 0),
    status: row.status,
    image: row.image_url || '',
    description: row.description,
    attributes: attributes.map((attribute) => attribute.label),
    attributeItems: attributes.map(toAttribute),
  };
}

function toConsultation(row) {
  const selectedTreatmentIds = Array.isArray(row.selected_treatment_ids)
    ? row.selected_treatment_ids
    : [];
  const areaItems = String(row.area || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    status: row.status,
    recommendedTreatmentId: row.recommended_treatment_id || null,
    selectedTreatmentId: row.selected_treatment_id || null,
    selectedTreatmentIds: selectedTreatmentIds.length
      ? selectedTreatmentIds
      : [row.selected_treatment_id].filter(Boolean),
    reservationCode: row.reservation_code || '',
    salonNote: row.salon_note || '',
    reservedAt: row.reserved_at || null,
    completedAt: row.completed_at || null,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email || '',
      visitDate: row.visit_date,
      visitTime: row.visit_time,
      notes: row.notes || '',
    },
    preferences: {
      area: row.area,
      areas: areaItems.length ? areaItems : [row.area].filter(Boolean),
      skinType: row.skin_type || '',
      problems: row.problems || [],
      goal: row.goal,
      history: row.history || '',
      notes: row.notes || '',
    },
  };
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length) {
    const error = new Error(`Field wajib belum lengkap: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
}

function treatmentsSql(where = '') {
  return `
    SELECT
      t.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'code', a.code,
            'label', a.label,
            'group_name', a.group_name
          )
          ORDER BY NULLIF(regexp_replace(a.code, '\\D', '', 'g'), '')::int NULLS LAST, a.code
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) AS attributes
    FROM treatments t
    LEFT JOIN treatment_attributes ta ON ta.treatment_id = t.id
    LEFT JOIN attributes a ON a.id = ta.attribute_id
    ${where}
    GROUP BY t.id
    ORDER BY t.created_at DESC, t.name ASC
  `;
}

const consultationsSql = `
  SELECT
    cp.id,
    cp.user_id,
    cp.customer_name,
    cp.customer_phone,
    cp.customer_email,
    to_char(cp.visit_date, 'YYYY-MM-DD') AS visit_date,
    to_char(cp.visit_time, 'HH24:MI') AS visit_time,
    cp.area,
    cp.skin_type,
    cp.problems,
    cp.goal,
    cp.history,
    cp.notes,
    cp.status,
    cp.selected_treatment_id,
    cp.selected_treatment_ids,
    cp.reservation_code,
    cp.salon_note,
    cp.reserved_at,
    cp.completed_at,
    cp.created_at,
    latest.top_treatment_id AS recommended_treatment_id
  FROM consultation_profiles cp
  LEFT JOIN LATERAL (
    SELECT top_treatment_id
    FROM recommendations r
    WHERE r.consultation_id = cp.id
    ORDER BY r.generated_at DESC
    LIMIT 1
  ) latest ON true
`;

const salonSlots = new Set([
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00',
]);

function normalizeVisitTime(visitTime) {
  return String(visitTime || '').slice(0, 5);
}

function isSalonSlot(visitTime) {
  return salonSlots.has(normalizeVisitTime(visitTime));
}

function isPastReservationSlot(visitDate, visitTime) {
  const slotDate = new Date(`${visitDate}T${normalizeVisitTime(visitTime)}:00+07:00`);
  return Number.isNaN(slotDate.getTime()) || slotDate <= new Date();
}

async function ensureDatabaseShape() {
  await query(`
    ALTER TABLE consultation_profiles
      ADD COLUMN IF NOT EXISTS selected_treatment_ids UUID[] NOT NULL DEFAULT '{}'
  `);
}

async function getTreatments(client = null) {
  const runner = client || { query };
  const result = await runner.query(treatmentsSql());
  return result.rows.map(toTreatment);
}

async function getConsultationById(id, client = null) {
  const runner = client || { query };
  const result = await runner.query(
    `${consultationsSql} WHERE cp.id = $1 ORDER BY cp.created_at DESC`,
    [id]
  );
  return result.rows[0] ? toConsultation(result.rows[0]) : null;
}

async function replaceTreatmentAttributes(client, treatmentId, attributeLabels) {
  const labels = Array.from(new Set(attributeLabels.filter(Boolean)));
  await client.query('DELETE FROM treatment_attributes WHERE treatment_id = $1', [treatmentId]);

  if (!labels.length) return;

  const attributes = await client.query(
    'SELECT id FROM attributes WHERE label = ANY($1::text[])',
    [labels]
  );

  for (const attribute of attributes.rows) {
    await client.query(
      `INSERT INTO treatment_attributes (treatment_id, attribute_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [treatmentId, attribute.id]
    );
  }
}

app.get('/api/health', async (_request, response) => {
  await query('SELECT 1');
  response.json({ ok: true, database: 'connected' });
});

app.post('/api/auth/login', async (request, response) => {
  const { email, password, role } = request.body;
  requireFields(request.body, ['email', 'password', 'role']);

  const result = await query(
    `SELECT id, full_name, email, phone, role
     FROM users
     WHERE lower(email) = lower($1)
       AND role = $2
       AND password_hash = crypt($3, password_hash)
     LIMIT 1`,
    [email, role, password]
  );

  if (!result.rows[0]) {
    return response.status(401).json({ message: 'Email, password, atau peran tidak sesuai.' });
  }

  return response.json({ user: toUser(result.rows[0]) });
});

app.post('/api/auth/register', async (request, response) => {
  const { fullName, phone, email, password } = request.body;
  requireFields(request.body, ['fullName', 'phone', 'email', 'password']);

  const result = await query(
    `INSERT INTO users (full_name, phone, email, password_hash, role)
     VALUES ($1, $2, lower($3), crypt($4, gen_salt('bf')), 'customer')
     RETURNING id, full_name, email, phone, role`,
    [fullName, phone, email, password]
  ).catch((error) => {
    if (error.code === '23505') {
      error.statusCode = 409;
      error.message = 'Email sudah terdaftar. Silakan login.';
    }
    throw error;
  });

  return response.status(201).json({ user: toUser(result.rows[0]) });
});

app.put('/api/users/:id', async (request, response) => {
  const { fullName, phone, email } = request.body;
  requireFields(request.body, ['fullName', 'phone', 'email']);

  const result = await query(
    `UPDATE users
     SET full_name = $1, phone = $2, email = lower($3), updated_at = NOW()
     WHERE id = $4 AND role = 'customer'
     RETURNING id, full_name, email, phone, role`,
    [fullName.trim(), phone.trim(), email.trim(), request.params.id]
  ).catch((error) => {
    if (error.code === '23505') {
      error.statusCode = 409;
      error.message = 'Email sudah digunakan akun lain.';
    }
    throw error;
  });

  if (!result.rows[0]) return response.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
  return response.json({ user: toUser(result.rows[0]) });
});

app.get('/api/attributes', async (_request, response) => {
  const result = await query(
    `SELECT id, code, label, group_name
     FROM attributes
     ORDER BY NULLIF(regexp_replace(code, '\\D', '', 'g'), '')::int NULLS LAST, code`
  );
  response.json({ attributes: result.rows.map(toAttribute) });
});

app.post('/api/attributes', async (request, response) => {
  const { code, label, group } = request.body;
  requireFields(request.body, ['code', 'label', 'group']);

  const result = await query(
    `INSERT INTO attributes (code, label, group_name)
     VALUES (upper($1), $2, $3)
     RETURNING id, code, label, group_name`,
    [code, label, group]
  );

  response.status(201).json({ attribute: toAttribute(result.rows[0]) });
});

app.put('/api/attributes/:code', async (request, response) => {
  const { code, label, group } = request.body;
  requireFields(request.body, ['code', 'label', 'group']);

  const result = await query(
    `UPDATE attributes
     SET code = upper($1), label = $2, group_name = $3, updated_at = NOW()
     WHERE code = $4
     RETURNING id, code, label, group_name`,
    [code, label, group, request.params.code]
  );

  if (!result.rows[0]) return response.status(404).json({ message: 'Atribut tidak ditemukan.' });

  return response.json({ attribute: toAttribute(result.rows[0]) });
});

app.delete('/api/attributes/:code', async (request, response) => {
  const result = await query('DELETE FROM attributes WHERE code = $1 RETURNING id', [
    request.params.code,
  ]);

  if (!result.rows[0]) return response.status(404).json({ message: 'Atribut tidak ditemukan.' });

  return response.status(204).end();
});

app.get('/api/treatments', async (_request, response) => {
  response.json({ treatments: await getTreatments() });
});

app.get('/api/availability', async (request, response) => {
  const { date } = request.query;
  if (!date) return response.status(400).json({ message: 'Tanggal wajib dipilih.' });

  const result = await query(
    `SELECT to_char(visit_time, 'HH24:MI') AS visit_time
     FROM consultation_profiles
     WHERE visit_date = $1
       AND reservation_code IS NOT NULL
       AND status NOT IN ('Dibatalkan', 'Rekomendasi saja')
     ORDER BY visit_time`,
    [date]
  );

  return response.json({ date, bookedTimes: result.rows.map((row) => row.visit_time) });
});

app.post('/api/treatments', async (request, response) => {
  const payload = request.body;
  requireFields(payload, ['name', 'category', 'summary', 'price', 'duration', 'status', 'description']);

  const treatment = await withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO treatments
        (name, category, summary, description, price, duration_minutes, image_url, rating, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 4.8), $9)
       RETURNING id`,
      [
        payload.name,
        payload.category,
        payload.summary,
        payload.description,
        Number(payload.price),
        Number(payload.duration),
        payload.image || null,
        payload.rating || 4.8,
        payload.status,
      ]
    );
    await replaceTreatmentAttributes(client, result.rows[0].id, payload.attributes || []);

    const detail = await client.query(treatmentsSql('WHERE t.id = $1'), [result.rows[0].id]);
    return toTreatment(detail.rows[0]);
  });

  response.status(201).json({ treatment });
});

app.put('/api/treatments/:id', async (request, response) => {
  const payload = request.body;
  requireFields(payload, ['name', 'category', 'summary', 'price', 'duration', 'status', 'description']);

  const treatment = await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE treatments
       SET name = $1,
           category = $2,
           summary = $3,
           description = $4,
           price = $5,
           duration_minutes = $6,
           image_url = $7,
           rating = COALESCE($8, rating),
           status = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING id`,
      [
        payload.name,
        payload.category,
        payload.summary,
        payload.description,
        Number(payload.price),
        Number(payload.duration),
        payload.image || null,
        payload.rating || null,
        payload.status,
        request.params.id,
      ]
    );

    if (!result.rows[0]) return null;

    await replaceTreatmentAttributes(client, request.params.id, payload.attributes || []);
    const detail = await client.query(treatmentsSql('WHERE t.id = $1'), [request.params.id]);
    return toTreatment(detail.rows[0]);
  });

  if (!treatment) return response.status(404).json({ message: 'Treatment tidak ditemukan.' });

  return response.json({ treatment });
});

app.delete('/api/treatments/:id', async (request, response) => {
  const result = await query('DELETE FROM treatments WHERE id = $1 RETURNING id', [request.params.id]);
  if (!result.rows[0]) return response.status(404).json({ message: 'Treatment tidak ditemukan.' });
  return response.status(204).end();
});

app.get('/api/consultations', async (request, response) => {
  const { userId } = request.query;
  const params = [];
  let where = '';

  if (userId) {
    params.push(userId);
    where = 'WHERE cp.user_id = $1';
  }

  const result = await query(`${consultationsSql} ${where} ORDER BY cp.created_at DESC`, params);
  response.json({ consultations: result.rows.map(toConsultation) });
});

app.get('/api/consultations/:id', async (request, response) => {
  const consultation = await getConsultationById(request.params.id);
  if (!consultation) return response.status(404).json({ message: 'Konsultasi tidak ditemukan.' });
  return response.json({ consultation });
});

app.post('/api/consultations', async (request, response) => {
  const { userId, customer, preferences } = request.body;
  requireFields(customer || {}, ['name', 'phone', 'visitDate', 'visitTime']);
  const selectedAreas = Array.isArray(preferences?.areas)
    ? preferences.areas.filter(Boolean)
    : [preferences?.area].filter(Boolean);
  requireFields({ ...preferences, area: selectedAreas[0] }, ['area', 'goal']);
  if (!isSalonSlot(customer.visitTime)) {
    return response.status(400).json({ message: 'Jam kunjungan harus sesuai jam operasional salon, pukul 09:00 sampai 21:00.' });
  }
  if (isPastReservationSlot(customer.visitDate, customer.visitTime)) {
    return response.status(400).json({ message: 'Tanggal atau jam kunjungan yang sudah terlewati tidak dapat dipilih.' });
  }

  const consultation = await withTransaction(async (client) => {
    const conflict = await client.query(
      `SELECT id
       FROM consultation_profiles
       WHERE visit_date = $1
         AND visit_time = $2
         AND reservation_code IS NOT NULL
         AND status NOT IN ('Dibatalkan', 'Rekomendasi saja')
       LIMIT 1`,
      [customer.visitDate, normalizeVisitTime(customer.visitTime)]
    );
    if (conflict.rows[0]) {
      const error = new Error('Jam tersebut sudah dibooking pelanggan lain. Silakan pilih jam lain.');
      error.statusCode = 409;
      throw error;
    }

    const treatments = await getTreatments(client);
    const rankings = getRecommendations(preferences, treatments);
    const topTreatment = rankings[0] || null;

    const profileResult = await client.query(
      `INSERT INTO consultation_profiles
        (user_id, customer_name, customer_phone, customer_email, visit_date, visit_time,
         area, skin_type, problems, goal, history, notes, status, selected_treatment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10, $11, $12,
         'Rekomendasi saja', NULL)
       RETURNING id`,
      [
        userId || null,
        customer.name,
        customer.phone,
        customer.email || null,
        customer.visitDate,
        normalizeVisitTime(customer.visitTime),
        selectedAreas.join(', '),
        preferences.skinType || null,
        preferences.problems || [],
        preferences.goal,
        preferences.history || null,
        preferences.notes || customer.notes || null,
      ]
    );

    const consultationId = profileResult.rows[0].id;
    const recommendationResult = await client.query(
      `INSERT INTO recommendations (consultation_id, top_treatment_id)
       VALUES ($1, $2)
       RETURNING id`,
      [consultationId, topTreatment?.id || null]
    );

    for (const [index, treatment] of rankings.entries()) {
      await client.query(
        `INSERT INTO recommendation_details
          (recommendation_id, treatment_id, rank_no, similarity_score, matched_attributes, reason)
         VALUES ($1, $2, $3, $4, $5::text[], $6)`,
        [
          recommendationResult.rows[0].id,
          treatment.id,
          index + 1,
          treatment.similarityScore,
          treatment.matchedAttributes,
          treatment.reason,
        ]
      );
    }

    return getConsultationById(consultationId, client);
  });

  response.status(201).json({ consultation });
});

app.put('/api/consultations/:id/status', async (request, response) => {
  requireFields(request.body, ['status']);
  const result = await query(
    `UPDATE consultation_profiles
     SET status = $1,
         completed_at = CASE
           WHEN $1 = 'Sudah melakukan perawatan' THEN COALESCE(completed_at, NOW())
           ELSE completed_at
         END,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [request.body.status, request.params.id]
  );

  if (!result.rows[0]) return response.status(404).json({ message: 'Konsultasi tidak ditemukan.' });

  return response.json({ consultation: await getConsultationById(request.params.id) });
});

app.put('/api/consultations/:id/selected-treatment', async (request, response) => {
  requireFields(request.body, ['treatmentId']);
  const result = await query(
    `UPDATE consultation_profiles
     SET selected_treatment_id = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [request.body.treatmentId, request.params.id]
  );

  if (!result.rows[0]) return response.status(404).json({ message: 'Konsultasi tidak ditemukan.' });

  return response.json({ consultation: await getConsultationById(request.params.id) });
});

app.put('/api/consultations/:id/salon-note', async (request, response) => {
  const result = await query(
    `UPDATE consultation_profiles
     SET salon_note = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [String(request.body.note || '').trim(), request.params.id]
  );

  if (!result.rows[0]) return response.status(404).json({ message: 'Konsultasi tidak ditemukan.' });
  return response.json({ consultation: await getConsultationById(request.params.id) });
});

app.post('/api/reservations', async (request, response) => {
  const { userId, treatmentId, treatmentIds, visitDate, visitTime, consultationId } = request.body;
  const normalizedTreatmentIds = Array.from(
    new Set((Array.isArray(treatmentIds) && treatmentIds.length ? treatmentIds : [treatmentId]).filter(Boolean))
  );
  requireFields({ ...request.body, treatmentId: normalizedTreatmentIds[0] }, ['userId', 'treatmentId', 'visitDate', 'visitTime']);
  if (!isSalonSlot(visitTime)) {
    return response.status(400).json({ message: 'Jam reservasi harus sesuai jam operasional salon, pukul 09:00 sampai 21:00.' });
  }
  if (isPastReservationSlot(visitDate, visitTime)) {
    return response.status(400).json({ message: 'Tanggal atau jam yang sudah terlewati tidak dapat dipilih.' });
  }

  const reservation = await withTransaction(async (client) => {
    const normalizedVisitTime = normalizeVisitTime(visitTime);
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${visitDate}|${normalizedVisitTime}`]);

    const userResult = await client.query(
      `SELECT id, full_name, email, phone
       FROM users
       WHERE id = $1 AND role = 'customer'
       LIMIT 1`,
      [userId]
    );
    if (!userResult.rows[0]) {
      const error = new Error('Login pelanggan diperlukan untuk membuat reservasi.');
      error.statusCode = 401;
      throw error;
    }

    const treatmentResult = await client.query(
      `SELECT id, name, category, summary
       FROM treatments
       WHERE id = ANY($1::uuid[]) AND status = 'Tersedia'
       ORDER BY array_position($1::uuid[], id)`,
      [normalizedTreatmentIds]
    );
    if (treatmentResult.rows.length !== normalizedTreatmentIds.length) {
      const error = new Error('Treatment tidak tersedia.');
      error.statusCode = 404;
      throw error;
    }

    const conflict = await client.query(
      `SELECT id
       FROM consultation_profiles
       WHERE visit_date = $1
         AND visit_time = $2
         AND reservation_code IS NOT NULL
         AND status NOT IN ('Dibatalkan', 'Rekomendasi saja')
         AND ($3::uuid IS NULL OR id <> $3::uuid)
       LIMIT 1`,
      [visitDate, normalizedVisitTime, consultationId || null]
    );
    if (conflict.rows[0]) {
      const error = new Error('Jadwal tersebut sudah dibooking. Silakan pilih jam lain.');
      error.statusCode = 409;
      throw error;
    }

    const codeResult = await client.query(
      `SELECT 'JHS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)) AS code`
    );
    const reservationCode = codeResult.rows[0].code;
    const user = userResult.rows[0];
    const treatments = treatmentResult.rows;
    const primaryTreatment = treatments[0];
    const treatmentLabels = treatments.map((item) => item.summary).join(', ');
    const treatmentCategories = Array.from(new Set(treatments.map((item) => item.category))).join(', ');
    let reservationId = consultationId || null;

    if (reservationId) {
      const updateResult = await client.query(
        `UPDATE consultation_profiles
         SET user_id = $1,
             customer_name = $2,
             customer_phone = $3,
             customer_email = $4,
             visit_date = $5,
             visit_time = $6,
             selected_treatment_id = $7,
             selected_treatment_ids = $8::uuid[],
             reservation_code = COALESCE(reservation_code, $9),
             status = 'Akan datang',
             reserved_at = COALESCE(reserved_at, NOW()),
             updated_at = NOW()
         WHERE id = $10
           AND (user_id IS NULL OR user_id = $1)
         RETURNING id`,
        [
          user.id,
          user.full_name,
          user.phone,
          user.email,
          visitDate,
          normalizedVisitTime,
          primaryTreatment.id,
          normalizedTreatmentIds,
          reservationCode,
          reservationId,
        ]
      );
      if (!updateResult.rows[0]) {
        const error = new Error('Data rekomendasi tidak dapat digunakan untuk reservasi ini.');
        error.statusCode = 403;
        throw error;
      }
    } else {
      const insertResult = await client.query(
        `INSERT INTO consultation_profiles
          (user_id, customer_name, customer_phone, customer_email, visit_date, visit_time,
           area, problems, goal, history, status, selected_treatment_id,
           selected_treatment_ids, reservation_code, reserved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, '{}'::text[], $8,
           'Reservasi langsung', 'Akan datang', $9, $10::uuid[], $11, NOW())
         RETURNING id`,
        [
          user.id,
          user.full_name,
          user.phone,
          user.email,
          visitDate,
          normalizedVisitTime,
          treatmentCategories,
          treatmentLabels,
          primaryTreatment.id,
          normalizedTreatmentIds,
          reservationCode,
        ]
      );
      reservationId = insertResult.rows[0].id;
    }

    return getConsultationById(reservationId, client);
  }).catch((error) => {
    if (error.code === '23505') {
      error.statusCode = 409;
      error.message = 'Jadwal tersebut baru saja dibooking pelanggan lain. Silakan pilih jam lain.';
    }
    throw error;
  });

  return response.status(201).json({ reservation });
});

app.post('/api/reservations/scan', async (request, response) => {
  requireFields(request.body, ['code']);
  const normalizedCode = String(request.body.code).trim().replace(/^JHARMY:/i, '');

  const existing = await query(
    `SELECT id, status
     FROM consultation_profiles
     WHERE upper(reservation_code) = upper($1)
     LIMIT 1`,
    [normalizedCode]
  );
  if (!existing.rows[0]) {
    return response.status(404).json({ valid: false, message: 'QR reservasi tidak valid.' });
  }
  if (existing.rows[0].status === 'Dibatalkan') {
    return response.status(409).json({ valid: false, message: 'Reservasi sudah dibatalkan.' });
  }

  const result = await query(
    `UPDATE consultation_profiles
     SET status = 'Sudah melakukan perawatan',
         completed_at = COALESCE(completed_at, NOW()),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [existing.rows[0].id]
  );

  return response.json({
    valid: true,
    alreadyCompleted: existing.rows[0].status === 'Sudah melakukan perawatan',
    message:
      existing.rows[0].status === 'Sudah melakukan perawatan'
        ? 'QR valid dan reservasi sebelumnya sudah dikonfirmasi.'
        : 'QR valid. Status reservasi otomatis diperbarui.',
    reservation: await getConsultationById(result.rows[0].id),
  });
});

app.delete('/api/consultations/:id', async (request, response) => {
  const result = await query('DELETE FROM consultation_profiles WHERE id = $1 RETURNING id', [
    request.params.id,
  ]);

  if (!result.rows[0]) return response.status(404).json({ message: 'Konsultasi tidak ditemukan.' });

  return response.status(204).end();
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use((request, response, next) => {
  if (request.method === 'GET' && !request.path.startsWith('/api') && fs.existsSync(indexPath)) {
    return response.sendFile(indexPath);
  }

  return next();
});

app.use((error, _request, response, next) => {
  void next;
  const status = error.statusCode || 500;
  const message = status >= 500 ? 'Terjadi kesalahan server.' : error.message;

  if (status >= 500) console.error(error);

  response.status(status).json({ message });
});

ensureDatabaseShape()
  .then(() => {
    app.listen(port, () => {
      console.log(`API salon berjalan di http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error('Gagal menyiapkan database.', error);
    process.exit(1);
  });
