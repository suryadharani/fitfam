import React, { useState, useMemo } from 'react';
import { FamilyMember, WeighInEntry } from '../../types';
import { getMemberDisplayName } from '../../services/checkInEvaluator';

export interface TrendColor {
  hex: string;
  glow: string;
  name: string;
}

export const FITFAM_TREND_COLORS: TrendColor[] = [
  { hex: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', name: 'Emerald' },
  { hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.35)', name: 'Cyan' },
  { hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', name: 'Amber' },
  { hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.35)', name: 'Violet' },
  { hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.35)', name: 'Rose' },
  { hex: '#6366f1', glow: 'rgba(99, 102, 241, 0.35)', name: 'Indigo' },
  { hex: '#84cc16', glow: 'rgba(132, 204, 22, 0.35)', name: 'Lime' },
  { hex: '#14b8a6', glow: 'rgba(20, 184, 166, 0.35)', name: 'Teal' }
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministically map a member ID to a stable accent color palette item.
 * Uses immutable creation order + hash collision resolution so existing members'
 * colors remain 100% stable when new members are added or existing members removed.
 */
export function getMemberTrendColor(memberId: string, allMembers?: FamilyMember[]): TrendColor {
  if (!allMembers || allMembers.length === 0) {
    const rawIdx = hashString(memberId) % FITFAM_TREND_COLORS.length;
    return FITFAM_TREND_COLORS[rawIdx];
  }

  // Sort members by creation order (chronological) to maintain immutable assignment priority
  const sortedMembers = [...allMembers].sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    if (tA !== tB) return tA - tB;
    return a.id.localeCompare(b.id);
  });

  const assignedColors: Record<string, number> = {};
  const usedIndices = new Set<number>();

  sortedMembers.forEach((m) => {
    const baseIdx = hashString(m.id) % FITFAM_TREND_COLORS.length;
    let finalIdx = baseIdx;
    let tries = 0;
    while (usedIndices.has(finalIdx) && tries < FITFAM_TREND_COLORS.length) {
      finalIdx = (finalIdx + 1) % FITFAM_TREND_COLORS.length;
      tries++;
    }
    usedIndices.add(finalIdx);
    assignedColors[m.id] = finalIdx;
  });

  const targetIdx = assignedColors[memberId] ?? (hashString(memberId) % FITFAM_TREND_COLORS.length);
  return FITFAM_TREND_COLORS[targetIdx];
}

interface FamilyTrendsCardProps {
  members: FamilyMember[];
  entriesMap: Record<string, WeighInEntry[]>;
  onSelectMember: (member: FamilyMember) => void;
}

export const FamilyTrendsCard: React.FC<FamilyTrendsCardProps> = ({
  members,
  entriesMap,
  onSelectMember
}) => {
  const [timeframe, setTimeframe] = useState<'4w' | '3m' | 'all'>('4w');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    memberId: string;
    entry: WeighInEntry;
    x: number;
    y: number;
  } | null>(null);

  // If selected member is removed, reset selection
  const activeSelectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [selectedMemberId, members]);

  // Filter entries per member according to timeframe selection
  const memberFilteredEntries = useMemo(() => {
    const map: Record<string, WeighInEntry[]> = {};
    const now = new Date().getTime();
    const daysLimit = timeframe === '4w' ? 28 : timeframe === '3m' ? 90 : 3650;
    const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

    members.forEach((m) => {
      const allEntries = entriesMap[m.id] || [];
      const sorted = [...allEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (timeframe === 'all') {
        map[m.id] = sorted;
      } else {
        const filtered = sorted.filter((e) => new Date(e.date).getTime() >= cutoff);
        // If filtering leaves 0 entries but member has entries, show available history
        map[m.id] = filtered.length > 0 ? filtered : sorted;
      }
    });

    return map;
  }, [members, entriesMap, timeframe]);

  // Calculate total weigh-in count across all members
  const totalWeighInCount = useMemo(() => {
    return Object.values(entriesMap).reduce((acc, list) => acc + list.length, 0);
  }, [entriesMap]);

  // Compute SVG Plot Geometry
  const chartGeometry = useMemo(() => {
    if (totalWeighInCount === 0 || members.length === 0) return null;

    // Collect all dates & weights across filtered entries
    const allFilteredEntries: { memberId: string; entry: WeighInEntry }[] = [];
    members.forEach((m) => {
      const list = memberFilteredEntries[m.id] || [];
      list.forEach((entry) => allFilteredEntries.push({ memberId: m.id, entry }));
    });

    if (allFilteredEntries.length === 0) return null;

    const timestamps = allFilteredEntries.map((item) => new Date(item.entry.date).getTime());
    const weights = allFilteredEntries.map((item) => item.entry.weightKg);

    // If a single member with target is selected, include target weight in Y bounds
    if (activeSelectedMember && activeSelectedMember.targetWeightKg) {
      weights.push(activeSelectedMember.targetWeightKg);
    }

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = maxTime - minTime;

    const minWeight = Math.min(...weights) - 1.2;
    const maxWeight = Math.max(...weights) + 1.2;
    const weightRange = maxWeight - minWeight || 1.0;

    const svgWidth = 600;
    const svgHeight = 220;
    const paddingX = 50;
    const paddingTop = 25;
    const paddingBottom = 35;
    const plotWidth = svgWidth - paddingX * 2;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    // Calculate (x, y) for each member's points
    const memberPlots = members.map((member) => {
      const entries = memberFilteredEntries[member.id] || [];
      const color = getMemberTrendColor(member.id, members);
      const displayName = getMemberDisplayName(member, members);

      const points = entries.map((entry) => {
        const entryTime = new Date(entry.date).getTime();
        const x =
          timeRange === 0
            ? paddingX + plotWidth / 2
            : paddingX + ((entryTime - minTime) / timeRange) * plotWidth;
        const y =
          paddingTop + plotHeight - ((entry.weightKg - minWeight) / weightRange) * plotHeight;

        return { x, y, entry, memberId: member.id };
      });

      let linePath = '';
      if (points.length >= 2) {
        linePath = points.reduce(
          (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`,
          ''
        );
      }

      return {
        member,
        displayName,
        color,
        entries,
        points,
        linePath
      };
    });

    // Target Y position if selected member has target
    let targetY: number | null = null;
    let targetVal: number | null = null;
    if (activeSelectedMember && activeSelectedMember.targetWeightKg) {
      targetVal = activeSelectedMember.targetWeightKg;
      targetY =
        paddingTop +
        plotHeight -
        ((activeSelectedMember.targetWeightKg - minWeight) / weightRange) * plotHeight;
    }

    // Grid lines (3 levels)
    const gridYLevels = [0.25, 0.5, 0.75].map((pct) => ({
      y: paddingTop + plotHeight * pct,
      val: Math.round((maxWeight - pct * weightRange) * 10) / 10
    }));

    // Date X ticks (up to 4 ticks)
    const dateTicks: { x: number; label: string }[] = [];
    if (timeRange === 0) {
      const dStr = new Date(minTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      dateTicks.push({ x: paddingX + plotWidth / 2, label: dStr });
    } else {
      const tickCount = 4;
      for (let i = 0; i < tickCount; i++) {
        const pct = i / (tickCount - 1);
        const t = minTime + pct * timeRange;
        const x = paddingX + pct * plotWidth;
        const label = new Date(t).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        dateTicks.push({ x, label });
      }
    }

    return {
      svgWidth,
      svgHeight,
      paddingX,
      paddingTop,
      plotWidth,
      plotHeight,
      memberPlots,
      targetY,
      targetVal,
      gridYLevels,
      dateTicks,
      totalWeighInsCount: allFilteredEntries.length
    };
  }, [members, memberFilteredEntries, activeSelectedMember, totalWeighInCount]);

  if (members.length === 0) {
    return null;
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px 28px',
        marginBottom: '32px',
        background:
          'linear-gradient(135deg, rgba(11, 17, 31, 0.9) 0%, rgba(18, 27, 46, 0.75) 100%)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 10px 36px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header & Timeframe Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '1.3rem' }}>📈</span>
            <span className="eyebrow-tag" style={{ margin: 0, fontSize: '0.72rem' }}>
              FAMILY INTELLIGENCE
            </span>
          </div>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              margin: '2px 0 0',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}
          >
            Family Trends
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--accent-mint)', margin: '2px 0 0', fontWeight: 600 }}>
            Everyone's journey, together
          </p>
        </div>

        {/* Timeframe Controls */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '3px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-glass)'
          }}
        >
          {(['4w', '3m', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              style={{
                padding: '5px 14px',
                fontSize: '0.78rem',
                fontWeight: timeframe === t ? 700 : 500,
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: timeframe === t ? 'var(--accent-emerald)' : 'transparent',
                color: timeframe === t ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: timeframe === t ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              {t === '4w' ? '4 Weeks' : t === '3m' ? '3 Months' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* CASE A: ZERO TOTAL WEIGH-INS */}
      {totalWeighInCount === 0 ? (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.18)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-glass)'
          }}
        >
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🌱</span>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '6px'
            }}
          >
            Your family's first check-ins will start building this picture.
          </h3>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: '460px',
              marginInline: 'auto',
              lineHeight: 1.5
            }}
          >
            As family members record their weekly weigh-ins, individual weight trajectories will appear here together.
          </p>
        </div>
      ) : chartGeometry ? (
        <>
          {/* CASE B BANNER: ONLY 1 WEIGH-IN IN TOTAL */}
          {totalWeighInCount === 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                marginBottom: '14px',
                width: 'fit-content'
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>🌱</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-mint)' }}>
                Your family's trend is beginning.
              </span>
            </div>
          )}

          {/* SVG MULTI-MEMBER GRAPH */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <svg
              viewBox={`0 0 ${chartGeometry.svgWidth} ${chartGeometry.svgHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
            >
              <defs>
                {/* Glow Filter for Hovered/Selected Member Line */}
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Horizontal Reference Lines */}
              {chartGeometry.gridYLevels.map((lvl, idx) => (
                <g key={idx}>
                  <line
                    x1={chartGeometry.paddingX}
                    y1={lvl.y}
                    x2={chartGeometry.svgWidth - chartGeometry.paddingX}
                    y2={lvl.y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartGeometry.paddingX - 8}
                    y={lvl.y + 3}
                    textAnchor="end"
                    fill="var(--text-muted)"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {lvl.val} kg
                  </text>
                </g>
              ))}

              {/* Target Reference Line (Revealed when a single member with target is selected) */}
              {chartGeometry.targetY !== null && chartGeometry.targetVal !== null && (
                <g>
                  <line
                    x1={chartGeometry.paddingX}
                    y1={chartGeometry.targetY}
                    x2={chartGeometry.svgWidth - chartGeometry.paddingX}
                    y2={chartGeometry.targetY}
                    stroke="var(--accent-amber)"
                    strokeDasharray="5 5"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                  <text
                    x={chartGeometry.svgWidth - chartGeometry.paddingX - 4}
                    y={chartGeometry.targetY - 5}
                    textAnchor="end"
                    fill="var(--accent-amber)"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    🎯 Target {chartGeometry.targetVal} kg
                  </text>
                </g>
              )}

              {/* Member Lines & Data Points */}
              {chartGeometry.memberPlots.map((plot) => {
                const isSelected = activeSelectedMember?.id === plot.member.id;
                const isDimmed = activeSelectedMember !== null && !isSelected;

                return (
                  <g key={plot.member.id}>
                    {/* Member Journey Line (If 2+ points exist) */}
                    {plot.linePath && (
                      <path
                        d={plot.linePath}
                        fill="none"
                        stroke={plot.color.hex}
                        strokeWidth={isSelected ? 3.8 : isDimmed ? 1.5 : 2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={isDimmed ? 0.2 : 1}
                        filter={isSelected ? 'url(#lineGlow)' : undefined}
                        style={{ transition: 'all 0.25s ease' }}
                      />
                    )}

                    {/* Member Data Points */}
                    {plot.points.map((pt, pIdx) => {
                      const isHovered =
                        hoveredPoint?.memberId === plot.member.id &&
                        hoveredPoint.entry.id === pt.entry.id;

                      return (
                        <g key={pIdx}>
                          {/* Inner Solid Point */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6.5 : isSelected ? 5.5 : 4}
                            fill={plot.color.hex}
                            stroke="#ffffff"
                            strokeWidth={isHovered || isSelected ? 2 : 1.5}
                            opacity={isDimmed ? 0.25 : 1}
                            style={{ transition: 'all 0.2s ease' }}
                          />

                          {/* Hover Outer Ring */}
                          {isHovered && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={10}
                              fill="none"
                              stroke={plot.color.hex}
                              strokeWidth="1.5"
                              opacity="0.75"
                            />
                          )}

                          {/* Touch / Pointer Interactive Area (Forgiving Hit Target) */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={18}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() =>
                              setHoveredPoint({
                                memberId: plot.member.id,
                                entry: pt.entry,
                                x: pt.x,
                                y: pt.y
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                            onClick={() => {
                              if (selectedMemberId === plot.member.id) {
                                setSelectedMemberId(null);
                              } else {
                                setSelectedMemberId(plot.member.id);
                              }
                            }}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* X Axis Date Ticks */}
              {chartGeometry.dateTicks.map((tick, idx) => (
                <text
                  key={idx}
                  x={tick.x}
                  y={chartGeometry.svgHeight - 8}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="9"
                  fontWeight="500"
                >
                  {tick.label}
                </text>
              ))}
            </svg>

            {/* Interactive Tooltip Overlay */}
            {hoveredPoint && (() => {
              const targetPlot = chartGeometry.memberPlots.find(
                (p) => p.member.id === hoveredPoint.memberId
              );
              if (!targetPlot) return null;

              // Compute percent positions for HTML absolute positioning
              const leftPct = (hoveredPoint.x / chartGeometry.svgWidth) * 100;
              const topPct = (hoveredPoint.y / chartGeometry.svgHeight) * 100;

              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: 'translate(-50%, -120%)',
                    pointerEvents: 'none',
                    zIndex: 20,
                    whiteSpace: 'nowrap',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${targetPlot.color.hex}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    boxShadow: `0 4px 16px ${targetPlot.color.glow}`,
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: targetPlot.color.hex,
                      marginBottom: '2px'
                    }}
                  >
                    {targetPlot.displayName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {hoveredPoint.entry.weightKg} kg
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {hoveredPoint.entry.date}
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      ) : null}

      {/* MEMBER LEGEND & SELECTOR */}
      {members.length > 0 && totalWeighInCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          {/* Scrollable / Compact Legend Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '100px',
              overflowY: 'auto'
            }}
          >
            {/* Everyone Button */}
            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border:
                  selectedMemberId === null
                    ? '1px solid var(--accent-emerald)'
                    : '1px solid var(--border-glass)',
                background:
                  selectedMemberId === null ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedMemberId === null ? 'var(--accent-mint)' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: selectedMemberId === null ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: selectedMemberId === null ? 'var(--accent-mint)' : 'var(--text-muted)'
                }}
              />
              Everyone
            </button>

            {/* Individual Member Chips */}
            {members.map((member) => {
              const color = getMemberTrendColor(member.id, members);
              const displayName = getMemberDisplayName(member, members);
              const isSelected = selectedMemberId === member.id;
              const hasEntries = (entriesMap[member.id] || []).length > 0;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: isSelected
                      ? `1.5px solid ${color.hex}`
                      : '1px solid var(--border-glass)',
                    background: isSelected ? `${color.hex}22` : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    opacity: hasEntries ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 2px 10px ${color.glow}` : 'none'
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: color.hex,
                      display: 'inline-block'
                    }}
                  />
                  <span>{displayName}</span>
                  {!hasEntries && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      (No logs)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action shortcut when a single member is selected */}
          {activeSelectedMember && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onSelectMember(activeSelectedMember)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  borderColor: getMemberTrendColor(activeSelectedMember.id, members).hex,
                  color: 'var(--text-primary)'
                }}
              >
                View {getMemberDisplayName(activeSelectedMember, members)}'s Journey →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
