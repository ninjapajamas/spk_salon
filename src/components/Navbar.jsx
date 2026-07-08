import { ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-light)', borderBottom: '1px solid rgba(232,229,225,0.7)' }}>
      <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 600 }}>
        Jharmy Salon
      </Link>
      <div style={{ display: 'flex', gap: '28px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
        <Link to="/" style={{ color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>Beranda</Link>
        <Link to="/quiz" style={{ color: location.pathname === '/quiz' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>Konsultasi</Link>
        <Link to="/recommendations" style={{ color: location.pathname === '/recommendations' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>Contoh Hasil</Link>
        <Link to="/admin" style={{ color: 'var(--color-text-muted)' }}>Admin</Link>
      </div>
      <Link to="/quiz" className="btn-primary">
        <ClipboardList size={17} />
        Mulai Konsultasi
      </Link>
    </nav>
  );
}
