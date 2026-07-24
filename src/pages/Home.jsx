import { ArrowRight, CalendarCheck, ClipboardList, Scissors, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryImages = {
  Wajah: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=700',
  Rambut: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=700',
  'Kuku tangan': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=700',
  'Kuku kaki': 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=700',
};

const categoryCopy = {
  Wajah: 'Facial, masker, dan totok wajah sesuai kondisi kulit pelanggan.',
  Rambut: 'Hair spa, creambath, dan hair mask untuk kebutuhan rambut berbeda.',
  'Kuku tangan': 'Manicure untuk kuku tangan yang rapi, bersih, dan terawat.',
  'Kuku kaki': 'Pedicure untuk kenyamanan kaki dan kuku yang lebih sehat.',
};

const workflow = [
  {
    title: 'Isi Data Pelanggan',
    desc: 'Nama, kontak, jadwal kunjungan, dan kebutuhan perawatan dicatat dalam satu formulir.',
    icon: Users,
  },
  {
    title: 'Dapatkan Rekomendasi',
    desc: 'Sistem menyesuaikan layanan dengan kondisi pelanggan dan daftar treatment yang aktif.',
    icon: Sparkles,
  },
  {
    title: 'Admin Menindaklanjuti',
    desc: 'Salon dapat melihat konsultasi masuk, memilih status, dan mengelola data treatment.',
    icon: CalendarCheck,
  },
];

export default function Home({ treatments = [] }) {
  const activeTreatments = treatments.filter((item) => item.status !== 'Tidak tersedia');
  const categories = Object.keys(categoryImages).map((category) => ({
    title: category,
    count: activeTreatments.filter((item) => item.category === category).length,
    img: categoryImages[category],
    desc: categoryCopy[category],
  }));

  return (
    <div>
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Konsultasi treatment salon</p>
          <h1>Jharmy Salon</h1>
          <p>
            Bantu pelanggan memilih treatment yang tepat berdasarkan kondisi wajah,
            rambut, kuku, tujuan perawatan, dan jadwal kunjungan.
          </p>
          <div className="button-row">
            <Link to="/quiz" className="btn-primary">
              <ClipboardList size={18} />
              Mulai Konsultasi
              <ArrowRight size={18} />
            </Link>
            <Link to="/treatments" className="btn-secondary">
              <Scissors size={18} />
              Lihat Perawatan
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="layanan">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Layanan salon</p>
            <h2>Treatment yang Bisa Direkomendasikan</h2>
            <p>
              Pelanggan memilih kebutuhan perawatan, lalu sistem menampilkan layanan
              yang paling sesuai dari data treatment aktif milik salon.
            </p>
          </div>
          <div className="section-count">
            <Scissors size={20} />
            {activeTreatments.length} treatment tersedia
          </div>
        </div>

        <div className="service-grid">
          {categories.map((item) => (
            <article key={item.title} className="service-card">
              <img src={item.img} alt={item.title} />
              <div>
                <span className="badge rose">{item.count} layanan</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <Link to="/treatments" className="text-link">
                  Lihat Perawatan
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="workflow-grid">
          {workflow.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="workflow-item">
                <div className="workflow-icon">
                  <Icon size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="site-footer">
        <p>Jharmy Salon - rekomendasi treatment personal untuk pelanggan salon.</p>
      </footer>
    </div>
  );
}
