import { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, UserPlus, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function Login({ currentUser, onLogin, onRegisterCustomer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') === 'admin' ? 'admin' : 'customer';
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(requestedRole);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: requestedRole === 'admin' ? 'admin@jharmysalon.local' : '',
    password: requestedRole === 'admin' ? 'admin123' : '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (requestedRole === 'admin' && currentUser?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
    if (requestedRole === 'customer' && currentUser?.role === 'customer') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate, requestedRole]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setMode('login');
    setMessage('');
    setForm((current) => ({
      ...current,
      email: nextRole === 'admin' ? 'admin@jharmysalon.local' : '',
      password: nextRole === 'admin' ? 'admin123' : '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (mode === 'register') {
      if (form.password.length < 6) {
        setMessage('Password minimal 6 karakter.');
        return;
      }

      const result = await onRegisterCustomer(form);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      navigate('/dashboard');
      return;
    }

    const result = await onLogin({
      email: form.email,
      password: form.password,
      role,
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Akses pengguna</p>
          <h1>{mode === 'register' ? 'Daftar Pelanggan' : 'Login Jharmy Salon'}</h1>
          <p>
            Pelanggan yang login dapat melihat riwayat konsultasi sendiri. Tamu
            tetap bisa langsung konsultasi tanpa membuat akun.
          </p>
        </div>

        <div className="segmented-control">
          <button
            type="button"
            className={role === 'customer' ? 'active' : ''}
            onClick={() => handleRoleChange('customer')}
          >
            <UserRound size={16} />
            Pelanggan
          </button>
          <button
            type="button"
            className={role === 'admin' ? 'active' : ''}
            onClick={() => handleRoleChange('admin')}
          >
            <LockKeyhole size={16} />
            Admin
          </button>
        </div>

        {role === 'customer' && (
          <div className="auth-mode-row">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Daftar Akun
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && role === 'customer' && (
            <>
              <label className="field">
                <span>Nama pelanggan</span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateForm('fullName', event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Nomor WhatsApp</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateForm('phone', event.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
              required
            />
          </label>

          {message && <p className="form-error">{message}</p>}

          <button type="submit" className="btn-primary wide-button">
            {mode === 'register' ? <UserPlus size={18} /> : <LockKeyhole size={18} />}
            {mode === 'register' ? 'Daftar & Masuk' : 'Masuk'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/quiz" className="text-link">
            Konsultasi tanpa login
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
