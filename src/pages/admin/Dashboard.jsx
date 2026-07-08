import { BarChart3, Bell, ClipboardList, Star, Users } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { articleRankingExample, treatments } from '../../utils/recommendationEngine';

export default function Dashboard() {
  const topTreatments = articleRankingExample.slice(0, 3);

  return (
    <div style={{ display: 'flex', backgroundColor: '#F9F8F6', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ marginLeft: '260px', flex: 1, padding: '44px', maxWidth: '1240px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '34px' }}>
          <div>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.6px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '10px' }}>
              Portal Jharmy Salon
            </p>
            <h1 style={{ fontSize: '2.35rem', marginBottom: '8px', color: 'var(--color-text-main)' }}>Selamat datang, Admin</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Pantau konsultasi, data treatment, dan hasil rekomendasi pelanggan dari satu halaman.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="button" aria-label="Notifikasi" style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', backgroundColor: '#FFF' }}>
              <Bell size={18} />
            </button>
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="Admin salon" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Pelanggan', value: '1.284', change: '+12%', icon: Users, bg: '#F8DFDF' },
            { label: 'Konsultasi', value: '428', change: '+5%', icon: ClipboardList, bg: '#FDE4A9' },
            { label: 'Treatment', value: treatments.length, change: 'Aktif', icon: Star, bg: '#D1C6C6' },
            { label: 'Akurasi Uji', value: '90%', change: '10 skenario', icon: BarChart3, bg: '#E8E5E1' },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="card" style={{ padding: '24px', borderRadius: '8px', boxShadow: 'none', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: metric.bg, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-primary)' }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8A7052' }}>{metric.change}</span>
                </div>
                <h3 style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{metric.label}</h3>
                <p style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)', margin: 0 }}>{metric.value}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '22px' }}>
          <section className="card" style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>Riwayat Konsultasi Terbaru</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Contoh antrean konsultasi yang memakai hasil rekomendasi sistem.</p>
              </div>
              <span className="badge rose">Hari ini</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                ['Siti Rahma', 'Facial', '1.00', 'Wajah, kulit berminyak, komedo'],
                ['Maya Putri', 'Masker Wajah', '0.75', 'Wajah, kulit sensitif, nutrisi kulit'],
                ['Dina Laras', 'Hair Spa', '0.75', 'Rambut kering, nutrisi rambut'],
              ].map(([customer, treatment, score, profile], index) => (
                <div key={customer} style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: index < 2 ? '1px solid var(--color-border)' : 'none', paddingBottom: index < 2 ? '16px' : 0 }}>
                  <img src={`https://i.pravatar.cc/100?img=${index + 31}`} alt={customer} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}><strong>{customer}</strong> direkomendasikan <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{treatment}</span></p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{profile}</span>
                  </div>
                  <span className="badge gold">{score}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card" style={{ borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.45rem', marginBottom: '22px' }}>Peringkat Contoh Artikel</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {topTreatments.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '58px', height: '58px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-main)' }}>{index + 1}. {item.name}</h4>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{item.similarityDisplay}</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#E8E5E1', height: '6px', borderRadius: '999px', marginBottom: '5px' }}>
                      <div style={{ width: `${Math.max(item.matchPercentage, 6)}%`, backgroundColor: 'var(--color-primary)', height: '100%', borderRadius: '999px' }} />
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{item.suitabilityLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '28px', backgroundColor: '#FDF7F7', border: '1px solid #EEDCDC', padding: '20px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block', marginBottom: '10px' }}>Catatan konsultasi</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.65, margin: 0 }}>
                Hasil sistem dipakai sebagai alat bantu awal. Petugas tetap dapat menyesuaikan rekomendasi berdasarkan observasi langsung pelanggan di salon.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
