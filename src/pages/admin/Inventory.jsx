import { useMemo, useState } from 'react';
import { MoreVertical, Plus, Search, Scissors } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { getAttributeCodes, treatments } from '../../utils/recommendationEngine';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const [query, setQuery] = useState('');

  const filteredTreatments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return treatments;

    return treatments.filter((item) =>
      [item.name, item.category, item.articleDescription, ...item.attributes]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [query]);

  const averagePrice = Math.round(
    treatments.reduce((total, item) => total + item.price, 0) / treatments.length
  );

  return (
    <div style={{ display: 'flex', backgroundColor: '#F9F8F6', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ marginLeft: '260px', flex: 1, padding: '44px', maxWidth: '1280px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px', marginBottom: '34px' }}>
          <div style={{ maxWidth: '680px' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.6px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '10px' }}>
              Data master artikel
            </p>
            <h1 style={{ fontSize: '2.35rem', marginBottom: '8px', color: 'var(--color-text-main)' }}>Kelola Treatment</h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Daftar layanan, kategori, deskripsi singkat, dan atribut rekomendasi yang digunakan pada proses cosine similarity.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Cari treatment..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ padding: '12px 16px 12px 42px', width: '280px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <button className="btn-primary" type="button">
              <Plus size={17} />
              Treatment
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Layanan', value: treatments.length, badge: 'Aktif' },
            { label: 'Rata-rata Harga', value: currency.format(averagePrice), badge: 'Operasional' },
            { label: 'Atribut Item', value: 'A1-A21', badge: 'Artikel' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '24px', borderRadius: '8px', boxShadow: 'none', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#FAF7F2', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
                  <Scissors size={18} />
                </div>
                <span className="badge gold">{stat.badge}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700 }}>{stat.label}</p>
              <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)', margin: 0 }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAF8F5' }}>
                <HeaderCell>Nama Treatment</HeaderCell>
                <HeaderCell>Kategori</HeaderCell>
                <HeaderCell>Deskripsi Singkat</HeaderCell>
                <HeaderCell>Atribut</HeaderCell>
                <HeaderCell>Harga</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Aksi</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: '210px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.06rem' }}>{item.name}</span>
                  </td>
                  <BodyCell>
                    <span style={{ backgroundColor: '#F3EFEA', padding: '6px 12px', borderRadius: '999px', fontSize: '0.82rem' }}>{item.category}</span>
                  </BodyCell>
                  <BodyCell>{item.articleDescription}</BodyCell>
                  <BodyCell>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '260px' }}>
                      {getAttributeCodes(item.attributes).map((code, index) => (
                        <span key={`${item.id}-${code}-${index}`} className="badge rose" style={{ padding: '3px 8px' }}>
                          {code === '-' ? item.attributes[index] : code}
                        </span>
                      ))}
                    </div>
                  </BodyCell>
                  <BodyCell><strong>{currency.format(item.price)}</strong></BodyCell>
                  <BodyCell>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                      {item.status}
                    </span>
                  </BodyCell>
                  <BodyCell>
                    <button type="button" aria-label={`Aksi ${item.name}`} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      <MoreVertical size={18} />
                    </button>
                  </BodyCell>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Menampilkan {filteredTreatments.length} dari {treatments.length} treatment
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Sumber data: Tabel 2 dan Tabel 4 artikel
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function HeaderCell({ children }) {
  return (
    <th style={{ padding: '18px 20px', fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}

function BodyCell({ children }) {
  return (
    <td style={{ padding: '18px 20px', color: 'var(--color-text-main)', fontSize: '0.88rem', verticalAlign: 'middle' }}>
      {children}
    </td>
  );
}
