import { useMemo } from 'react';
import { ArrowRight, BadgeCheck, Calculator, Clock, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  articleProfileExample,
  buildUserAttributes,
  getAttributeDisplay,
  getRecommendations,
} from '../utils/recommendationEngine';

export default function Recommendations({ preferences }) {
  const navigate = useNavigate();
  const activePreferences = preferences || articleProfileExample;
  const isExampleProfile = !preferences;
  const userAttributes = useMemo(
    () => buildUserAttributes(activePreferences),
    [activePreferences]
  );

  const results = useMemo(
    () => getRecommendations(activePreferences),
    [activePreferences]
  );

  const mainRecommendation = results[0];

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '100vh', paddingBottom: '72px' }}>
      <div className="container" style={{ paddingTop: '52px', paddingBottom: '34px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', alignItems: 'flex-end' }}>
          <div style={{ maxWidth: '780px' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.6px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '12px' }}>
              Hasil Content-Based Filtering
            </p>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '14px' }}>Rekomendasi Treatment</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              Sistem mengurutkan treatment berdasarkan nilai cosine similarity tertinggi antara profil pelanggan dan atribut layanan salon.
            </p>
          </div>
          <button onClick={() => navigate('/quiz')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} />
            Ubah Profil
          </button>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>
        <aside style={{ position: 'sticky', top: '24px' }}>
          <div className="card" style={{ backgroundColor: '#FAF8F5', border: '1px solid var(--color-border)', boxShadow: 'none', borderRadius: '8px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BadgeCheck size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Profil Pelanggan</h3>
            </div>

            {isExampleProfile && (
              <div style={{ backgroundColor: '#FFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Menggunakan contoh profil pada artikel: wajah, kulit berminyak, kulit kusam, komedo, dan membersihkan wajah.
              </div>
            )}

            <ProfileLine label="Area perawatan" value={activePreferences.area} />
            <ProfileLine label="Jenis kulit" value={activePreferences.skinType || 'Tidak dipakai'} />
            <ProfileLine label="Tujuan" value={activePreferences.goal} />
            <ProfileLine label="Riwayat" value={activePreferences.history} />

            <div style={{ marginTop: '22px' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', fontWeight: 700 }}>Atribut aktif</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {userAttributes.map((attribute) => (
                  <span key={attribute} className="badge rose" style={{ textTransform: 'none', letterSpacing: 0 }}>{attribute}</span>
                ))}
              </div>
            </div>
          </div>

          {mainRecommendation && (
            <div className="card" style={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '14px' }}>
                <Calculator size={18} />
                Contoh hitung
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: '14px' }}>
                {mainRecommendation.name}: {mainRecommendation.calculation.formula} = {mainRecommendation.similarityDisplay}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                <Metric label="Dot product" value={mainRecommendation.calculation.dotProduct} />
                <Metric label="Atribut user" value={mainRecommendation.calculation.userMagnitude} />
                <Metric label="Atribut item" value={mainRecommendation.calculation.treatmentMagnitude} />
                <Metric label="Kecocokan" value={`${mainRecommendation.matchPercentage}%`} />
              </div>
            </div>
          )}
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {results.slice(0, 3).map((treatment, index) => (
            <article key={treatment.id} className="card" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', padding: 0, overflow: 'hidden', borderRadius: '8px' }}>
              <div style={{ position: 'relative', minHeight: '260px' }}>
                <img
                  src={treatment.image}
                  alt={treatment.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: index === 0 ? 'var(--color-primary)' : '#FFF', color: index === 0 ? '#FFF' : 'var(--color-text-main)', padding: '7px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.4px' }}>
                  {index === 0 ? 'REKOMENDASI UTAMA' : `ALTERNATIF ${index}`}
                </div>
              </div>

              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '10px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.55rem', margin: 0 }}>{treatment.name}</h2>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>{treatment.category} - {treatment.articleDescription}</p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '96px' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>
                        {treatment.similarityDisplay}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                        Similarity
                      </span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--color-text-main)', lineHeight: 1.65, marginBottom: '14px', fontSize: '0.95rem', backgroundColor: '#FAF8F5', padding: '14px', borderRadius: '8px' }}>
                    <strong>Alasan:</strong> {treatment.reason}
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                    {treatment.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600 }}>
                    <span>Rp {treatment.price.toLocaleString('id-ID')}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} />
                      {treatment.duration} menit
                    </span>
                    <span className="badge gold">{treatment.suitabilityLabel}</span>
                  </div>
                  <button className="btn-primary" style={{ padding: '10px 18px' }}>
                    Detail
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}

          <section className="card" style={{ borderRadius: '8px', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '24px 26px', display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>Rincian Perhitungan</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Atribut profil: {getAttributeDisplay(userAttributes)}
                </p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <Sparkles size={18} />
                Urut berdasarkan similarity
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '860px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid var(--color-border)' }}>
                    <TableHead>No</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Atribut cocok</TableHead>
                    <TableHead>Rumus</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {results.map((treatment, index) => (
                    <tr key={treatment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><strong>{treatment.name}</strong></TableCell>
                      <TableCell>{treatment.matchedCodes.filter((code) => code !== '-').join(', ') || '-'}</TableCell>
                      <TableCell>{treatment.calculation.formula}</TableCell>
                      <TableCell><strong>{treatment.similarityDisplay}</strong></TableCell>
                      <TableCell>{index === 0 ? 'Rekomendasi utama' : treatment.suitabilityLabel}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ProfileLine({ label, value }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', fontWeight: 700 }}>{label}</span>
      <p style={{ marginTop: '6px', fontWeight: 600, color: 'var(--color-text-main)' }}>{value || '-'}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ backgroundColor: '#FAF8F5', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px' }}>
      <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.72rem', marginBottom: '4px' }}>{label}</span>
      <strong style={{ color: 'var(--color-primary)' }}>{value}</strong>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th style={{ padding: '16px', fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td style={{ padding: '15px 16px', color: 'var(--color-text-main)', fontSize: '0.88rem', verticalAlign: 'top' }}>
      {children}
    </td>
  );
}
