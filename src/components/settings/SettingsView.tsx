import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember } from '../../types';
import { setupPasswordForCurrentUser } from '../../services/authService';

interface SettingsViewProps {
  members: FamilyMember[];
  onBack: () => void;
  onOpenAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  members,
  onBack,
  onOpenAddMember,
  onEditMember,
  onDeleteMember
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'security' | 'about'>('family');
  
  // Password setup state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setPwdSubmitting(true);
      await setupPasswordForCurrentUser(newPassword);
      setPwdMsg({ type: 'success', text: '✓ Your password has been set successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPwdMsg({ type: 'error', text: (err as Error).message });
    } finally {
      setPwdSubmitting(false);
    }
  };

  const isGoogleUser = user?.providerData.some((p) => p.providerId === 'google.com');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            ← Back to Family Home
          </button>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Family & App Settings</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Manage your household members, schedules, and account preferences
            </span>
          </div>
        </div>
      </div>

      {/* Settings Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'family', label: '👨‍👩‍👧‍👦 Family Members' },
          { id: 'profile', label: '👤 Profile & Account' },
          { id: 'security', label: '🔒 Password & Security' },
          { id: 'about', label: '🌿 About FitFam' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-mint)' : '2px solid transparent',
              background: 'none',
              color: activeTab === tab.id ? 'var(--accent-mint)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Family Members Management */}
      {activeTab === 'family' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Family Members ({members.length})</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Add or edit members in your household. Home cards display their weekly journey status.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenAddMember}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              + Add Family Member
            </button>
          </div>

          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              No family members added yet. Click "+ Add Family Member" to begin.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{m.name}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--accent-mint)',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          fontWeight: 600
                        }}
                      >
                        {m.relationship}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      📅 Check-in: {m.scheduleDay} at {m.scheduleTime} {m.targetWeightKg ? `• 🎯 Target: ${m.targetWeightKg} kg` : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => onEditMember(m)}
                      style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMember(m)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        color: 'var(--accent-rose)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Account */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>My Profile</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Display Name
              </label>
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {user?.displayName || user?.email?.split('@')[0] || 'Authenticated User'}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Email Address
              </label>
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {user?.email || 'No email associated'}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Standard Weight Unit
              </label>
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-mint)', fontSize: '0.9rem', fontWeight: 700 }}>
                🔒 Kilograms (kg) — Standardized Locked Unit
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => logout()}
                style={{ padding: '10px 20px', fontSize: '0.88rem', color: 'var(--accent-rose)' }}
              >
                Sign Out of FitFam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Password & Security */}
      {activeTab === 'security' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Password & Sign-In</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {isGoogleUser
              ? 'You are signed in with Google. You can optionally set a password below to enable Email/Password sign-in for this same account.'
              : 'Update your FitFam account password.'}
          </p>

          {pwdMsg && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: pwdMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                border: pwdMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                color: pwdMsg.type === 'success' ? 'var(--accent-mint)' : 'var(--accent-rose)',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}
            >
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                {isGoogleUser ? 'Set New Password' : 'New Password'}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={pwdSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              {pwdSubmitting ? 'Saving Password...' : isGoogleUser ? 'Set Account Password' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: About FitFam */}
      {activeTab === 'about' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>🌿</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>FitFam</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-mint)', fontWeight: 600, marginTop: '2px' }}>
              Your family's weekly weigh-in, made simple.
            </p>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>
              FitFam is a private family weekly weight-tracking application designed to help households log check-ins together and understand personal trends with privacy and calm.
            </p>
            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Architecture & Privacy:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '0.85rem' }}>
                <li>100% Spark Free Tier ($0 infrastructure cost)</li>
                <li>Strict per-user UID data isolation in Cloud Firestore</li>
                <li>No medical diagnosis, shaming, or competitive leaderboards</li>
                <li>Standardized permanently to kilograms (kg)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
