import React from 'react';
import { FamilyMember } from '../../types';

interface MemberCardProps {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onSelect,
  onEdit,
  onDelete
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

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        background: 'var(--bg-glass)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          onClick={() => onSelect(member)}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem'
            }}
          >
            {getAvatarEmoji(member.relationship, member.name)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{member.name}</h3>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-mint)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 600,
                display: 'inline-block',
                marginTop: '4px'
              }}
            >
              {member.relationship}
            </span>
          </div>
        </div>

        {/* Card Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => onEdit(member)}
            title="Edit member"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(member)}
            title="Delete member"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: 'var(--accent-rose)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Weekly Check-in Schedule</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            📅 {member.scheduleDay} at {member.scheduleTime}
          </span>
        </div>
        {member.targetWeightKg && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Target</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              🎯 {member.targetWeightKg} kg
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onSelect(member)}
        style={{ width: '100%', padding: '8px', fontSize: '0.85rem', marginTop: '4px' }}
      >
        View Trend & Log Weigh-In →
      </button>
    </div>
  );
};
