import React, { useState } from 'react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (password?: string) => Promise<void>;
  userEmail: string | null;
  isGoogleUser: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  userEmail,
  isGoogleUser
}) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';
  const isAuthReady = isGoogleUser || password.length >= 6;
  const canSubmit = isConfirmed && isAuthReady && !deleting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg(null);
    setDeleting(true);

    try {
      await onConfirmDelete(isGoogleUser ? undefined : password);
      // Clean teardown and redirect will be handled by AuthContext onAuthStateChanged
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          background: 'var(--bg-surface)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.12)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 12px'
            }}
          >
            ⚠️
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            Delete FitFam Account
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', fontWeight: 600, margin: 0 }}>
            Permanent & Irreversible Account Purge
          </p>
        </div>

        <div
          style={{
            padding: '14px 16px',
            background: 'rgba(244, 63, 94, 0.08)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            lineHeight: 1.5
          }}
        >
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
            This action will permanently delete:
          </strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
            <li>Your account profile for <strong>{userEmail}</strong></li>
            <li>All household family member profiles</li>
            <li>All historical weigh-in records and trends</li>
          </ul>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Note: This is different from deactivating an individual family member. Account deletion erases all data forever.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--accent-rose)',
              color: '#fda4af',
              fontSize: '0.82rem',
              marginBottom: '16px',
              lineHeight: 1.4
            }}
          >
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Auth Verification */}
          {!isGoogleUser ? (
            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 600
                }}
              >
                Re-enter Password to Confirm Identity *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={deleting}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.03)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)'
              }}
            >
              🔐 Google Account: Clicking <strong>Permanently Delete</strong> will re-authenticate with Google to authorize deletion.
            </div>
          )}

          {/* Confirmation Text Entry */}
          <div>
            <label
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '6px',
                fontWeight: 600
              }}
            >
              Type <strong>DELETE</strong> below to enable deletion *
            </label>
            <input
              type="text"
              required
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-deep)',
                border: isConfirmed ? '1px solid var(--accent-rose)' : '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                fontWeight: 700
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={deleting}
              style={{ flex: 1, padding: '12px', fontSize: '0.88rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                flex: 1.2,
                padding: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: canSubmit ? 'var(--accent-rose)' : 'rgba(244, 63, 94, 0.3)',
                color: '#ffffff',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {deleting ? 'Purging Account Data...' : 'Permanently Delete My Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
