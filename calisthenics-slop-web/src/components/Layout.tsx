import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { SeriesCardLink } from './SeriesCardLink';
import { ConfettiOverlay } from './ConfettiOverlay';
import { SERIES_NAMES } from '../types';

function useMobileHeader(): { title: string; showBack: boolean; backTo: string } {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/' || path === '') return { title: 'SLOP TRACKER', showBack: false, backTo: '/' };
  if (path === '/about') return { title: 'ABOUT', showBack: true, backTo: '/' };

  // /series/2/progression/xxx/history → back to progression detail
  const historyMatch = path.match(/^(\/series\/\d+\/progression\/.+)\/history$/);
  if (historyMatch) return { title: 'HISTORY', showBack: true, backTo: historyMatch[1] };

  // /series/2/progression/xxx → back to series list
  const progMatch = path.match(/^(\/series\/(\d+))\/progression/);
  if (progMatch) {
    const name = SERIES_NAMES[Number(progMatch[2]) - 1] ?? 'SERIES';
    return { title: name.toUpperCase(), showBack: true, backTo: progMatch[1] };
  }

  // /series/2 → back to home
  const seriesMatch = path.match(/^\/series\/(\d+)$/);
  if (seriesMatch) {
    const name = SERIES_NAMES[Number(seriesMatch[1]) - 1] ?? 'SERIES';
    return { title: name.toUpperCase(), showBack: true, backTo: '/' };
  }

  return { title: 'SLOP TRACKER', showBack: false, backTo: '/' };
}

export function Layout() {
  const app = useApp();
  const navigate = useNavigate();
  const { title, showBack, backTo } = useMobileHeader();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="app-shell">
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="sidebar-title">CALISTHENICS <span>SLOP</span></div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {[1, 2, 3, 4, 5, 6].map(id => (
            <SeriesCardLink key={id} seriesId={id} compact />
          ))}
        </nav>

        <div className="sidebar-footer">
          {app.user?.email && (
            <div className="sidebar-user-chip">
              <div className="sidebar-user-email">{app.user.email}</div>
            </div>
          )}
          <Link to="/about" className="btn btn-muted">ABOUT</Link>
          <button
            className="btn btn-danger"
            onClick={async () => { await app.signOut(); navigate('/'); }}
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="main-content">
        {/* Mobile top bar */}
        <header className="mobile-header">
          <div className="mobile-header-left">
            {showBack ? (
              <button
                className="icon-btn"
                onClick={() => navigate(backTo)}
                aria-label="Back"
                style={{ background: 'transparent' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            ) : null}
          </div>
          <span className="mobile-header-title">{title}</span>
          <div className="mobile-header-right">
            {!showBack && (
              <button
                className="icon-btn"
                onClick={() => setShowProfile(p => !p)}
                aria-label="Profile"
                style={{ background: 'transparent' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Mobile profile sheet */}
        {showProfile && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowProfile(false)}>
            <div className="modal-sheet">
              <div className="modal-header">
                <span className="modal-title">PROFILE</span>
                <button
                  style={{ fontFamily: 'var(--mono)', fontSize: 'var(--fs-sm)', color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowProfile(false)}
                >
                  ✕
                </button>
              </div>
              {app.user?.email && (
                <div style={{ margin: 16 }}>
                  <div className="card" style={{ padding: 16 }}>
                    <div className="section-label">LOGGED IN AS</div>
                    <div>{app.user.email}</div>
                  </div>
                </div>
              )}
              <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/about" className="btn btn-muted" onClick={() => setShowProfile(false)}>ABOUT</Link>
                <button className="btn btn-danger" onClick={async () => { await app.signOut(); setShowProfile(false); }}>
                  SIGN OUT
                </button>
              </div>
            </div>
          </div>
        )}

        <Outlet />
      </div>

      <ConfettiOverlay />
    </div>
  );
}
