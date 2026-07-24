import { useState } from 'react';
import { ArrowRight, CalendarClock, ClipboardList, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profileOptions } from '../utils/recommendationEngine';

const problemsByArea = {
  Wajah: ['Komedo', 'Kulit kusam', 'Kulit berminyak', 'Wajah lelah'],
  Rambut: ['Rambut kering', 'Rambut rusak', 'Rambut bercabang'],
  'Kuku tangan': ['Kuku kusam'],
  'Kuku kaki': ['Kaki kering'],
};

const goalsByArea = {
  Wajah: ['Membersihkan wajah', 'Nutrisi kulit', 'Relaksasi wajah'],
  Rambut: ['Nutrisi rambut', 'Penguatan rambut', 'Melembutkan rambut'],
  'Kuku tangan': ['Kebersihan kuku'],
  'Kuku kaki': ['Kesehatan kaki'],
};

function todayInputValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export default function ProfileQuiz({ currentUser, onCreateConsultation }) {
  const navigate = useNavigate();
  const loggedCustomer = currentUser?.role === 'customer' ? currentUser : null;
  const [customer, setCustomer] = useState({
    name: loggedCustomer?.fullName || '',
    phone: loggedCustomer?.phone || '',
    visitDate: todayInputValue(),
    visitTime: '10:00',
    notes: '',
  });
  const [area, setArea] = useState('Wajah');
  const [skinType, setSkinType] = useState('');
  const [problems, setProblems] = useState([]);
  const [goal, setGoal] = useState('');
  const [history, setHistory] = useState('Belum pernah facial');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleProblems = problemsByArea[area] || profileOptions.problems;
  const visibleGoals = goalsByArea[area] || profileOptions.goals;

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const handleAreaChange = (nextArea) => {
    setArea(nextArea);
    setProblems([]);
    setGoal('');
    if (nextArea !== 'Wajah') {
      setSkinType('');
    }
  };

  const handleProblemChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      setProblems((current) => Array.from(new Set([...current, value])));
    } else {
      setProblems((current) => current.filter((problem) => problem !== value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (area === 'Wajah' && !skinType) {
      setError('Pilih jenis kulit wajah pelanggan terlebih dahulu.');
      return;
    }

    if (!problems.length) {
      setError('Pilih minimal satu kondisi atau masalah utama pelanggan.');
      return;
    }

    if (!goal) {
      setError('Pilih tujuan perawatan pelanggan.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await onCreateConsultation({
        customer: {
          ...customer,
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: loggedCustomer?.email || '',
        },
        preferences: {
          area,
          skinType: area === 'Wajah' ? skinType : '',
          problems,
          goal,
          history,
          notes: customer.notes.trim(),
        },
      });
      navigate('/recommendations');
    } catch (submitError) {
      setError(submitError.message || 'Konsultasi gagal disimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container page-space">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Konsultasi pelanggan</p>
          <h1>Data Kebutuhan Treatment</h1>
          <p>
            Isi kebutuhan perawatan untuk mendapat rekomendasi. Kamu tidak perlu
            login; jadwal reservasi dipilih setelah menentukan treatment.
          </p>
        </div>
        {loggedCustomer && (
          <span className="user-chip">
            Konsultasi sebagai {loggedCustomer.fullName}
          </span>
        )}
      </div>

      <div className="consultation-layout">
        <aside className="consultation-panel">
          <img
            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=900"
            alt="Perlengkapan perawatan salon"
          />
          <div>
            <div className="panel-title">
              <ClipboardList size={18} />
              Konsultasi salon
            </div>
            <p>
              Konsultasi bebas login. Akun pelanggan baru diperlukan saat kamu
              ingin mengamankan jadwal reservasi.
            </p>
          </div>
        </aside>

        <form className="form-card" onSubmit={handleSubmit}>
          <section>
            <div className="form-section-title">
              <CalendarClock size={18} />
              Data Pelanggan
            </div>
            <div className="form-grid two">
              <label className="field">
                <span>Nama pelanggan</span>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(event) => updateCustomer('name', event.target.value)}
                  placeholder="Contoh: Siti Rahma"
                  required
                  readOnly={Boolean(loggedCustomer)}
                />
              </label>
              <label className="field">
                <span>Nomor WhatsApp</span>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(event) => updateCustomer('phone', event.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                  readOnly={Boolean(loggedCustomer)}
                />
              </label>
              <label className="field">
                <span>Rencana tanggal kunjungan</span>
                <input
                  type="date"
                  value={customer.visitDate}
                  onChange={(event) => updateCustomer('visitDate', event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Rencana jam kunjungan</span>
                <input
                  type="time"
                  value={customer.visitTime}
                  onChange={(event) => updateCustomer('visitTime', event.target.value)}
                  required
                />
              </label>
            </div>
          </section>

          <section>
            <div className="form-section-title">Area Perawatan</div>
            <div className="choice-grid four">
              {profileOptions.areas.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={area === type}
                  className={area === type ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleAreaChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          {area === 'Wajah' && (
            <section>
              <label className="field">
                <span>Jenis kulit wajah</span>
                <select
                  value={skinType}
                  onChange={(event) => setSkinType(event.target.value)}
                  required
                >
                  <option value="">Pilih jenis kulit</option>
                  {profileOptions.skinTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
            </section>
          )}

          <section>
            <div className="form-section-title">Permasalahan Utama</div>
            <div className="choice-grid three">
              {visibleProblems.map((problem) => (
                <label key={problem} className="checkbox-pill">
                  <input
                    type="checkbox"
                    value={problem}
                    checked={problems.includes(problem)}
                    onChange={handleProblemChange}
                  />
                  {problem}
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="form-section-title">Tujuan Perawatan</div>
            <div className="choice-grid three">
              {visibleGoals.map((item) => (
                <label key={item} className="radio-pill">
                  <input
                    type="radio"
                    name="goal"
                    value={item}
                    checked={goal === item}
                    onChange={(event) => setGoal(event.target.value)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="form-grid two">
              <label className="field">
                <span>Riwayat treatment</span>
                <select value={history} onChange={(event) => setHistory(event.target.value)}>
                  {profileOptions.histories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Catatan tambahan</span>
                <textarea
                  value={customer.notes}
                  onChange={(event) => updateCustomer('notes', event.target.value)}
                  placeholder="Alergi, preferensi stylist, atau catatan lain"
                  rows={3}
                />
              </label>
            </div>
          </section>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary wide-button" disabled={isSubmitting}>
            <Sparkles size={18} />
            {isSubmitting ? 'Menyimpan Konsultasi...' : 'Lihat Rekomendasi'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
