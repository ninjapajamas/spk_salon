BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(60) NOT NULL,
  summary VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  image_url TEXT,
  rating NUMERIC(2, 1) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
  status VARCHAR(30) NOT NULL DEFAULT 'Tersedia'
    CHECK (status IN ('Tersedia', 'Tidak tersedia')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(12) NOT NULL UNIQUE,
  label VARCHAR(120) NOT NULL UNIQUE,
  group_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatment_attributes (
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  PRIMARY KEY (treatment_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS consultation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_email VARCHAR(160),
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  area VARCHAR(60) NOT NULL,
  skin_type VARCHAR(80),
  problems TEXT[] NOT NULL DEFAULT '{}',
  goal VARCHAR(120) NOT NULL,
  history VARCHAR(120),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Rekomendasi saja',
  selected_treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  reservation_code VARCHAR(80) UNIQUE,
  salon_note TEXT,
  reserved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE consultation_profiles
  ADD COLUMN IF NOT EXISTS reservation_code VARCHAR(80) UNIQUE,
  ADD COLUMN IF NOT EXISTS salon_note TEXT,
  ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE consultation_profiles
  ALTER COLUMN status SET DEFAULT 'Rekomendasi saja';

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultation_profiles(id) ON DELETE CASCADE,
  top_treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendation_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  rank_no INTEGER NOT NULL CHECK (rank_no > 0),
  similarity_score NUMERIC(8, 6) NOT NULL CHECK (similarity_score >= 0),
  matched_attributes TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT,
  UNIQUE (recommendation_id, treatment_id),
  UNIQUE (recommendation_id, rank_no)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_consultation_user_id ON consultation_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_status ON consultation_profiles(status);
CREATE INDEX IF NOT EXISTS idx_consultation_visit_slot
  ON consultation_profiles(visit_date, visit_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_reservation_slot
  ON consultation_profiles(visit_date, visit_time)
  WHERE reservation_code IS NOT NULL
    AND status NOT IN ('Dibatalkan', 'Rekomendasi saja');
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);
CREATE INDEX IF NOT EXISTS idx_attributes_group_name ON attributes(group_name);
CREATE INDEX IF NOT EXISTS idx_recommendation_details_rank ON recommendation_details(recommendation_id, rank_no);

INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES
  ('Admin Jharmy Salon', 'admin@jharmysalon.local', '081200000001', crypt('admin123', gen_salt('bf')), 'admin'),
  ('Siti Rahma', 'siti@example.com', '081234567890', crypt('pelanggan123', gen_salt('bf')), 'customer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO attributes (code, label, group_name)
VALUES
  ('A1', 'Wajah', 'Area'),
  ('A2', 'Rambut', 'Area'),
  ('A3', 'Kuku tangan', 'Area'),
  ('A4', 'Kuku kaki', 'Area'),
  ('A5', 'Kulit berminyak', 'Kulit wajah'),
  ('A6', 'Kulit kusam', 'Kulit wajah'),
  ('A7', 'Komedo', 'Kulit wajah'),
  ('A8', 'Kulit sensitif', 'Kulit wajah'),
  ('A9', 'Rambut kering', 'Rambut'),
  ('A10', 'Rambut rusak', 'Rambut'),
  ('A11', 'Rambut bercabang', 'Rambut'),
  ('A12', 'Wajah lelah', 'Kondisi lain'),
  ('A13', 'Relaksasi', 'Kondisi lain'),
  ('A14', 'Nutrisi rambut', 'Manfaat'),
  ('A15', 'Membersihkan wajah', 'Manfaat'),
  ('A16', 'Penguatan rambut', 'Manfaat'),
  ('A17', 'Melembutkan rambut', 'Manfaat'),
  ('A18', 'Kebersihan kuku', 'Kuku/kulit'),
  ('A19', 'Kesehatan kaki', 'Kuku/kulit'),
  ('A20', 'Nutrisi kulit', 'Kuku/kulit'),
  ('A21', 'Relaksasi wajah', 'Kuku/kulit'),
  ('A22', 'Kuku kusam', 'Kuku/kulit'),
  ('A23', 'Kaki kering', 'Kuku/kulit'),
  ('A24', 'Kulit normal', 'Kulit wajah')
ON CONFLICT (code) DO UPDATE
SET label = EXCLUDED.label,
    group_name = EXCLUDED.group_name,
    updated_at = NOW();

INSERT INTO treatments (name, category, summary, description, price, duration_minutes, image_url, rating, status)
VALUES
  ('Facial', 'Wajah', 'Membersihkan wajah', 'Membersihkan wajah secara menyeluruh untuk membantu mengurangi komedo, minyak berlebih, dan tampilan kulit kusam.', 150000, 60, 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=800', 4.9, 'Tersedia'),
  ('Hair Spa', 'Rambut', 'Nutrisi rambut', 'Perawatan nutrisi rambut dan kulit kepala untuk rambut kering, disertai pijatan ringan agar pelanggan merasa lebih rileks.', 180000, 90, 'https://images.unsplash.com/photo-1517596001150-13ad21e646eb?auto=format&fit=crop&q=80&w=800', 4.8, 'Tersedia'),
  ('Creambath', 'Rambut', 'Penguatan rambut', 'Perawatan klasik untuk membantu menguatkan akar rambut dan merawat rambut yang mulai rusak.', 120000, 60, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800', 4.7, 'Tersedia'),
  ('Hair Mask', 'Rambut', 'Melembutkan rambut', 'Masker intensif untuk membuat rambut terasa lebih lembut dan membantu merawat rambut bercabang.', 160000, 60, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', 4.8, 'Tersedia'),
  ('Manicure', 'Kuku tangan', 'Merawat kuku tangan', 'Perawatan kuku tangan untuk menjaga kebersihan, kerapian, dan tampilan kuku yang lebih terawat.', 90000, 45, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800', 4.6, 'Tersedia'),
  ('Pedicure', 'Kuku kaki', 'Merawat kuku kaki', 'Perawatan kuku kaki dan telapak kaki untuk membantu menjaga kebersihan sekaligus kenyamanan kaki.', 100000, 45, 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800', 4.6, 'Tersedia'),
  ('Masker Wajah', 'Wajah', 'Nutrisi kulit wajah', 'Masker bernutrisi untuk membantu menenangkan kulit sensitif dan menjaga keseimbangan kulit berminyak.', 110000, 45, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800', 4.7, 'Tersedia'),
  ('Totok Wajah', 'Wajah', 'Relaksasi wajah', 'Pijatan titik wajah untuk pelanggan yang merasa wajah lelah dan membutuhkan relaksasi ringan.', 130000, 45, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800', 4.8, 'Tersedia')
ON CONFLICT (name) DO UPDATE
SET category = EXCLUDED.category,
    summary = EXCLUDED.summary,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_minutes = EXCLUDED.duration_minutes,
    image_url = EXCLUDED.image_url,
    rating = EXCLUDED.rating,
    status = EXCLUDED.status,
    updated_at = NOW();

WITH treatment_attribute_pairs(treatment_name, attribute_label) AS (
  VALUES
    ('Facial', 'Wajah'),
    ('Facial', 'Komedo'),
    ('Facial', 'Kulit kusam'),
    ('Facial', 'Kulit berminyak'),
    ('Facial', 'Membersihkan wajah'),
    ('Hair Spa', 'Rambut'),
    ('Hair Spa', 'Rambut kering'),
    ('Hair Spa', 'Nutrisi rambut'),
    ('Hair Spa', 'Relaksasi'),
    ('Creambath', 'Rambut'),
    ('Creambath', 'Rambut rusak'),
    ('Creambath', 'Penguatan rambut'),
    ('Hair Mask', 'Rambut'),
    ('Hair Mask', 'Rambut bercabang'),
    ('Hair Mask', 'Melembutkan rambut'),
    ('Manicure', 'Kuku tangan'),
    ('Manicure', 'Kuku kusam'),
    ('Manicure', 'Kebersihan kuku'),
    ('Pedicure', 'Kuku kaki'),
    ('Pedicure', 'Kaki kering'),
    ('Pedicure', 'Kesehatan kaki'),
    ('Masker Wajah', 'Wajah'),
    ('Masker Wajah', 'Kulit berminyak'),
    ('Masker Wajah', 'Kulit sensitif'),
    ('Masker Wajah', 'Nutrisi kulit'),
    ('Totok Wajah', 'Wajah'),
    ('Totok Wajah', 'Wajah lelah'),
    ('Totok Wajah', 'Relaksasi'),
    ('Totok Wajah', 'Relaksasi wajah')
)
INSERT INTO treatment_attributes (treatment_id, attribute_id)
SELECT t.id, a.id
FROM treatment_attribute_pairs pair
JOIN treatments t ON t.name = pair.treatment_name
JOIN attributes a ON a.label = pair.attribute_label
ON CONFLICT DO NOTHING;

COMMIT;
