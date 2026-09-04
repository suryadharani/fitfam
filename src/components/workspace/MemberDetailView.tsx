import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember, WeighInEntry } from '../../types';
import {
  getWeighInEntries,
  addWeighInEntry,
  deleteWeighInEntry
} from '../../services/firestoreService';
import { MemberTrendChart } from './MemberTrendChart';
import { LogWeighInModal } from './LogWeighInModal';
import { DeleteEntryConfirmModal } from './DeleteEntryConfirmModal';

interface MemberDetailViewProps {
  member: FamilyMember;
  onBack: () => void;
}

export const MemberDetailView: React.FC<MemberDetailViewProps> = ({ member, onBack }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WeighInEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [deletingEntry, setDeletingEntry] = useState<WeighInEntry | null>(null);

  const fetchEntries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getWeighInEntries(user.uid, member.id);
      setEntries(data);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user, member.id]);

  const handleAddEntry = async (entryData: {
    weightKg: number;
    date: string;
    notes?: string;
  }) => {
    if (!user) return;
    const newEntry = await addWeighInEntry(user.uid, member.id, entryData);
    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteEntry = async () => {
    if (!user || !deletingEntry) return;
    await deleteWeighInEntry(user.uid, member.id, deletingEntry.id);
    setEntries((prev) => prev.filter((e) => e.id !== deletingEntry.id));
    setDeletingEntry(null);
  };

  // Compute non-clinical metrics
  const latestEntry = entries.length > 0 ? entries[0] : null;
  const prevEntry = entries.length > 1 ? entries[1] : null;
  const oldestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  let wowDiff: string | null = null;
  let wowClass = 'text-muted';

  if (latestEntry && prevEntry) {
    const diff = Math.round((latestEntry.weightKg - prevEntry.weightKg) * 10) / 10;
    if (Math.abs(diff) < 0.05) {
      wowDiff = '→ 0.0 kg';
      wowClass = 'text-muted';
    } else if (diff < 0) {
      wowDiff = `↓ ${Math.abs(diff).toFixed(1)} kg`;
      wowClass = 'trend-down';
    } else {
      wowDiff = `↑ ${diff.toFixed(1)} kg`;
      wowClass = 'trend-up';
    }
  }

  let totalDiff: string | null = null;
  if (latestEntry && oldestEntry && entries.length > 1) {
    const diff = Math.round((latestEntry.weightKg - oldestEntry.weightKg) * 10) / 10;
    if (Math.abs(diff) < 0.05) {
      totalDiff = '→ 0.0 kg';
    } else if (diff < 0) {
      totalDiff = `↓ ${Math.abs(diff).toFixed(1)} kg`;
    } else {
      totalDiff = `↑ ${diff.toFixed(1)} kg`;
    }
  }

  return (
    <div>
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            ← Back to Overview
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{member.name}</h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-mint)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600
                }}
              >
                {member.relationship}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Check-in Schedule: 📅 {member.scheduleDay} at {member.scheduleTime}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsLogModalOpen(true)}
        >
          + Record Weigh-In
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Latest Weight</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '4px 0' }}>
            {latestEntry ? `${latestEntry.weightKg} kg` : 'No logs yet'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {latestEntry ? `Recorded ${latestEntry.date}` : 'Log first check-in'}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Week-over-Week</span>
          <span className={wowClass} style={{ fontSize: '1.8rem', fontWeight: 800, display: 'block', margin: '4px 0' }}>
            {wowDiff || '—'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {prevEntry ? `vs. ${prevEntry.date}` : 'Requires 2 entries'}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Overall Trajectory</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '4px 0' }}>
            {totalDiff || '—'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {oldestEntry && entries.length > 1 ? `across ${entries.length} check-ins` : 'Building history'}
          </span>
        </div>

        {member.targetWeightKg && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Target Baseline</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'block', margin: '4px 0' }}>
              🎯 {member.targetWeightKg} kg
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reference goal</span>
          </div>
        )}
      </div>

      {/* SVG Trend Chart */}
      <div style={{ marginBottom: '32px' }}>
        <MemberTrendChart
          entries={entries}
          targetWeightKg={member.targetWeightKg}
          memberName={member.name}
        />
      </div>

      {/* Recent History Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Check-In History</h3>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading weight history...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No check-ins recorded yet for {member.name}. Click "+ Record Weigh-In" to log the first entry.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Weight (kg)</th>
                  <th style={{ padding: '10px 12px' }}>Notes</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{entry.date}</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent-mint)' }}>
                      {entry.weightKg} kg
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {entry.notes || '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setDeletingEntry(entry)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                          color: 'var(--accent-rose)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Weigh In Modal */}
      <LogWeighInModal
        isOpen={isLogModalOpen}
        member={member}
        onClose={() => setIsLogModalOpen(false)}
        onAddEntry={handleAddEntry}
      />

      {/* Delete Entry Confirmation Modal */}
      <DeleteEntryConfirmModal
        isOpen={!!deletingEntry}
        entryDate={deletingEntry?.date || ''}
        weightKg={deletingEntry?.weightKg || 0}
        onConfirm={handleDeleteEntry}
        onCancel={() => setDeletingEntry(null)}
      />
    </div>
  );
};
