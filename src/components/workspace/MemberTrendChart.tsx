import React, { useState } from 'react';
import { WeighInEntry } from '../../types';

interface MemberTrendChartProps {
  entries: WeighInEntry[];
  targetWeightKg?: number | null;
  memberName: string;
}

export const MemberTrendChart: React.FC<MemberTrendChartProps> = ({
  entries,
  targetWeightKg,
  memberName
}) => {
  const [timeframe, setTimeframe] = useState<'4w' | '3m' | 'all'>('all');

  // Filter entries based on selected timeframe
  const filteredEntries = React.useMemo(() => {
    if (entries.length === 0) return [];

    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (timeframe === 'all') return sorted;

    const now = new Date().getTime();
    const daysLimit = timeframe === '4w' ? 28 : 90;
    const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

    const filtered = sorted.filter((e) => new Date(e.date).getTime() >= cutoff);
    return filtered.length > 0 ? filtered : sorted;
  }, [entries, timeframe]);

  // Compute SVG plot paths and points
  const chartGeometry = React.useMemo(() => {
    if (filteredEntries.length === 0) return null;

    const weights = filteredEntries.map((e) => e.weightKg);
    if (targetWeightKg) weights.push(targetWeightKg);

    const minWeight = Math.min(...weights) - 1.0;
    const maxWeight = Math.max(...weights) + 1.0;
    const range = maxWeight - minWeight || 1.0;

    const width = 360;
    const height = 90;
    const paddingX = 40;
    const paddingY = 20;

    const points = filteredEntries.map((entry, idx) => {
      const step = filteredEntries.length > 1 ? (width - paddingX * 2) / (filteredEntries.length - 1) : 0;
      const x = filteredEntries.length === 1 ? width / 2 : paddingX + idx * step;
      const y = paddingY + height - ((entry.weightKg - minWeight) / range) * height;
      return { x, y, weightKg: entry.weightKg, date: entry.date };
    });

    let linePath = '';
    let areaPath = '';

    if (points.length === 1) {
      linePath = `M ${points[0].x - 10},${points[0].y} L ${points[0].x + 10},${points[0].y}`;
    } else {
      linePath = points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
      const firstX = points[0].x;
      const lastX = points[points.length - 1].x;
      const bottomY = paddingY + height;
      areaPath = `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    }

    let targetY: number | null = null;
    if (targetWeightKg) {
      targetY = paddingY + height - ((targetWeightKg - minWeight) / range) * height;
    }

    return { points, linePath, areaPath, targetY };
  }, [filteredEntries, targetWeightKg]);

  if (entries.length === 0) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '32px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📈</span>
        <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>No weight logs recorded yet</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
          Record weekly weigh-ins for {memberName} to build history and reveal personal trend lines.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
      {/* Chart Top Header & Timeframe Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Weight Trajectory ({filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['4w', '3m', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: timeframe === t ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
                background: timeframe === t ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: timeframe === t ? 'var(--accent-mint)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {t === '4w' ? '4 Weeks' : t === '3m' ? '3 Months' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Frame */}
      {chartGeometry && (
        <svg viewBox="0 0 360 140" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="realChartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-emerald)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent-emerald)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid background lines */}
          <line x1="20" y1="20" x2="340" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
          <line x1="20" y1="65" x2="340" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
          <line x1="20" y1="110" x2="340" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

          {/* Target Weight Reference Line */}
          {chartGeometry.targetY !== null && (
            <g>
              <line
                x1="20"
                y1={chartGeometry.targetY}
                x2="340"
                y2={chartGeometry.targetY}
                stroke="var(--accent-amber)"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <text
                x="335"
                y={chartGeometry.targetY - 4}
                textAnchor="end"
                fill="var(--accent-amber)"
                fontSize="9"
                fontWeight="bold"
              >
                Target: {targetWeightKg} kg
              </text>
            </g>
          )}

          {/* Shaded Area & Line Path */}
          {chartGeometry.areaPath && <path d={chartGeometry.areaPath} fill="url(#realChartGlow)" />}
          <path d={chartGeometry.linePath} fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {chartGeometry.points.map((pt, idx) => {
            const isLast = idx === chartGeometry.points.length - 1;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? 5.5 : 4}
                  fill={isLast ? 'var(--accent-emerald)' : '#fff'}
                  stroke={isLast ? '#fff' : 'var(--accent-emerald)'}
                  strokeWidth="2"
                />
                {/* Date Label under point */}
                <text
                  x={pt.x}
                  y="126"
                  textAnchor="middle"
                  fill={isLast ? 'var(--accent-mint)' : 'var(--text-muted)'}
                  fontSize="9"
                  fontWeight={isLast ? 'bold' : 'normal'}
                >
                  {pt.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
