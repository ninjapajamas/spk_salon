import { ArrowRight, ClipboardList, Scissors, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { treatments } from '../utils/recommendationEngine';

const categoryCards = [
  {
    title: 'Perawatan Wajah',
    count: treatments.filter((item) => item.category === 'Wajah').length,
    img: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=700',
    desc: 'Facial, masker wajah, dan totok wajah untuk kondisi kulit yang berbeda.',
  },
  {
    title: 'Perawatan Rambut',
    count: treatments.filter((item) => item.category === 'Rambut').length,
    img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=700',
    desc: 'Hair spa, creambath, dan hair mask sesuai masalah rambut pelanggan.',
  },
  {
    title: 'Perawatan Kuku',
    count: treatments.filter((item) => item.category.includes('Kuku')).length,
    img: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=700',
    desc: 'Manicure dan pedicure untuk kuku tangan serta kuku kaki yang lebih terawat.',
  },
];

export default function Home() {
  return (
    <div>
      <section style={{
        position: 'relative',
        minHeight: '560px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 80px',
        backgroundImage: 'linear-gradient(90deg, rgba(247,246,242,0.96) 0%, rgba(247,246,242,0.78) 48%, rgba(247,246,242,0.24) 100%), url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: '650px' }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>
            Sistem rekomendasi treatment salon
          </p>
          <h1 style={{ fontSize: '4rem', lineHeight: 1.08, marginBottom: '22px' }}>Jharmy Salon</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '34px', lineHeight: 1.75 }}>
            Rekomendasi treatment dibuat dari profil konsultasi pelanggan dan atribut layanan salon, sehingga petugas punya acuan yang lebih konsisten saat membantu pelanggan memilih perawatan.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/quiz" className="btn-primary">
              <ClipboardList size={18} />
              Mulai Konsultasi
              <ArrowRight size={18} />
            </Link>
            <Link to="/recommendations" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              Lihat Contoh Hasil
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '72px 80px', backgroundColor: 'var(--color-bg-white)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', alignItems: 'flex-end', marginBottom: '34px' }}>
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.6px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '12px' }}>
                Data treatment pada artikel
              </p>
              <h2 style={{ fontSize: '2.35rem', marginBottom: '12px' }}>Layanan yang Direkomendasikan Sistem</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                Setiap treatment disimpan dengan kategori, manfaat utama, dan atribut pencocokan agar hasil rekomendasi bisa ditelusuri.
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)', fontWeight: 700 }}>
              <Scissors size={20} />
              {treatments.length} treatment aktif
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
            {categoryCards.map((item) => (
              <article key={item.title} style={{ textAlign: 'left', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img src={item.img} alt={item.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ padding: '24px' }}>
                  <span className="badge rose" style={{ marginBottom: '14px' }}>{item.count} layanan</span>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>{item.desc}</p>
                  <Link to="/quiz" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Konsultasikan
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 80px', backgroundColor: 'var(--color-bg-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="card" style={{ borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', boxShadow: 'none', border: '1px solid var(--color-border)' }}>
            {[
              ['Metode', 'Content-Based Filtering'],
              ['Perhitungan', 'Cosine Similarity'],
              ['Contoh hasil', 'Facial 1.00'],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>{label}</p>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '36px 48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem', backgroundColor: '#FFF' }}>
        <p>Jharmy Salon - Sistem rekomendasi treatment berbasis atribut pelanggan.</p>
      </footer>
    </div>
  );
}
