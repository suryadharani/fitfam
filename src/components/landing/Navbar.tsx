import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();

  return (
    <header className="site-header" style={{ padding: '16px 0', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-glass)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="./" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.8rem' }}>🌿</span>
          <div>
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>FitFam</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Family Weigh-In</span>
          </div>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-mint)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                👤 {user.email || user.displayName || 'Authenticated User'}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => logout()}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenAuth('signin')}
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onOpenAuth('signup')}
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
