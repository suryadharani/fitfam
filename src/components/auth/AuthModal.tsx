import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup' | 'reset';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    error: authError,
    clearError
  } = useAuth();

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    setLocalError(null);
    setResetSent(false);
    clearError();
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Error is set in AuthContext or local state
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSent(false);

    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      try {
        setSubmitting(true);
        await resetPassword(email);
        setResetSent(true);
      } catch (err: unknown) {
        setLocalError((err as Error).message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      try {
        setSubmitting(true);
        await signUpWithEmail(email, password);
        onClose();
      } catch (err: unknown) {
        setLocalError((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    } else if (mode === 'signin') {
      try {
        setSubmitting(true);
        await signInWithEmail(email, password);
        onClose();
      } catch (err: unknown) {
        setLocalError((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const displayedError = localError || authError;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(7, 10, 18, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          padding: '36px',
          maxWidth: '440px',
          width: '100%',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-card)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.4rem',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ×
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '6px' }}>
            {mode === 'reset' && resetSent ? '✉️' : '🌿'}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            {mode === 'signup' && 'Create Your FitFam Account'}
            {mode === 'signin' && 'Welcome Back to FitFam'}
            {mode === 'reset' && (resetSent ? 'Check your email ✉️' : 'Reset your password')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
            {mode === 'signup' && 'Open registration • Free family health tracking'}
            {mode === 'signin' && 'Sign in to access your family check-ins'}
            {mode === 'reset' &&
              (resetSent
                ? "If an account can receive a password reset email at this address, you'll receive instructions shortly."
                : 'Enter the email address associated with your FitFam account.')}
          </p>
        </div>

        {/* Display Error Alert */}
        {displayedError && !resetSent && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.82rem',
              marginBottom: '20px',
              lineHeight: 1.5
            }}
          >
            ⚠️ {displayedError}
          </div>
        )}

        {/* Reset Success State Content */}
        {mode === 'reset' && resetSent ? (
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSwitchMode('signin')}
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign-In Button */}
            {mode !== 'reset' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    marginBottom: '20px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '20px 0',
                    gap: '12px',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
                  <span>OR EMAIL</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
                </div>
              </>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              {mode !== 'reset' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('reset')}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-mint)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              )}

              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '0.95rem' }}
              >
                {submitting ? 'Processing...' : mode === 'signup' ? 'Create Free Account' : mode === 'signin' ? 'Sign In' : 'Send Reset Link'}
              </button>
            </form>

            {/* Modal Footer Mode Switchers */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {mode === 'signin' && (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-mint)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign Up Free
                  </button>
                </span>
              )}

              {mode === 'signup' && (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-mint)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </span>
              )}

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-mint)', fontWeight: 600, cursor: 'pointer' }}
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
