import { useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  History,
  LogIn,
  MessageSquareText,
  Plus,
  QrCode,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
  }).format(new Date(`${value}T00:00:00`));
}

function resolveTreatment(consultation, treatments) {
  return (
    treatments.find((item) => item.id === consultation.selectedTreatmentId) ||
    treatments.find((item) => item.id === consultation.recommendedTreatmentId) ||
    getRecommendations(consultation.preferences, treatments)[0] ||
    null
  );
}

function resolveTreatments(consultation, treatments) {
  const ids = consultation.selectedTreatmentIds?.length
    ? consultation.selectedTreatmentIds
    : [consultation.selectedTreatmentId].filter(Boolean);
  const selected = ids
    .map((id) => treatments.find((item) => item.id === id))
    .filter(Boolean);
  return selected.length ? selected : [resolveTreatment(consultation, treatments)].filter(Boolean);
}

function treatmentNames(items) {
  return items.map((item) => item.name).join(', ') || 'Perawatan Jharmy Salon';
}

function reservationBucket(reservation) {
  if (reservation.status === 'Sudah melakukan perawatan') return 'completed';
  if (reservation.status === 'Dibatalkan') return 'cancelled';
  const visit = new Date(`${reservation.customer.visitDate}T${reservation.customer.visitTime || '00:00'}`);
  return visit < new Date() ? 'pending' : 'upcoming';
}

export default function CustomerDashboard({
  currentUser,
  consultations = [],
  treatments = [],
  onSelectConsultation,
  onUpdateAccount,
}) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('reservations');
  const [openQrId, setOpenQrId] = useState(null);
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const reservations = useMemo(
    () => consultations.filter((item) => item.reservationCode),
    [consultations]
  );
  const recommendationHistory = useMemo(
    () => consultations.filter((item) => !item.reservationCode),
    [consultations]
  );
  const buckets = useMemo(
    () => ({
      upcoming: reservations.filter((item) => reservationBucket(item) === 'upcoming'),
      pending: reservations.filter((item) => reservationBucket(item) === 'pending'),
      completed: reservations.filter((item) => reservationBucket(item) === 'completed'),
    }),
    [reservations]
  );
  const nextReservation = buckets.upcoming[0] || null;
  const latestCompleted = buckets.completed[0] || null;
  const followUpRecommendations = latestCompleted
    ? getRecommendations(latestCompleted.preferences, treatments)
        .filter((item) => item.id !== latestCompleted.selectedTreatmentId)
        .slice(0, 3)
    : [];

  if (currentUser?.role !== 'customer') {
    return (
      <div className="empty-page">
        <div className="empty-state large">
          <LogIn size={34} />
          <h1>Login Pelanggan Diperlukan</h1>
          <p>Masuk untuk melihat reservasi, QR, catatan salon, dan pengaturan akun.</p>
          <div className="button-row">
            <Link to="/login" className="btn-primary">Login Pelanggan</Link>
            <Link to="/quiz" className="btn-secondary">Konsultasi Tamu</Link>
          </div>
        </div>
      </div>
    );
  }

  const openConsultation = (consultationId) => {
    onSelectConsultation(consultationId);
    navigate('/recommendations');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMessage('');
      await onUpdateAccount(profile);
      setProfileMessage('Pengaturan akun berhasil disimpan.');
    } catch (error) {
      setProfileMessage(error.message || 'Pengaturan akun gagal disimpan.');
    } finally {
      setSavingProfile(false);
    }
  };

  const renderReservationGroup = (title, helper, items, icon) => (
    <section className="dashboard-section">
      <div className="dashboard-section-heading">
        <div className="metric-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{helper}</p>
        </div>
        <span className="dashboard-count">{items.length}</span>
      </div>
      {items.length ? (
        <div className="reservation-list">
          {items.map((reservation) => {
            const treatment = resolveTreatment(reservation, treatments);
            const reservationTreatments = resolveTreatments(reservation, treatments);
            const showQr = openQrId === reservation.id;
            return (
              <article key={reservation.id} className="reservation-dashboard-card">
                <img src={treatment?.image} alt={treatment?.name || 'Perawatan'} />
                <div className="reservation-dashboard-main">
                  <div className="reservation-card-title">
                    <div>
                      <span className="badge rose">{reservation.status}</span>
                      <h3>{treatmentNames(reservationTreatments)}</h3>
                    </div>
                    <strong>
                      {reservationTreatments.length
                        ? currency.format(reservationTreatments.reduce((sum, item) => sum + item.price, 0))
                        : '-'}
                    </strong>
                  </div>
                  <div className="reservation-card-meta">
                    <span><CalendarCheck size={16} /> {formatDate(reservation.customer.visitDate)}</span>
                    <span><Clock size={16} /> {reservation.customer.visitTime}</span>
                    <span><QrCode size={16} /> {reservation.reservationCode}</span>
                  </div>
                  {reservation.salonNote && (
                    <div className="salon-note">
                      <MessageSquareText size={18} />
                      <div><strong>Catatan Jharmy Salon</strong><p>{reservation.salonNote}</p></div>
                    </div>
                  )}
                  <div className="button-row">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setOpenQrId(showQr ? null : reservation.id)}
                    >
                      <QrCode size={17} />
                      {showQr ? 'Tutup QR' : 'Tampilkan QR'}
                    </button>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => openConsultation(reservation.id)}
                    >
                      Lihat detail
                    </button>
                  </div>
                </div>
                {showQr && (
                  <div className="dashboard-qr">
                    <QRCodeSVG
                      value={`JHARMY:${reservation.reservationCode}`}
                      size={150}
                      level="H"
                      marginSize={2}
                      title={`QR reservasi ${reservation.reservationCode}`}
                    />
                    <small>Tunjukkan QR ini saat datang</small>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-empty-small">Belum ada data pada kategori ini.</div>
      )}
    </section>
  );

  return (
    <div className="customer-dashboard-page">
      <div className="container page-space">
        <div className="dashboard-welcome">
          <div>
            <p className="eyebrow">Dashboard pelanggan</p>
            <h1>Halo, {currentUser.fullName}</h1>
            <p>Reservasi, QR, catatan salon, rekomendasi lanjutan, dan akunmu ada di satu tempat.</p>
          </div>
          <Link to="/treatments" className="btn-primary">
            <Plus size={18} />
            Reservasi Baru
          </Link>
        </div>

        {nextReservation && (
          <section className="next-treatment-banner">
            <div>
              <span className="badge gold">Perawatan berikutnya</span>
              <h2>{treatmentNames(resolveTreatments(nextReservation, treatments))}</h2>
              <p>{formatDate(nextReservation.customer.visitDate)} pukul {nextReservation.customer.visitTime}</p>
            </div>
            <CalendarCheck size={42} />
          </section>
        )}

        <div className="customer-dashboard-tabs">
          {[
            ['reservations', 'Reservasi', CalendarCheck],
            ['recommendations', 'Rekomendasi', Sparkles],
            ['account', 'Setting Akun', Settings],
          ].map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              className={activeView === value ? 'active' : ''}
              onClick={() => setActiveView(value)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {activeView === 'reservations' && (
          <div className="dashboard-stack">
            <div className="metric-grid three">
              {[
                { label: 'Akan Dilakukan', value: buckets.upcoming.length, helper: 'Jadwal mendatang', icon: CalendarCheck },
                { label: 'Belum Dilakukan', value: buckets.pending.length, helper: 'Jadwal terlewat', icon: History },
                { label: 'Sudah Dilakukan', value: buckets.completed.length, helper: 'Perawatan selesai', icon: CheckCircle2 },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} className="metric-card">
                    <div><span className="metric-icon"><Icon size={18} /></span><span className="metric-helper">{stat.helper}</span></div>
                    <p>{stat.label}</p><strong>{stat.value}</strong>
                  </article>
                );
              })}
            </div>
            {renderReservationGroup('Akan Dilakukan', 'Reservasi yang akan datang.', buckets.upcoming, <CalendarCheck size={19} />)}
            {renderReservationGroup('Belum Dilakukan', 'Jadwal terlewat yang belum dikonfirmasi salon.', buckets.pending, <History size={19} />)}
            {renderReservationGroup('Sudah Dilakukan', 'Perawatan yang sudah divalidasi melalui QR.', buckets.completed, <CheckCircle2 size={19} />)}
          </div>
        )}

        {activeView === 'recommendations' && (
          <div className="dashboard-stack">
            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <div className="metric-icon"><Sparkles size={19} /></div>
                <div><h2>Rekomendasi Perawatan Lanjutan</h2><p>Disesuaikan dari perawatan yang sudah selesai.</p></div>
              </div>
              {followUpRecommendations.length ? (
                <div className="follow-up-grid">
                  {followUpRecommendations.map((treatment) => (
                    <article key={treatment.id} className="follow-up-card">
                      <img src={treatment.image} alt={treatment.name} />
                      <div><h3>{treatment.name}</h3><p>{treatment.summary}</p><strong>{currency.format(treatment.price)}</strong></div>
                      <Link to={`/reserve/${treatment.id}`} className="btn-secondary">Reservasi</Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-small">
                  Rekomendasi lanjutan akan muncul setelah perawatan pertama selesai.
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <div className="metric-icon"><ClipboardList size={19} /></div>
                <div><h2>Riwayat Rekomendasi</h2><p>Konsultasi yang belum dijadikan reservasi.</p></div>
                <span className="dashboard-count">{recommendationHistory.length}</span>
              </div>
              {recommendationHistory.map((consultation) => (
                <button
                  key={consultation.id}
                  type="button"
                  className="recommendation-history-row"
                  onClick={() => openConsultation(consultation.id)}
                >
                  <span>{(consultation.preferences.areas || [consultation.preferences.area]).join(', ')}</span>
                  <strong>{resolveTreatment(consultation, treatments)?.name || 'Lihat rekomendasi'}</strong>
                  <small>{formatDate(consultation.customer.visitDate)}</small>
                </button>
              ))}
              {!recommendationHistory.length && <div className="dashboard-empty-small">Belum ada riwayat rekomendasi.</div>}
            </section>
          </div>
        )}

        {activeView === 'account' && (
          <section className="dashboard-section account-settings-card">
            <div className="dashboard-section-heading">
              <div className="metric-icon"><UserRound size={19} /></div>
              <div><h2>Setting Akun</h2><p>Perbarui informasi pelanggan yang digunakan untuk reservasi.</p></div>
            </div>
            <form className="account-form" onSubmit={saveProfile}>
              <label className="field"><span>Nama lengkap</span><input value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} required /></label>
              <label className="field"><span>Nomor WhatsApp</span><input type="tel" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} required /></label>
              <label className="field"><span>Email</span><input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} required /></label>
              {profileMessage && <p className={profileMessage.includes('berhasil') ? 'form-success' : 'form-error'}>{profileMessage}</p>}
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                <Settings size={17} />
                {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
