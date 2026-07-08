import { HelpCircle, LayoutDashboard, ListChecks, LogOut, Plus, Settings, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    { label: 'Dasbor', path: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Treatment', path: '/admin/inventory', icon: ListChecks },
    { label: 'Data Pelanggan', path: '/admin/users', icon: Users },
    { label: 'Pengaturan', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#F3EFEA',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--color-border)',
    }}>
      <div style={{ padding: '30px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '4px' }}>Jharmy Salon</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Portal Rekomendasi</p>
      </div>

      <nav style={{ flex: 1, padding: '22px 0' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const isActive = path === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 24px',
                    backgroundColor: isActive ? '#E5CDCC' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: '22px', borderTop: '1px solid var(--color-border)' }}>
        <button className="btn-primary" type="button" style={{
          width: '100%',
          marginBottom: '22px',
          padding: '12px',
        }}>
          <Plus size={17} />
          Tambah Treatment
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button type="button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
            <HelpCircle size={18} />
            Pusat Bantuan
          </button>
          <Link to="/" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
            <LogOut size={18} />
            Keluar
          </Link>
        </div>
      </div>
    </aside>
  );
}
