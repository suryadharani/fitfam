import React from 'react';
import { FamilyMember, WeighInEntry } from '../../types';
import { getFamilyInsights } from '../../services/checkInEvaluator';

interface FamilyInsightsCardProps {
  members: FamilyMember[];
  entriesMap: Record<string, WeighInEntry[]>;
}

export const FamilyInsightsCard: React.FC<FamilyInsightsCardProps> = ({
  members,
  entriesMap
}) => {
  const insights = getFamilyInsights(members, entriesMap);

  if (members.length === 0) {
    return null;
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px 28px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.85) 0%, rgba(19, 29, 50, 0.6) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🌿</span>
          <div>
            <span className="eyebrow-tag" style={{ marginBottom: '2px', fontSize: '0.72rem' }}>
              INTELLIGENT OVERVIEW
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Family Insights
            </h2>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--accent-mint)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600
          }}
        >
          {insights.totalMembers} {insights.totalMembers === 1 ? 'Family Member' : 'Family Members'}
        </span>
      </div>

      {/* Insight Chips / Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        {/* Metric 1: Check-in Rhythm */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: 'var(--accent-mint)'
            }}
          >
            🗓️
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
              Check-in Rhythm
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {insights.checkedInThisWeekCount} of {insights.totalMembers} checked in this week
            </span>
          </div>
        </div>

        {/* Metric 2: Active Journeys */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}
          >
            🌱
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
              Journeys
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {insights.activeJourneysCount} {insights.activeJourneysCount === 1 ? 'journey taking shape' : 'family journeys taking shape'}
            </span>
          </div>
        </div>

        {/* Metric 3: Trend Availability */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}
          >
            📊
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
              Trends
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {insights.trend4WeekCount > 0
                ? `${insights.trend4WeekCount} ${insights.trend4WeekCount === 1 ? 'member has' : 'members have'} a 4-week picture`
                : 'Building 4-week picture...'}
            </span>
          </div>
        </div>

        {/* Metric 4: Target Progress (Optional if targets set) */}
        {insights.membersWithTargetCount > 0 && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}
            >
              🎯
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                Target Progress
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {insights.targetProgressCount} of {insights.membersWithTargetCount} moving toward target
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer Line */}
      <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
          "{insights.summarySentence}"
        </p>
      </div>
    </div>
  );
};
