import React from 'react';
import { FamilyMember } from '../../types';
import { getMemberDisplayName } from '../../services/checkInEvaluator';

interface MissedCheckInModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  allMembers?: FamilyMember[];
  onClose: () => void;
  onRecordWeighIn: (member: FamilyMember) => void;
}

export const MissedCheckInModal: React.FC<MissedCheckInModalProps> = ({
  isOpen,
  member,
  allMembers,
  onClose,
  onRecordWeighIn
}) => {
  if (!isOpen || !member) return null;

  const displayName = getMemberDisplayName(member, allMembers);

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
        zIndex: 1040,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🌱</span>
        <span className="eyebrow-tag" style={{ marginBottom: '6px' }}>WEEKLY CHECK-IN WAITING</span>
        
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 8px' }}>
          Welcome back 👋
        </h3>
        
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
          <strong>{displayName}</strong>'s weekly check-in scheduled for <strong>{member.scheduleDay} at {member.scheduleTime}</strong> hasn't been recorded yet.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onRecordWeighIn(member);
              onClose();
            }}
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
          >
            + Record Weigh-In for {displayName}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
