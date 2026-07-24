import { useMemo, useState } from 'react';
import { MessageCircle, QrCode, Save, Search, Trash2, Users } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { getRecommendations } from '../../utils/recommendationEngine';

const statusOptions = [
  'Rekomendasi saja',
  'Menunggu konfirmasi salon',
  'Akan datang',
  'Sudah melakukan perawatan',
  'Dibatalkan',
];

function resolveTreatment(consultation, treatments) {
  return (
    treatments.find((item) => item.id === consultation.selectedTreatmentId) ||
    treatments.find((item) => item.id === consultation.recommendedTreatmentId) ||
    getRecommendations(consultation.preferences, treatments)[0] ||
    null
  );
}

function formatDateTime(customer) {
  if (!customer?.visitDate) return '-';
  return `${customer.visitDate}${customer.visitTime ? `, ${customer.visitTime}` : ''}`;
}

function whatsappLink(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '#';
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

export default function Customers({
  consultations = [],
  treatments = [],
  onUpdateStatus,
  onSaveSalonNote,
  onDeleteConsultation,
  onLogout,
}) {
  const [query, setQuery] = useState('');

  const filteredConsultations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return consultations;

    return consultations.filter((consultation) => {
      const treatment = resolveTreatment(consultation, treatments);
      return [
        consultation.customer.name,
        consultation.customer.phone,
        consultation.preferences.area,
        consultation.preferences.goal,
        consultation.status,
        treatment?.name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [consultations, query, treatments]);

  const waitingCount = consultations.filter((item) =>
    item.status.toLowerCase().includes('menunggu')
  ).length;

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={onLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Data pelanggan</p>
            <h1>Kelola Konsultasi</h1>
            <p>Lihat pelanggan yang mengisi konsultasi, hubungi lewat WhatsApp, dan perbarui status booking.</p>
          </div>
          <div className="admin-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                type="text"
                placeholder="Cari pelanggan..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="metric-grid three">
          {[
            { label: 'Total Konsultasi', value: consultations.length, helper: 'Semua data' },
            { label: 'Perlu Follow Up', value: waitingCount, helper: 'Menunggu salon' },
            { label: 'Pelanggan Unik', value: new Set(consultations.map((item) => item.customer.phone || item.customer.name)).size, helper: 'Berdasarkan kontak' },
          ].map((stat) => (
            <article key={stat.label} className="metric-card">
              <div>
                <span className="metric-icon"><Users size={18} /></span>
                <span className="metric-helper">{stat.helper}</span>
              </div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>

        <section className="admin-card table-card">
          {filteredConsultations.length ? (
            <>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pelanggan</th>
                      <th>Jadwal</th>
                      <th>Kebutuhan</th>
                      <th>Treatment Pilihan</th>
                      <th>Status & QR</th>
                      <th>Catatan Salon</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map((consultation) => {
                      const treatment = resolveTreatment(consultation, treatments);
                      return (
                        <tr key={consultation.id}>
                          <td>
                            <div className="customer-cell">
                              <div className="customer-initial">
                                {consultation.customer.name.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <strong>{consultation.customer.name}</strong>
                                <span>{consultation.customer.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td>{formatDateTime(consultation.customer)}</td>
                          <td>
                            <div className="tag-list">
                              <span>{consultation.preferences.area}</span>
                              <span>{consultation.preferences.goal}</span>
                            </div>
                          </td>
                          <td>{treatment?.name || '-'}</td>
                          <td>
                            <select
                              className="status-select"
                              value={consultation.status}
                              onChange={(event) => onUpdateStatus(consultation.id, event.target.value)}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            {consultation.reservationCode && (
                              <span className="reservation-code-small">
                                <QrCode size={14} />
                                {consultation.reservationCode}
                              </span>
                            )}
                          </td>
                          <td>
                            <SalonNoteEditor
                              consultation={consultation}
                              onSave={onSaveSalonNote}
                            />
                          </td>
                          <td>
                            <div className="action-row">
                              <a
                                className="icon-button"
                                href={whatsappLink(consultation.customer.phone)}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Hubungi ${consultation.customer.name}`}
                              >
                                <MessageCircle size={17} />
                              </a>
                              <button
                                type="button"
                                className="icon-button danger"
                                aria-label={`Hapus konsultasi ${consultation.customer.name}`}
                                onClick={() => onDeleteConsultation(consultation.id)}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>Menampilkan {filteredConsultations.length} dari {consultations.length} konsultasi</span>
                <span>Gunakan status untuk memantau tindak lanjut pelanggan.</span>
              </div>
            </>
          ) : (
            <div className="empty-state large">
              <Users size={34} />
              <h2>Belum Ada Data Pelanggan</h2>
              <p>Data akan muncul setelah pelanggan mengisi formulir konsultasi pada website.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SalonNoteEditor({ consultation, onSave }) {
  const [note, setNote] = useState(consultation.salonNote || '');
  const [message, setMessage] = useState('');

  const save = async () => {
    try {
      await onSave(consultation.id, note);
      setMessage('Tersimpan');
    } catch (error) {
      setMessage(error.message || 'Gagal');
    }
  };

  return (
    <div className="salon-note-editor">
      <textarea
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setMessage('');
        }}
        placeholder="Catatan untuk pelanggan..."
        rows={2}
      />
      <button type="button" className="text-link" onClick={save}>
        <Save size={14} />
        Simpan
      </button>
      {message && <small>{message}</small>}
    </div>
  );
}
