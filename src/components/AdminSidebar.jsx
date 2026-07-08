import { Home, LayoutDashboard, ListChecks, LogOut, Plus, Tags, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar({ onLogout }) {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    { label: 'Dasbor', path: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Treatment', path: '/admin/inventory', icon: ListChecks },
    { label: 'Kelola Atribut', path: '/admin/attributes', icon: Tags },
    { label: 'Data Pelanggan', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <h2>Jharmy Salon</h2>
        <p>Portal Operasional</p>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item) => {
          const isActive = path === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={isActive ? 'admin-nav-link active' : 'admin-nav-link'}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/admin/inventory" className="btn-primary wide-button">
          <Plus size={17} />
          Treatment
        </Link>
        <Link to="/" className="admin-nav-link compact">
          <Home size={18} />
          Lihat Website
        </Link>
        <button type="button" className="admin-nav-link compact" onClick={onLogout}>
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
