import { useMemo, useState } from 'react';
import { ArrowRight, Clock, Scissors, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function Treatments({ treatments = [], currentUser }) {
  const [category, setCategory] = useState('Semua');
  const [selectedIds, setSelectedIds] = useState([]);
  const activeTreatments = useMemo(
    () => treatments.filter((item) => item.status !== 'Tidak tersedia'),
    [treatments]
  );
  const categories = ['Semua', ...new Set(activeTreatments.map((item) => item.category))];
  const visibleTreatments =
    category === 'Semua'
      ? activeTreatments
      : activeTreatments.filter((item) => item.category === category);

  const reservationPath = (treatmentIds) => {
    const ids = Array.isArray(treatmentIds) ? treatmentIds : [treatmentIds];
    const target = ids.length > 1
      ? `/reserve/${ids[0]}?treatments=${encodeURIComponent(ids.join(','))}`
      : `/reserve/${ids[0]}`;
    return currentUser?.role === 'customer'
      ? target
      : `/login?returnTo=${encodeURIComponent(target)}`;
  };

  const toggleSelected = (treatmentId) => {
    setSelectedIds((current) =>
      current.includes(treatmentId)
        ? current.filter((id) => id !== treatmentId)
        : [...current, treatmentId]
    );
  };

  return (
    <div className="treatments-page">
      <section className="treatments-hero">
        <div className="container">
          <p className="eyebrow">Perawatan Jharmy Salon</p>
          <h1>Pilih perawatan yang membuatmu merasa lebih baik</h1>
          <p>
            Lihat seluruh layanan, harga, durasi, dan manfaatnya. Kamu dapat melihat
            rekomendasi tanpa login; login hanya diperlukan saat membuat reservasi.
          </p>
          <div className="button-row">
            <Link to="/quiz" className="btn-primary">
              <Sparkles size={18} />
              Cari Rekomendasi
            </Link>
          </div>
        </div>
      </section>

      <section className="container page-space">
        <div className="filter-row" aria-label="Filter kategori perawatan">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="selection-toolbar">
            <span>{selectedIds.length} perawatan dipilih</span>
            <Link to={reservationPath(selectedIds)} className="btn-primary">
              Reservasi Gabungan
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        <div className="treatment-catalog-grid">
          {visibleTreatments.map((treatment) => (
            <article key={treatment.id} className="catalog-card">
              <div className="catalog-card-media">
                <img src={treatment.image} alt={treatment.name} />
                <span className="badge rose">{treatment.category}</span>
              </div>
              <div className="catalog-card-body">
                <div>
                  <h2>{treatment.name}</h2>
                  <p className="muted">{treatment.summary}</p>
                </div>
                <p>{treatment.description}</p>
                <div className="catalog-meta">
                  <span><Clock size={16} /> {treatment.duration} menit</span>
                  <span><Star size={16} /> {treatment.rating.toFixed(1)}</span>
                </div>
                <div className="catalog-card-footer">
                  <strong>{currency.format(treatment.price)}</strong>
                  <Link to={reservationPath(treatment.id)} className="btn-primary">
                    Reservasi
                    <ArrowRight size={17} />
                  </Link>
                </div>
                <label className="checkbox-pill">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(treatment.id)}
                    onChange={() => toggleSelected(treatment.id)}
                  />
                  Pilih untuk reservasi gabungan
                </label>
              </div>
            </article>
          ))}
        </div>

        {!visibleTreatments.length && (
          <div className="empty-state large">
            <Scissors size={34} />
            <h2>Belum ada perawatan tersedia</h2>
            <p>Coba pilih kategori lain atau kembali lagi nanti.</p>
          </div>
        )}
      </section>
    </div>
  );
}
