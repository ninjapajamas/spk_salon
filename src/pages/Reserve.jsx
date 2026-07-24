import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, LockKeyhole, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, Navigate, useSearchParams, useParams } from 'react-router-dom';
import { api } from '../services/api';

const slots = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function todayInputValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export default function Reserve({ currentUser, treatments = [], onCreateReservation }) {
  const { treatmentId } = useParams();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get('consultation') || null;
  const treatment = treatments.find((item) => String(item.id) === String(treatmentId));
  const [visitDate, setVisitDate] = useState(todayInputValue());
  const [visitTime, setVisitTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getAvailability(visitDate)
      .then((data) => {
        if (!cancelled) setBookedTimes(data.bookedTimes);
      })
      .catch((availabilityError) => {
        if (!cancelled) setError(availabilityError.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visitDate]);

  const unavailable = useMemo(() => new Set(bookedTimes), [bookedTimes]);

  if (currentUser?.role !== 'customer') {
    const target = `/reserve/${treatmentId}${consultationId ? `?consultation=${consultationId}` : ''}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(target)}`} replace />;
  }

  if (!treatment) {
    return (
      <div className="empty-page">
        <div className="empty-state large">
          <CalendarCheck size={34} />
          <h1>Perawatan tidak ditemukan</h1>
          <Link to="/treatments" className="btn-primary">Lihat Perawatan</Link>
        </div>
      </div>
    );
  }

  const submitReservation = async (event) => {
    event.preventDefault();
    if (!visitTime) {
      setError('Pilih salah satu jam yang masih tersedia.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const created = await onCreateReservation({
        userId: currentUser.id,
        treatmentId: treatment.id,
        visitDate,
        visitTime,
        consultationId,
      });
      setReservation(created);
      setBookedTimes((current) => [...new Set([...current, visitTime])]);
    } catch (reservationError) {
      setError(reservationError.message || 'Reservasi gagal dibuat.');
      const latest = await api.getAvailability(visitDate).catch(() => null);
      if (latest) setBookedTimes(latest.bookedTimes);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-space">
      <div className="page-heading split">
        <div>
          <p className="eyebrow">Reservasi perawatan</p>
          <h1>Pilih jadwal untuk {treatment.name}</h1>
          <p>Jam yang sudah dipesan otomatis dinonaktifkan agar tidak terjadi booking ganda.</p>
        </div>
        <span className="secure-chip"><LockKeyhole size={16} /> Login sebagai {currentUser.fullName}</span>
      </div>

      <div className="reservation-layout">
        <article className="reservation-treatment-card">
          <img src={treatment.image} alt={treatment.name} />
          <div>
            <span className="badge rose">{treatment.category}</span>
            <h2>{treatment.name}</h2>
            <p>{treatment.description}</p>
            <div className="treatment-meta">
              <strong>{currency.format(treatment.price)}</strong>
              <span><Clock size={16} /> {treatment.duration} menit</span>
            </div>
          </div>
        </article>

        <form className="reservation-form-card" onSubmit={submitReservation}>
          <label className="field">
            <span>Tanggal perawatan</span>
            <input
              type="date"
              min={todayInputValue()}
              value={visitDate}
              onChange={(event) => {
                setVisitDate(event.target.value);
                setVisitTime('');
                setLoadingSlots(true);
                setError('');
              }}
              required
            />
          </label>

          <div>
            <div className="form-section-title">
              <Clock size={18} />
              Jam tersedia
            </div>
            {loadingSlots ? (
              <p className="muted">Memeriksa ketersediaan jadwal...</p>
            ) : (
              <div className="slot-grid">
                {slots.map((slot) => {
                  const isBooked = unavailable.has(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={visitTime === slot ? 'slot-button active' : 'slot-button'}
                      disabled={isBooked}
                      onClick={() => setVisitTime(slot)}
                      aria-label={isBooked ? `${slot} sudah dibooking` : `${slot} tersedia`}
                    >
                      <strong>{slot}</strong>
                      <span>{isBooked ? 'Sudah dibooking' : 'Tersedia'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary wide-button" disabled={submitting || !visitTime}>
            <CalendarCheck size={18} />
            {submitting ? 'Menyimpan Reservasi...' : 'Konfirmasi Reservasi'}
          </button>
        </form>
      </div>

      {reservation && (
        <div className="modal-backdrop success-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-success-title">
          <div className="modal-card reservation-success-card">
            <button
              type="button"
              className="icon-button modal-close"
              aria-label="Tutup popup reservasi"
              onClick={() => setReservation(null)}
            >
              <X size={18} />
            </button>
            <div className="success-icon"><CheckCircle2 size={34} /></div>
            <p className="eyebrow">Reservasi berhasil</p>
            <h2 id="reservation-success-title">Jadwalmu sudah tersimpan</h2>
            <p>
              {treatment.name} pada {reservation.customer.visitDate}, pukul{' '}
              {reservation.customer.visitTime}. Tunjukkan QR berikut saat datang.
            </p>
            <div className="qr-panel">
              <QRCodeSVG
                value={`JHARMY:${reservation.reservationCode}`}
                size={184}
                level="H"
                marginSize={2}
                title={`QR reservasi ${reservation.reservationCode}`}
              />
              <div>
                <QrCode size={22} />
                <span>Kode reservasi</span>
                <strong>{reservation.reservationCode}</strong>
              </div>
            </div>
            <div className="button-row centered">
              <Link to="/dashboard" className="btn-primary">Buka Dashboard</Link>
              <button type="button" className="btn-secondary" onClick={() => setReservation(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
