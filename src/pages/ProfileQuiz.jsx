import { useState } from 'react';
import { ArrowRight, ClipboardList, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { articleProfileExample, profileOptions } from '../utils/recommendationEngine';

export default function ProfileQuiz({ setPreferences }) {
  const navigate = useNavigate();
  const [area, setArea] = useState(articleProfileExample.area);
  const [skinType, setSkinType] = useState(articleProfileExample.skinType);
  const [problems, setProblems] = useState(articleProfileExample.problems);
  const [goal, setGoal] = useState(articleProfileExample.goal);
  const [history, setHistory] = useState(articleProfileExample.history);

  const setArticleExample = () => {
    setArea(articleProfileExample.area);
    setSkinType(articleProfileExample.skinType);
    setProblems(articleProfileExample.problems);
    setGoal(articleProfileExample.goal);
    setHistory(articleProfileExample.history);
  };

  const handleProblemChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setProblems((current) => Array.from(new Set([...current, value])));
    } else {
      setProblems((current) => current.filter((problem) => problem !== value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPreferences({
      area,
      skinType: area === 'Wajah' ? skinType : '',
      problems,
      goal,
      history,
    });
    navigate('/recommendations');
  };

  return (
    <div className="container" style={{ padding: '56px 24px 72px', maxWidth: '1120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div style={{ maxWidth: '680px' }}>
          <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.6px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '12px' }}>
            Konsultasi Jharmy Salon
          </p>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '14px' }}>Profil Kebutuhan Pelanggan</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
            Isi kondisi utama pelanggan sebelum treatment. Jawaban ini akan dicocokkan dengan atribut layanan salon seperti pada data penelitian.
          </p>
        </div>
        <button type="button" onClick={setArticleExample} className="btn-secondary" style={{ gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
          <RotateCcw size={16} />
          Contoh Artikel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '32px', alignItems: 'start' }}>
        <aside style={{ position: 'sticky', top: '24px' }}>
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', minHeight: '620px', backgroundColor: '#E8E5E1' }}>
            <img
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=900"
              alt="Perlengkapan perawatan salon"
              style={{ width: '100%', height: '620px', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', left: '24px', right: '24px', bottom: '24px', backgroundColor: 'rgba(255,255,255,0.94)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>
                <ClipboardList size={18} />
                Data konsultasi
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Profil pelanggan dibentuk dari area perawatan, jenis kulit, permasalahan, tujuan, dan riwayat treatment.
              </p>
            </div>
          </div>
        </aside>

        <div className="card" style={{ padding: '36px', borderRadius: '8px' }}>
          <form onSubmit={handleSubmit}>
            <section style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                01. Area Perawatan
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                {profileOptions.areas.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={area === type}
                    onClick={() => setArea(type)}
                    style={{
                      minHeight: '46px',
                      padding: '10px 12px',
                      border: `1px solid ${area === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: '8px',
                      backgroundColor: area === type ? '#F6EDED' : '#FFF',
                      color: area === type ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontWeight: area === type ? 700 : 500,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                02. Jenis Kulit Wajah
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                disabled={area !== 'Wajah'}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: area === 'Wajah' ? '#FFF' : '#F3EFEA',
                  color: area === 'Wajah' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  fontFamily: 'inherit',
                }}
                required={area === 'Wajah'}
              >
                {profileOptions.skinTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                03. Permasalahan Utama
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                {profileOptions.problems.map((problem) => (
                  <label key={problem} style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px', backgroundColor: problems.includes(problem) ? '#FAF7F7' : '#FFF' }}>
                    <input
                      type="checkbox"
                      value={problem}
                      checked={problems.includes(problem)}
                      onChange={handleProblemChange}
                      style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', flexShrink: 0 }}
                    />
                    {problem}
                  </label>
                ))}
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '40px' }}>
              <section>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  04. Tujuan Perawatan
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profileOptions.goals.map((item) => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="goal"
                        value={item}
                        checked={goal === item}
                        onChange={(e) => setGoal(e.target.value)}
                        style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  05. Riwayat Treatment
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profileOptions.histories.map((item) => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="history"
                        value={item}
                        checked={history === item}
                        onChange={(e) => setHistory(e.target.value)}
                        style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1rem' }}>
              <Sparkles size={18} />
              Dapatkan Rekomendasi
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
