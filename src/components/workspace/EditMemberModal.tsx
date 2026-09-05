import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../../types';
import { RELATIONSHIP_SHORTCUTS } from '../../data/demoData';
import { getMemberDisplayName } from '../../services/checkInEvaluator';

interface EditMemberModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  allMembers?: FamilyMember[];
  onClose: () => void;
  onUpdateMember: (
    memberId: string,
    updates: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>
  ) => Promise<void>;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  member,
  allMembers,
  onClose,
  onUpdateMember
}) => {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [relationship, setRelationship] = useState('Me');
  const [customRelationship, setCustomRelationship] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Sunday');
  const [scheduleTime, setScheduleTime] = useState('08:00 AM');
  const [targetWeight, setTargetWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.fullName || member.name || '');
      setNickname(member.nickname || member.name || '');
      if (RELATIONSHIP_SHORTCUTS.includes(member.relationship)) {
        setRelationship(member.relationship);
        setCustomRelationship('');
      } else {
        setRelationship('Other');
        setCustomRelationship(member.relationship);
      }
      setScheduleDay(member.scheduleDay);
      setScheduleTime(member.scheduleTime);
      setTargetWeight(member.targetWeightKg ? member.targetWeightKg.toString() : '');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const displayName = getMemberDisplayName(member, allMembers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalRelationship = relationship === 'Other' || !RELATIONSHIP_SHORTCUTS.includes(relationship)
      ? customRelationship.trim() || relationship
      : relationship;

    const trimmedFullName = fullName.trim();
    const trimmedNickname = nickname.trim();
    const resolvedNickname = trimmedNickname || trimmedFullName || finalRelationship;

    if (!resolvedNickname) {
      setError('Please enter a full name or nickname.');
      return;
    }

    const parsedTarget = targetWeight ? parseFloat(targetWeight) : null;

    try {
      setSubmitting(true);
      await onUpdateMember(member.id, {
        name: resolvedNickname,
        fullName: trimmedFullName || resolvedNickname,
        nickname: resolvedNickname,
        relationship: finalRelationship,
        scheduleDay,
        scheduleTime,
        targetWeightKg: parsedTarget
      });
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update family member.');
    } finally {
      setSubmitting(false);
    }
  };

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
        zIndex: 1050,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow-tag">EDIT PROFILE</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>Edit {displayName}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Update member name, relationship role, or check-in schedule.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.82rem',
              marginBottom: '16px'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Full Name */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramya Suryadevara"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

          {/* 2. Nickname */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Nickname *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramya"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
              💡 Nickname is what FitFam will normally show throughout the app.
            </span>
          </div>

          {/* 3. Relationship Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Relationship / Role *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {[...RELATIONSHIP_SHORTCUTS, 'Other'].map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setRelationship(rel)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: relationship === rel ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                    color: relationship === rel ? '#04120c' : 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {rel}
                </button>
              ))}
            </div>

            {(relationship === 'Other' || !RELATIONSHIP_SHORTCUTS.includes(relationship)) && (
              <input
                type="text"
                placeholder="Custom relationship (e.g. Cousin, Roommate)"
                value={customRelationship}
                onChange={(e) => setCustomRelationship(e.target.value)}
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
            )}
          </div>

          {/* 4. Schedule Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Weekly Check-in Schedule *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem'
                }}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d} style={{ background: '#0d1424' }}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem'
                }}
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t} style={{ background: '#0d1424' }}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Optional Target Weight */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Target Weight (kg) — Optional
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 75.0"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
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
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            {submitting ? 'Updating...' : 'Update Member'}
          </button>
        </form>
      </div>
    </div>
  );
};
