import { ClipboardList, LogOut, Scissors, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ currentUser = null, hasConsultation = false, onLogout }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const linkClass = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');
  const isCustomer = currentUser?.role === 'customer';

  return (
    <nav className="site-nav">
      <Link to="/" className="brand-link">
        Jharmy Salon
      </Link>

      <div className="nav-links">
        <Link to="/" className={linkClass('/')}>Beranda</Link>
        <Link to="/treatments" className={linkClass('/treatments')}>Perawatan</Link>
        <Link to="/quiz" className={linkClass('/quiz')}>Konsultasi</Link>
        {hasConsultation && (
          <Link to="/recommendations" className={linkClass('/recommendations')}>
            Rekomendasi Saya
          </Link>
        )}
        {isCustomer && (
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
        )}
      </div>

      <div className="nav-actions">
        {isCustomer ? (
          <>
            <Link to="/dashboard" className="user-chip">
              <UserRound size={16} />
              {currentUser.fullName}
            </Link>
            <button type="button" className="icon-button" aria-label="Keluar" onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-secondary">
            <UserRound size={17} />
            Login
          </Link>
        )}
        <Link to="/treatments" className="icon-button" aria-label="Lihat perawatan">
          <Scissors size={18} />
        </Link>
        <Link to="/quiz" className="btn-primary">
          <ClipboardList size={17} />
          Mulai Konsultasi
        </Link>
      </div>
    </nav>
  );
}
