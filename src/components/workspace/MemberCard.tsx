import React from 'react';
import { FamilyMember, WeighInEntry } from '../../types';
import { getMemberCheckInStatus, getTargetProgressStatus, getMemberDisplayName } from '../../services/checkInEvaluator';

interface MemberCardProps {
  member: FamilyMember;
  allMembers?: FamilyMember[];
  latestEntry?: WeighInEntry | null;
  previousEntry?: WeighInEntry | null;
  onSelect: (member: FamilyMember) => void;
  onQuickRecord?: (member: FamilyMember) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  allMembers,
  latestEntry,
  previousEntry,
  onSelect,
  onQuickRecord
}) => {
  const getAvatarEmoji = (rel: string, name: string) => {
    const lower = `${rel} ${name}`.toLowerCase();
    if (lower.includes('dad') || lower.includes('father')) return '👨';
    if (lower.includes('mom') || lower.includes('mother')) return '👩';
    if (lower.includes('son') || lower.includes('boy')) return '👦';
    if (lower.includes('daughter') || lower.includes('girl')) return '👧';
    if (lower.includes('grandm') || lower.includes('nani') || lower.includes('dadi')) return '👵';
    if (lower.includes('grandf') || lower.includes('nana') || lower.includes('dada')) return '👴';
    return '👤';
  };

  const displayName = getMemberDisplayName(member, allMembers);
  const status = getMemberCheckInStatus(member, latestEntry);
  const targetEval = getTargetProgressStatus(
    latestEntry?.weightKg || 0,
    member.targetWeightKg,
    previousEntry?.weightKg
  );

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        background: 'var(--bg-glass)',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          onClick={() => onSelect(member)}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flex: 1 }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem'
            }}
          >
            {getAvatarEmoji(member.relationship, displayName)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
              {displayName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-mint)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600
                }}
              >
                {member.relationship}
              </span>

              {/* Status Badge */}
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: status === 'checked-in' ? 'var(--accent-mint)' : status === 'waiting' ? 'var(--accent-amber)' : 'var(--text-muted)'
                }}
              >
                {status === 'checked-in' && '✓ Checked in this week'}
                {status === 'due' && '⏰ Check-in due'}
                {status === 'waiting' && '⏰ Check-in waiting'}
                {status === 'first-checkin' && '🌱 First check-in awaits'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Weight & Target Evaluation */}
      <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
            {latestEntry ? `Latest Check-in (${latestEntry.date})` : 'Weekly Schedule'}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {latestEntry ? `${latestEntry.weightKg} kg` : `📅 ${member.scheduleDay} at ${member.scheduleTime}`}
          </span>
        </div>

        {member.targetWeightKg ? (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Target Progress</span>
            <span className={targetEval.cssClass} style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              {latestEntry ? targetEval.text : `🎯 ${member.targetWeightKg} kg`}
            </span>
          </div>
        ) : (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Schedule</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              📅 {member.scheduleDay}
            </span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSelect(member)}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
        >
          View Journey →
        </button>

        {onQuickRecord && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onQuickRecord(member)}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            + Weigh-In
          </button>
        )}
      </div>
    </div>
  );
};
