import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../../types';
import { getMemberDisplayName } from '../../services/checkInEvaluator';
import { getLocalDateString } from '../../utils/dateUtils';

interface LogWeighInModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  allMembers?: FamilyMember[];
  previousWeightKg?: number | null;
  onClose: () => void;
  onAddEntry: (entryData: {
    weightKg: number;
    date: string;
    notes?: string;
  }) => Promise<void>;
}

export const LogWeighInModal: React.FC<LogWeighInModalProps> = ({
  isOpen,
  member,
  allMembers,
  previousWeightKg,
  onClose,
  onAddEntry
}) => {
  const getTodayLocal = () => getLocalDateString(new Date());

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(getTodayLocal());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningWeight, setWarningWeight] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (previousWeightKg !== undefined && previousWeightKg !== null && previousWeightKg > 0) {
        setWeight(previousWeightKg.toFixed(1));
      } else {
        setWeight('');
      }
      setDate(getTodayLocal());
      setNotes('');
      setError(null);
      setWarningWeight(null);
    }
  }, [isOpen, member?.id, previousWeightKg]);

  if (!isOpen || !member) return null;

  const displayName = getMemberDisplayName(member, allMembers);

  const executeSubmit = async (finalWeightKg: number) => {
    try {
      setSubmitting(true);
      setError(null);
      await onAddEntry({
        weightKg: Math.round(finalWeightKg * 10) / 10,
        date,
        notes: notes.trim() || undefined
      });

      setWeight('');
      setDate(getTodayLocal());
      setNotes('');
      setWarningWeight(null);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to record weigh-in entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 350) {
      setError('Please enter a valid weight in kg (e.g. 74.5).');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    // Soft verification warning for values outside usual range (< 20 kg or > 300 kg)
    if ((parsedWeight < 20 || parsedWeight > 300) && warningWeight !== parsedWeight) {
      setWarningWeight(parsedWeight);
      return;
    }

    await executeSubmit(parsedWeight);
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
          maxWidth: '440px',
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

        <div style={{ marginBottom: '20px' }}>
          <span className="eyebrow-tag">WEEKLY CHECK-IN</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0' }}>
            Record Weight for {displayName}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Log weekly check-in weight in kilograms (kg).
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

        {warningWeight !== null && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '6px' }}>
              🔍 Please verify check-in weight
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Please check this value — <strong>{warningWeight} kg</strong> is outside the usual check-in range. Is this value correct?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => executeSubmit(warningWeight)}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--accent-amber)', color: '#04120c' }}
              >
                Yes, confirm {warningWeight} kg
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setWarningWeight(null)}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Edit weight
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Weight Input (kg) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Weight (kg) *
              </label>
              {previousWeightKg ? (
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
                  Prefilled from last entry: {previousWeightKg.toFixed(1)} kg
                </span>
              ) : null}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.1"
                required
                autoFocus
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  if (warningWeight !== null) setWarningWeight(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              />
              <span style={{ position: 'absolute', right: '14px', top: '12px', color: 'var(--accent-mint)', fontWeight: 700, fontSize: '0.95rem' }}>
                kg
              </span>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Check-in Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Optional Notes Input */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Morning check-in after glass of water"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-body)',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}
          >
            {submitting ? 'Saving Weigh-In...' : 'Save Weigh-In'}
          </button>
        </form>
      </div>
    </div>
  );
};
