import React, { useState } from 'react';
import { DEMO_MEMBERS } from '../../data/demoData';
import { MemberInsight } from '../../types';

export const InteractivePreview: React.FC = () => {
  const [activeMemberKey, setActiveMemberKey] = useState<string>('dad');
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(4);
  const [customSampleWeight, setCustomSampleWeight] = useState<string>('');
  const [simulatedWeight, setSimulatedWeight] = useState<number | null>(null);

  const baseMember: MemberInsight = DEMO_MEMBERS[activeMemberKey] || DEMO_MEMBERS.dad;

  // Apply simulated weigh-in if present
  let displayWeight = baseMember.currentWeight;
  let wowChange = baseMember.wowChange;
  let wowClass = baseMember.wowTrendClass;

  if (simulatedWeight !== null) {
    displayWeight = `${simulatedWeight.toFixed(1)} kg`;
    const numericPrev = parseFloat(baseMember.currentWeight.replace(' kg', ''));
    const diff = simulatedWeight - numericPrev;
    if (Math.abs(diff) < 0.05) {
      wowChange = '→ 0.0 kg';
      wowClass = 'text-muted';
    } else if (diff < 0) {
      wowChange = `↓ ${Math.abs(diff).toFixed(1)} kg`;
      wowClass = 'trend-down';
    } else {
      wowChange = `↑ ${diff.toFixed(1)} kg`;
      wowClass = 'trend-up';
    }
  }

  const handleSimulateWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customSampleWeight);
    if (!isNaN(parsed) && parsed > 20 && parsed < 300) {
      setSimulatedWeight(parsed);
    }
  };

  const handleResetSimulation = () => {
    setSimulatedWeight(null);
    setCustomSampleWeight('');
  };

  const handleMemberChange = (key: string) => {
    setActiveMemberKey(key);
    setSimulatedWeight(null);
    setCustomSampleWeight('');
  };

  return (
    <section id="product-concept" className="concept-section" style={{ padding: '60px 0 80px' }}>
      <div className="section-container">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <span className="eyebrow-tag">INTERACTIVE PRODUCT EXPERIENCE</span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>What FitFam feels like</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            A stress-free weekly routine designed to turn simple numbers into supportive personal clarity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1: Family Weekly Overview */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>☀️</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Good morning, Sharma Family!</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Here’s your family’s weekly check-in overview.</p>
                </div>
              </div>
              <span className="sample-tag">Sample View</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Dad */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>👨</span>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', fontSize: '0.92rem' }}>Dad</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule: Sunday 8:00 AM</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>
                    {activeMemberKey === 'dad' ? displayWeight : DEMO_MEMBERS.dad.currentWeight}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>✓ Recorded</span>
                </div>
              </div>

              {/* Mom */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>👩</span>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', fontSize: '0.92rem' }}>Mom</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule: Sunday 8:00 AM</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>
                    {activeMemberKey === 'mom' ? displayWeight : DEMO_MEMBERS.mom.currentWeight}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>✓ Recorded</span>
                </div>
              </div>

              {/* Son */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>👦</span>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', fontSize: '0.92rem' }}>Son</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule: Saturday 9:00 AM</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem', color: 'var(--text-muted)' }}>Not yet</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 600 }}>⏳ Due Saturday</span>
                </div>
              </div>

              {/* Daughter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>👧</span>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', fontSize: '0.92rem' }}>Daughter</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule: Sunday 8:30 AM</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>
                    {activeMemberKey === 'daughter' ? displayWeight : DEMO_MEMBERS.daughter.currentWeight}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>✓ Recorded</span>
                </div>
              </div>
            </div>

            {/* Interactive Weigh-In Simulator Box */}
            <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-mint)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚡ TEST WEIGH-IN SIMULATOR</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>In-Memory Only</span>
              </div>
              <form onSubmit={handleSimulateWeight} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder={`Log for ${baseMember.name} (e.g. 78.1)`}
                  value={customSampleWeight}
                  onChange={(e) => setCustomSampleWeight(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                  Log
                </button>
                {simulatedWeight !== null && (
                  <button type="button" onClick={handleResetSimulation} className="btn btn-secondary" style={{ padding: '8px 10px', fontSize: '0.82rem' }}>
                    Reset
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Card 2: Interactive SVG Chart & Metrics */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Personal Trend & Insights</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Calculated from check-in history.</p>
                </div>
              </div>

              {/* Member Switcher Tabs */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-glass)' }}>
                {['dad', 'mom', 'daughter'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMemberChange(key)}
                    style={{
                      padding: '5px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      cursor: 'pointer',
                      background: activeMemberKey === key ? 'var(--accent-emerald)' : 'transparent',
                      color: activeMemberKey === key ? '#04120c' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {DEMO_MEMBERS[key].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Latest Check-in</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '2px 0' }}>{displayWeight}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>This Sunday</span>
              </div>

              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Week-over-Week</span>
                <span className={wowClass} style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', margin: '2px 0' }}>{wowChange}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>from last week</span>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Overall Trajectory</span>
                <span className={baseMember.totalTrendClass} style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', margin: '2px 0' }}>{baseMember.totalChange}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>since first log</span>
              </div>
            </div>

            {/* Timeframe Scope Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Trend View Range:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[4, 8, 12].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => setSelectedTimeframe(weeks)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: selectedTimeframe === weeks ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
                      background: selectedTimeframe === weeks ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: selectedTimeframe === weeks ? 'var(--accent-mint)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {weeks} Weeks
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Trend Chart */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedTimeframe}-Week Trajectory ({baseMember.name})</span>
                <span style={{ color: 'var(--accent-mint)', fontWeight: 600 }}>{baseMember.trendSummary}</span>
              </div>

              <svg viewBox="0 0 400 130" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-emerald)" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="var(--accent-emerald)" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="20" y1="30" x2="380" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4"/>
                <line x1="20" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="4"/>
                <line x1="20" y1="110" x2="380" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4"/>

                {/* Area & Line */}
                <path d={baseMember.areaPath} fill="url(#chartGlow)"/>
                <path d={baseMember.linePath} fill="none" stroke="var(--accent-emerald)" strokeWidth="3" strokeLinecap="round"/>

                {/* Points */}
                {baseMember.chartPoints.map((pt, idx) => {
                  const isLast = idx === baseMember.chartPoints.length - 1;
                  return (
                    <circle
                      key={idx}
                      cx={pt.cx}
                      cy={isLast && simulatedWeight !== null ? pt.cy - (simulatedWeight - parseFloat(baseMember.currentWeight)) * 10 : pt.cy}
                      r={isLast ? 6 : 4.5}
                      fill={isLast ? 'var(--accent-emerald)' : '#fff'}
                      stroke={isLast ? '#fff' : 'var(--accent-emerald)'}
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Axis Labels */}
                <text x="40" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="10">W1</text>
                <text x="120" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="10">W2</text>
                <text x="200" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="10">W3</text>
                <text x="280" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="10">W4</text>
                <text x="360" y="125" textAnchor="middle" fill="var(--accent-mint)" fontSize="10" fontWeight="bold">W5 (Now)</text>
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <span>4-Week Moving Average: <strong style={{ color: 'var(--text-primary)' }}>{baseMember.avgWeight}</strong></span>
                <span>History: <strong style={{ color: 'var(--text-primary)' }}>{baseMember.historyWeeks} weeks</strong></span>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              * Demonstration values for concept illustration. FitFam is non-clinical and does not provide medical diagnosis or advice.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
