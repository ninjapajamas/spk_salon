import { CalendarCheck, ClipboardList, Clock, LogIn, Plus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecommendations } from '../utils/recommendationEngine';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function resolveTreatment(consultation, treatments) {
  return (
    treatments.find((item) => item.id === consultation.selectedTreatmentId) ||
    treatments.find((item) => item.id === consultation.recommendedTreatmentId) ||
    getRecommendations(consultation.preferences, treatments)[0] ||
    null
  );
}

export default function CustomerDashboard({
  currentUser,
  consultations = [],
  treatments = [],
  onSelectConsultation,
}) {
  const navigate = useNavigate();

  if (currentUser?.role !== 'customer') {
    return (
      <div className="empty-page">
        <div className="empty-state large">
          <LogIn size={34} />
          <h1>Login Pelanggan Diperlukan</h1>
          <p>
            Masuk sebagai pelanggan untuk melihat riwayat konsultasi pribadi,
            atau lanjut konsultasi tanpa akun.
          </p>
          <div className="button-row">
            <Link to="/login" className="btn-primary">Login Pelanggan</Link>
            <Link to="/quiz" className="btn-secondary">Konsultasi Tamu</Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = consultations.filter((item) =>
    item.status.toLowerCase().includes('selesai')
  ).length;
  const waitingCount = consultations.filter((item) =>
    item.status.toLowerCase().includes('menunggu')
  ).length;

  const openConsultation = (consultationId) => {
    onSelectConsultation(consultationId);
    navigate('/recommendations');
  };

  return (
    <div className="result-page">
      <div className="container page-space">
        <div className="page-heading split">
          <div>
            <p className="eyebrow">Dashboard pelanggan</p>
            <h1>Halo, {currentUser.fullName}</h1>
            <p>
              Pantau riwayat konsultasi, rekomendasi treatment, dan status
              tindak lanjut dari Jharmy Salon.
            </p>
          </div>
          <Link to="/quiz" className="btn-primary">
            <Plus size={18} />
            Konsultasi Baru
          </Link>
        </div>

        <div className="metric-grid three">
          {[
            { label: 'Total Konsultasi', value: consultations.length, helper: 'Riwayat akun' },
            { label: 'Menunggu', value: waitingCount, helper: 'Perlu konfirmasi salon' },
            { label: 'Selesai', value: completedCount, helper: 'Treatment selesai' },
          ].map((stat) => (
            <article key={stat.label} className="metric-card">
              <div>
                <span className="metric-icon"><ClipboardList size={18} /></span>
                <span className="metric-helper">{stat.helper}</span>
              </div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>

        {consultations.length ? (
          <div className="customer-history-grid">
            {consultations.map((consultation) => {
              const treatment = resolveTreatment(consultation, treatments);
              return (
                <article key={consultation.id} className="history-card">
                  <div className="history-card-media">
                    {treatment?.image ? (
                      <img src={treatment.image} alt={treatment.name} />
                    ) : (
                      <Sparkles size={30} />
                    )}
                  </div>
                  <div className="history-card-body">
                    <div>
                      <span className="badge rose">{consultation.status}</span>
                      <h2>{treatment?.name || 'Belum ada treatment'}</h2>
                      <p className="muted">
                        {consultation.preferences.area} - {consultation.preferences.goal}
                      </p>
                    </div>

                    <div className="profile-tags">
                      {consultation.preferences.skinType && <span>{consultation.preferences.skinType}</span>}
                      {consultation.preferences.problems.map((problem) => (
                        <span key={problem}>{problem}</span>
                      ))}
                    </div>

                    <div className="history-meta">
                      <span>
                        <CalendarCheck size={16} />
                        {formatDate(consultation.customer.visitDate)}
                      </span>
                      {consultation.customer.visitTime && (
                        <span>
                          <Clock size={16} />
                          {consultation.customer.visitTime}
                        </span>
                      )}
                      {treatment && <strong>{currency.format(treatment.price)}</strong>}
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => openConsultation(consultation.id)}
                    >
                      Lihat Rekomendasi
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state large">
            <ClipboardList size={34} />
            <h2>Belum Ada Riwayat Konsultasi</h2>
            <p>Konsultasi yang dibuat setelah login akan muncul di dashboard ini.</p>
            <Link to="/quiz" className="btn-primary">Mulai Konsultasi</Link>
          </div>
        )}
      </div>
    </div>
  );
}
