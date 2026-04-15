import { Link } from 'react-router-dom';

/**
 * Placeholder login screen for the thesis companion site.
 * There is no user database; the evaluator stores results in the browser session only.
 */
export function Login() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Log in</h1>
      <p className="page-lead">This deployment does not connect to an account service — you can use the site without signing in.</p>

      <div className="profile-card" style={{ marginTop: '1.75rem' }}>
        <h2 className="profile-card__title">Sign in</h2>
        <p className="profile-card__subtitle">Email and password fields are disabled until a backend is configured.</p>

        <label className="profile-field-label" htmlFor="login-email">
          Email
        </label>
        <input id="login-email" className="profile-input" type="email" autoComplete="username" disabled placeholder="you@example.com" />

        <label className="profile-field-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className="profile-input"
          type="password"
          autoComplete="current-password"
          disabled
          placeholder="••••••••"
        />

        <button type="button" className="btn btn-primary profile-save" disabled>
          Log in
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
