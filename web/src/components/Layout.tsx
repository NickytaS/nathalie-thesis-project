import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logoMark from '../assets/Logo.png';
import { useAuth } from '../context/AuthContext';
import { RouteMeta } from './RouteMeta';
import { UserAvatar } from './UserAvatar';

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <RouteMeta />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {menuOpen && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="nav-shell">
        <nav className="site-nav" aria-label="Main">
          <Link to="/" className="logo" aria-label="Migration Tool Evaluator — Home">
            <img src={logoMark} alt="" className="logo-mark" width={40} height={40} decoding="async" />
          </Link>

          <div
            id="mobile-nav-panel"
            className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}
            role="navigation"
            aria-label="Sections"
          >
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/methodology" className={navLinkClass}>
              Methodology
            </NavLink>
            <NavLink to="/compare" className={navLinkClass}>
              Compare
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>
            <NavLink to="/help" className={navLinkClass}>
              Help
            </NavLink>
          </div>

          <div className="nav-actions">
            {loading ? (
              <span className="btn btn-secondary nav-login" style={{ opacity: 0.65, pointerEvents: 'none' }} aria-hidden>
                …
              </span>
            ) : (
              <>
                {user ? (
                  <button
                    type="button"
                    className="btn btn-secondary nav-login"
                    onClick={() => void logout().then(() => navigate('/'))}
                  >
                    Sign out
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `btn btn-secondary nav-login${isActive ? ' nav-login--active' : ''}`}
                  >
                    Log in
                  </NavLink>
                )}
              </>
            )}
            <NavLink to="/evaluator" className="btn btn-primary btn-nav-cta">
              Start evaluation
            </NavLink>
            {user && (
              <Link to="/profile" className="nav-avatar-slot" aria-label="Open profile">
                <UserAvatar email={user.email} displayName={user.displayName} avatarUrl={user.avatarUrl} size={30} />
              </Link>
            )}
            <button
              type="button"
              className={`nav-toggle ${menuOpen ? 'nav-toggle--open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              id="nav-menu-button"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </nav>
      </div>
      <main id="main-content" className="page-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <p className="footer-title">Migration Tool Evaluator</p>
          <p className="footer-note">
            Decision-support for picking migration tools — scores and scenario outcomes align with the experiments and datasets in this repository.
          </p>
        </div>
      </footer>
    </>
  );
}
