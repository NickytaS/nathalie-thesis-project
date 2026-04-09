import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import logoMark from '../assets/Logo.png';
import { RouteMeta } from './RouteMeta';

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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
            <NavLink to="/evidence" className={navLinkClass}>
              Evidence
            </NavLink>
            <NavLink to="/compare" className={navLinkClass}>
              Compare
            </NavLink>
            <NavLink to="/reproducibility" className={navLinkClass}>
              Reproduce
            </NavLink>
          </div>

          <div className="nav-actions">
            <NavLink to="/evaluator" className="btn btn-primary btn-nav-cta">
              Start evaluation
            </NavLink>
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
          <p className="footer-title">Database Migration Tool Evaluator</p>
          <p className="footer-note">
            Thesis decision-support prototype — scores and scenario outcomes align with the experiments and datasets in this repository.
          </p>
        </div>
      </footer>
    </>
  );
}
