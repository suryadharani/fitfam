import React from 'react';
import { FamilyMember, WeighInEntry } from '../../types';
import { MemberCard } from './MemberCard';
import { FamilyInsightsCard } from './FamilyInsightsCard';
import { FamilyTrendsCard } from './FamilyTrendsCard';
import { getMemberDisplayName } from '../../services/checkInEvaluator';

interface FamilyOverviewGridProps {
  members: FamilyMember[];
  loading: boolean;
  entriesMap: Record<string, WeighInEntry[]>;
  onOpenAddModal: () => void;
  onSelectMember: (member: FamilyMember) => void;
  onQuickRecordWeighIn: (member: FamilyMember) => void;
}

export const FamilyOverviewGrid: React.FC<FamilyOverviewGridProps> = ({
  members,
  loading,
  entriesMap,
  onOpenAddModal,
  onSelectMember,
  onQuickRecordWeighIn
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading your family check-ins...</p>
      </div>
    );
  }

  // STATE A — 0 FAMILY MEMBERS
  if (members.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ padding: '64px 32px', maxWidth: '620px', margin: '0 auto' }}>
        <img src="./fitfam-logo-master.png" alt="FitFam Logo" style={{ height: '72px', width: '72px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }} className="gradient-text">
          Your FitFam starts here.
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
          Start your family's weekly journey. Add yourself or a family member to begin tracking check-ins together.
        </p>

        {/* Quick Relationship Shortcut Chips */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {['Me', 'Dad', 'Mom', 'Son', 'Daughter', 'Someone Else'].map((rel) => (
            <span
              key={rel}
              onClick={onOpenAddModal}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-glass)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              + Add {rel}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onOpenAddModal}
          style={{ padding: '14px 32px', fontSize: '1rem' }}
        >
          + Add First Family Member
        </button>
      </div>
    );
  }

  // STATE B / C — SINGLE FAMILY MEMBER SPECIAL PERSONAL JOURNEY BANNER
  if (members.length === 1) {
    const singleMember = members[0];
    const memberEntries = entriesMap[singleMember.id] || [];
    const displayName = getMemberDisplayName(singleMember, members);

    if (memberEntries.length === 0) {
      // STATE B — 1 MEMBER, 0 WEIGH-INS
      return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <FamilyTrendsCard
            members={members}
            entriesMap={entriesMap}
            onSelectMember={onSelectMember}
          />
          <FamilyInsightsCard members={members} entriesMap={entriesMap} />

          <div className="glass-panel text-center" style={{ padding: '48px 32px', marginBottom: '32px' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🌱</span>
            <span className="eyebrow-tag">PERSONAL JOURNEY</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
              Welcome to {displayName}'s Journey
            </h2>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              Your first weekly check-in is where your journey begins. Record your initial baseline weight to start unlocking trend insights.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-pill)', marginBottom: '28px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-mint)' }}>
                📅 Scheduled for {singleMember.scheduleDay} at {singleMember.scheduleTime}
              </span>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={() => onQuickRecordWeighIn(singleMember)}
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
                + Record First Weigh-In
              </button>
            </div>
          </div>

          <MemberCard
            member={singleMember}
            allMembers={members}
            latestEntry={null}
            previousEntry={null}
            onSelect={onSelectMember}
            onQuickRecord={onQuickRecordWeighIn}
          />
        </div>
      );
    } else if (memberEntries.length === 1) {
      // STATE C — 1 MEMBER, 1 WEIGH-IN
      return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <FamilyTrendsCard
            members={members}
            entriesMap={entriesMap}
            onSelectMember={onSelectMember}
          />
          <FamilyInsightsCard members={members} entriesMap={entriesMap} />

          <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.6rem' }}>🌱</span>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {displayName}'s Journey Has Started
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
                  First check-in recorded on {memberEntries[0].date} ({memberEntries[0].weightKg} kg)
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              FitFam is gathering your weekly baseline. With additional check-ins, your trend trajectory and 4-week average will take shape automatically.
            </p>
          </div>

          <MemberCard
            member={singleMember}
            allMembers={members}
            latestEntry={memberEntries[0]}
            previousEntry={null}
            onSelect={onSelectMember}
            onQuickRecord={onQuickRecordWeighIn}
          />
        </div>
      );
    }
  }

  // STATE D / E / F / G — MULTIPLE MEMBERS & MATURE FAMILY VIEW
  return (
    <div>
      {/* 1. Primary Family Trends Card */}
      <FamilyTrendsCard
        members={members}
        entriesMap={entriesMap}
        onSelectMember={onSelectMember}
      />

      {/* 2. Primary Family Insights Card */}
      <FamilyInsightsCard members={members} entriesMap={entriesMap} />

      {/* 3. Our Family Members Header & Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="eyebrow-tag">OUR FAMILY</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Family Members ({members.length})
          </h2>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenAddModal}
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          + Add Member
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {members.map((member) => {
          const memberEntries = entriesMap[member.id] || [];
          const latest = memberEntries.length > 0 ? memberEntries[0] : null;
          const previous = memberEntries.length > 1 ? memberEntries[1] : null;

          return (
            <MemberCard
              key={member.id}
              member={member}
              allMembers={members}
              latestEntry={latest}
              previousEntry={previous}
              onSelect={onSelectMember}
              onQuickRecord={onQuickRecordWeighIn}
            />
          );
        })}
      </div>
    </div>
  );
};

