import React, { useState } from 'react';
import { NotificationItem } from '../../types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onSelectMemberForWeighIn: (memberId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onSelectMemberForWeighIn
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const waitingCount = notifications.filter((n) => n.category === 'waiting' || n.category === 'today').length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="FitFam Activity & Notifications"
        style={{
          background: isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border-glass)',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          fontSize: '1.1rem',
          transition: 'all 0.2s ease'
        }}
      >
        🔔
        {waitingCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--accent-emerald)',
              color: '#04120c',
              fontSize: '0.68rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-pill)',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
            }}
          >
            {waitingCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 990
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '340px',
              maxHeight: '440px',
              overflowY: 'auto',
              zIndex: 995,
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>FitFam Updates</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
                {notifications.length} Activity Items
              </span>
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ✨ You're all caught up! No pending check-ins or activity.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: item.category === 'waiting' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
                      border: item.category === 'waiting' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid var(--border-glass)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 6px', lineHeight: 1.4 }}>
                      {item.message}
                    </p>
                    {item.actionRequired && item.memberId && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectMemberForWeighIn(item.memberId!);
                          setIsOpen(false);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'var(--accent-emerald)',
                          color: '#04120c',
                          border: 'none',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Record Weigh-In
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
