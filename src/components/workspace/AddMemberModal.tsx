import React, { useState } from 'react';
import { RELATIONSHIP_SHORTCUTS } from '../../data/demoData';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (memberData: {
    name: string;
    relationship: string;
    scheduleDay: string;
    scheduleTime: string;
    targetWeightKg?: number | null;
  }) => Promise<void>;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Me');
  const [customRelationship, setCustomRelationship] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Sunday');
  const [scheduleTime, setScheduleTime] = useState('08:00 AM');
  const [targetWeight, setTargetWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalRelationship = relationship === 'Other' || !RELATIONSHIP_SHORTCUTS.includes(relationship)
      ? customRelationship.trim() || relationship
      : relationship;

    const finalName = name.trim() || finalRelationship;

    if (!finalName) {
      setError('Please enter a member name or relationship.');
      return;
    }

    const parsedTarget = targetWeight ? parseFloat(targetWeight) : null;

    try {
      setSubmitting(true);
      await onAddMember({
        name: finalName,
        relationship: finalRelationship,
        scheduleDay,
        scheduleTime,
        targetWeightKg: parsedTarget
      });
      // Reset form
      setName('');
      setRelationship('Me');
      setCustomRelationship('');
      setScheduleDay('Sunday');
      setScheduleTime('08:00 AM');
      setTargetWeight('');
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to add family member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectShortcut = (shortcut: string) => {
    setRelationship(shortcut);
    if (shortcut !== 'Other') {
      if (!name) setName(shortcut);
      setCustomRelationship('');
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
          border: '1px solid var(--border-glass)'
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
          <span className="eyebrow-tag">HOUSEHOLD MEMBER</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>Add Family Member</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Add anyone in your household with their own check-in schedule.
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
          {/* Quick Relationship Choices */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Quick Relationship Option
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[...RELATIONSHIP_SHORTCUTS, 'Other'].map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => handleSelectShortcut(rel)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: relationship === rel ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                    color: relationship === rel ? '#04120c' : 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {/* Member Name */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dad, Priya, Cousin Ravi"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          {/* Custom Relationship Input */}
          {(relationship === 'Other' || !RELATIONSHIP_SHORTCUTS.includes(relationship)) && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Custom Relationship / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Cousin, Roommate, Grandmother, Aunt"
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
            </div>
          )}

          {/* Schedule Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Weekly Check-in Schedule
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

          {/* Optional Target Weight */}
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
            {submitting ? 'Saving Member...' : 'Save Family Member'}
          </button>
        </form>
      </div>
    </div>
  );
};
