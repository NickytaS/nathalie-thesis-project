import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';

export function Login() {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await login(email, password);
      else await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Account</h1>
        <p className="page-lead">You are signed in as {user.email}.</p>
        <div className="profile-card" style={{ marginTop: '1.75rem' }}>
          <div className="profile-avatar-row">
            <UserAvatar email={user.email} displayName={user.displayName} avatarUrl={user.avatarUrl} size={44} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Link to="/profile">Manage profile</Link> to set a display name and custom avatar URL.
            </div>
          </div>
          <p className="profile-card__subtitle" style={{ marginBottom: '1rem' }}>
            Your session is stored in a secure cookie. Each time you finish the evaluator while signed in, your
            recommendation is also saved to your account. The current tab still keeps a copy in session storage until
            you close it.
          </p>
          <button
            type="button"
            className="btn btn-secondary profile-save"
            onClick={() => void logout().then(() => navigate('/login'))}
          >
            Sign out
          </button>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Link to="/evaluator" className="show-reasoning" style={{ display: 'inline' }}>
            Start the evaluation
          </Link>{' '}
          or return{' '}
          <Link to="/" className="show-reasoning" style={{ display: 'inline' }}>
            home
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="section page-pad auth-page">
      <div className="auth-page__content">
        <h1 className="page-title">{mode === 'signin' ? 'Log in' : 'Create account'}</h1>
        <p className="page-lead">
          {mode === 'signin'
            ? 'Sign in to save your account on this device. The server stores a hashed password in a local SQLite database.'
            : 'Create an account with email and password (minimum 8 characters).'}
        </p>

        <div className="profile-card" style={{ marginTop: '1.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${mode === 'signin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={(e) => void onSubmit(e)}>
            <h2 className="profile-card__title">{mode === 'signin' ? 'Sign in' : 'New account'}</h2>
            {error && (
              <p role="alert" style={{ color: 'var(--accent-warm, #c45c3e)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                {error}
              </p>
            )}

            <label className="profile-field-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="profile-input"
              type="email"
              autoComplete={mode === 'signin' ? 'username' : 'email'}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={busy}
            />

            <label className="profile-field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="profile-input"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'register' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={busy}
            />

            <button type="submit" className="btn btn-primary profile-save" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Link to="/evaluator" className="show-reasoning" style={{ display: 'inline' }}>
            Start the evaluation
          </Link>{' '}
          without an account, or return{' '}
          <Link to="/" className="show-reasoning" style={{ display: 'inline' }}>
            home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
