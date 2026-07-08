import { BarChart3, CalendarCheck, ClipboardList, Scissors, Users } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { getRecommendations } from '../../utils/recommendationEngine';

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
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

export default function Dashboard({ treatments = [], consultations = [], onLogout }) {
  const activeTreatments = treatments.filter((item) => item.status !== 'Tidak tersedia');
  const uniqueCustomers = new Set(
    consultations.map((item) => item.customer.phone || item.customer.name)
  );
  const waitingConsultations = consultations.filter((item) =>
    item.status.toLowerCase().includes('menunggu')
  );
  const completedConsultations = consultations.filter((item) =>
    item.status.toLowerCase().includes('selesai')
  );
  const recentConsultations = consultations.slice(0, 5);

  const popularTreatments = Object.entries(
    consultations.reduce((result, consultation) => {
      const treatment = resolveTreatment(consultation, treatments);
      if (!treatment) return result;
      const key = String(treatment.id);
      return { ...result, [key]: (result[key] || 0) + 1 };
    }, {})
  )
    .map(([id, count]) => ({
      treatment: treatments.find((item) => String(item.id) === id),
      count,
    }))
    .filter((item) => item.treatment)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const metrics = [
    { label: 'Pelanggan', value: uniqueCustomers.size, helper: 'Data tersimpan', icon: Users },
    { label: 'Konsultasi', value: consultations.length, helper: 'Total masuk', icon: ClipboardList },
    { label: 'Menunggu', value: waitingConsultations.length, helper: 'Perlu follow up', icon: CalendarCheck },
    { label: 'Treatment Aktif', value: activeTreatments.length, helper: `${completedConsultations.length} selesai`, icon: Scissors },
  ];

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={onLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Portal Jharmy Salon</p>
            <h1>Selamat datang, Admin</h1>
            <p>Pantau konsultasi pelanggan, booking, dan data treatment dari satu tempat.</p>
          </div>
          <div className="admin-avatar">JS</div>
        </header>

        <div className="metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="metric-card">
                <div>
                  <span className="metric-icon"><Icon size={20} /></span>
                  <span className="metric-helper">{metric.helper}</span>
                </div>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
              </article>
            );
          })}
        </div>

        <div className="admin-grid">
          <section className="admin-card">
            <div className="admin-card-heading">
              <div>
                <h2>Riwayat Konsultasi Terbaru</h2>
                <p>Konsultasi yang masuk dari formulir pelanggan.</p>
              </div>
              <span className="badge rose">Hari ini</span>
            </div>

            {recentConsultations.length ? (
              <div className="consultation-list">
                {recentConsultations.map((consultation) => {
                  const treatment = resolveTreatment(consultation, treatments);
                  return (
                    <article key={consultation.id} className="consultation-item">
                      <div className="customer-initial">
                        {consultation.customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3>{consultation.customer.name}</h3>
                        <p>
                          {treatment?.name || 'Belum ada rekomendasi'} - {consultation.preferences.area}
                        </p>
                        <span>{formatDate(consultation.createdAt)}</span>
                      </div>
                      <span className="status-pill">{consultation.status}</span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyAdminState
                icon={<ClipboardList size={28} />}
                title="Belum ada konsultasi"
                desc="Data pelanggan akan muncul setelah formulir konsultasi diisi."
              />
            )}
          </section>

          <section className="admin-card">
            <div className="admin-card-heading">
              <div>
                <h2>Treatment Sering Dipilih</h2>
                <p>Ringkasan pilihan pelanggan dari data konsultasi.</p>
              </div>
              <BarChart3 size={22} />
            </div>

            {popularTreatments.length ? (
              <div className="popular-list">
                {popularTreatments.map(({ treatment, count }) => (
                  <article key={treatment.id} className="popular-item">
                    <img src={treatment.image} alt={treatment.name} />
                    <div>
                      <h3>{treatment.name}</h3>
                      <p>{treatment.category}</p>
                    </div>
                    <strong>{count}x</strong>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyAdminState
                icon={<Scissors size={28} />}
                title="Belum ada pilihan"
                desc="Treatment populer akan dihitung dari booking dan konsultasi pelanggan."
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyAdminState({ icon, title, desc }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
