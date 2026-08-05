import { useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, Clock, Phone, RefreshCw, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecommendations } from '../utils/recommendationEngine';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatVisit(customer) {
  if (!customer?.visitDate) return 'Belum memilih jadwal';
  const time = customer.visitTime ? `, ${customer.visitTime}` : '';
  return `${customer.visitDate}${time}`;
}

export default function Recommendations({ consultation, treatments = [], currentUser }) {
  const navigate = useNavigate();
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState(null);

  const results = useMemo(() => {
    if (!consultation) return [];
    return getRecommendations(consultation.preferences, treatments);
  }, [consultation, treatments]);

  const selectedTreatment =
    results.find((item) => item.id === consultation?.recommendedTreatmentId) ||
    results[0];
  const effectiveSelectedIds = selectedTreatmentIds?.length
    ? selectedTreatmentIds
    : [selectedTreatment?.id].filter(Boolean);

  const reservationPath = (treatmentIds = effectiveSelectedIds) => {
    const rawIds = Array.isArray(treatmentIds) ? treatmentIds : [treatmentIds];
    const ids = Array.from(new Set(rawIds.filter(Boolean)));
    const params = new URLSearchParams({ consultation: consultation.id });
    if (ids.length > 1) params.set('treatments', ids.join(','));
    const target = `/reserve/${ids[0]}?${params.toString()}`;
    return currentUser?.role === 'customer'
      ? target
      : `/login?returnTo=${encodeURIComponent(target)}`;
  };

  const toggleTreatment = (treatmentId) => {
    setSelectedTreatmentIds((current) => {
      const base = current || [selectedTreatment?.id].filter(Boolean);
      if (base.includes(treatmentId)) {
        const next = base.filter((id) => id !== treatmentId);
        return next.length ? next : [];
      }
      return [...base, treatmentId];
    });
  };

  if (!consultation) {
    return (
      <div className="empty-page">
        <div className="empty-state large">
          <Sparkles size={34} />
          <h1>Belum Ada Data Konsultasi</h1>
          <p>
            Isi data pelanggan terlebih dahulu agar rekomendasi treatment bisa
            dibuat berdasarkan kebutuhan pelanggan yang sebenarnya.
          </p>
          <Link to="/quiz" className="btn-primary">
            Mulai Konsultasi
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      <div className="container page-space">
        <div className="page-heading split">
          <div>
            <p className="eyebrow">Hasil konsultasi</p>
            <h1>Rekomendasi untuk {consultation.customer.name}</h1>
            <p>
              Pilihan treatment berikut dibuat dari data kebutuhan pelanggan dan
              layanan yang sedang tersedia di salon.
            </p>
          </div>
          <button onClick={() => navigate('/quiz')} className="btn-secondary" type="button">
            <RefreshCw size={16} />
            Konsultasi Baru
          </button>
        </div>

        <div className="result-layout">
          <aside className="profile-card">
            <div className="profile-card-heading">
              <CalendarCheck size={20} />
              <h3>Data Pelanggan</h3>
            </div>
            <ProfileLine label="Nama" value={consultation.customer.name} />
            <ProfileLine label="WhatsApp" value={consultation.customer.phone} icon={<Phone size={14} />} />
            <ProfileLine label="Jadwal" value={formatVisit(consultation.customer)} />
            <ProfileLine label="Status" value={consultation.status} />
            <div className="profile-tags">
              {(consultation.preferences.areas || [consultation.preferences.area]).map((area) => (
                <span key={area}>{area}</span>
              ))}
              {consultation.preferences.skinType && <span>{consultation.preferences.skinType}</span>}
              {consultation.preferences.problems.map((problem) => (
                <span key={problem}>{problem}</span>
              ))}
              <span>{consultation.preferences.goal}</span>
            </div>
            {consultation.preferences.notes && (
              <p className="customer-note">{consultation.preferences.notes}</p>
            )}
          </aside>

          <main className="result-list">
            {selectedTreatment ? (
              <article className="featured-treatment">
                <img src={selectedTreatment.image} alt={selectedTreatment.name} />
                <div>
                  <span className="badge rose">Pilihan utama</span>
                  <h2>{selectedTreatment.name}</h2>
                  <p className="muted">
                    {selectedTreatment.category} - {selectedTreatment.summary || selectedTreatment.articleDescription}
                  </p>
                  <p className="reason-box">{selectedTreatment.reason}</p>
                  <p>{selectedTreatment.description}</p>
                  <div className="treatment-meta">
                    <strong>{currency.format(selectedTreatment.price)}</strong>
                    <span>
                      <Clock size={16} />
                      {selectedTreatment.duration} menit
                    </span>
                    <span className="badge gold">{selectedTreatment.suitabilityLabel}</span>
                  </div>
                  <Link className="btn-primary" to={reservationPath(selectedTreatment.id)}>
                    <CalendarCheck size={18} />
                    Reservasi Perawatan
                  </Link>
                  {currentUser?.role !== 'customer' && (
                    <p className="reservation-login-hint">Login pelanggan diperlukan saat reservasi.</p>
                  )}
                </div>
              </article>
            ) : (
              <div className="empty-state">
                <h2>Belum ada treatment tersedia</h2>
                <p>Admin perlu mengaktifkan layanan salon sebelum rekomendasi dapat dibuat.</p>
              </div>
            )}

            {results.length > 0 && (
              <section>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Urutan perhitungan</p>
                    <h2>Semua Perawatan Berdasarkan Skor Rekomendasi</h2>
                  </div>
                  <Link className="btn-primary" to={reservationPath()}>
                    <CalendarCheck size={18} />
                    Reservasi {effectiveSelectedIds.length} Perawatan
                  </Link>
                </div>

                <div className="alternative-grid">
                  {results
                    .map((treatment, index) => (
                      <article key={treatment.id} className="alternative-card">
                        <img src={treatment.image} alt={treatment.name} />
                        <div>
                          <span className={index === 0 ? 'badge rose' : 'badge gold'}>
                            Peringkat {index + 1} - {treatment.matchPercentage}%
                          </span>
                          <h3>{treatment.name}</h3>
                          <p>{treatment.description}</p>
                          <p className="reason-box">{treatment.reason}</p>
                          <div className="treatment-meta small">
                            <strong>{currency.format(treatment.price)}</strong>
                            <span>
                              <Clock size={15} />
                              {treatment.duration} menit
                            </span>
                            <span>{treatment.suitabilityLabel}</span>
                          </div>
                          <Link className="btn-secondary" to={reservationPath(treatment.id)}>
                            Reservasi Treatment Ini
                          </Link>
                          <label className="checkbox-pill">
                            <input
                              type="checkbox"
                              checked={effectiveSelectedIds.includes(treatment.id)}
                              onChange={() => toggleTreatment(treatment.id)}
                            />
                            Pilih untuk reservasi gabungan
                          </label>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileLine({ label, value, icon = null }) {
  return (
    <div className="profile-line">
      <span>{label}</span>
      <p>
        {icon}
        {value || '-'}
      </p>
    </div>
  );
}
