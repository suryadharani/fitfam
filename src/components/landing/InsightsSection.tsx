import React from 'react';

export const InsightsSection: React.FC = () => {
  const cards = [
    {
      icon: '📉',
      tag: 'Week-over-Week',
      headline: '“↓ 0.3 kg from last week”',
      desc: 'Calculated directly from your previous week’s log to show short-term changes.'
    },
    {
      icon: '🎯',
      tag: 'Baseline Progress',
      headline: '“↓ 0.9 kg since first entry”',
      desc: 'Shows how far you have come from your initial check-in date across all recorded weeks.'
    },
    {
      icon: '📅',
      tag: 'Consistency Badge',
      headline: '“5 weeks recorded”',
      desc: 'Celebrates your habit of showing up and checking in on your chosen weekly day.'
    },
    {
      icon: '🌊',
      tag: 'Trend Analysis',
      headline: '“Gradually decreasing”',
      desc: 'Smooths out natural daily water weight fluctuations to reveal your overarching trajectory.'
    },
    {
      icon: '📊',
      tag: 'Rolling Average',
      headline: '“4-week average: 78.8 kg”',
      desc: 'Eliminates temporary spikes so you get a realistic view of your true monthly baseline.'
    },
    {
      icon: '🌿',
      tag: 'Non-Clinical',
      headline: 'Purely factual & private',
      desc: 'We never label anyone as “healthy” or “unhealthy”. Your data belongs only to you.'
    }
  ];

  return (
    <section className="insights-section" style={{ padding: '60px 0 80px' }}>
      <div className="section-container">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <span className="eyebrow-tag">GENTLE FEEDBACK</span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>Supportive, non-judgmental insights</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            FitFam calculates helpful mathematical milestones from user-entered logs without clinical judgment or stressful labels.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem' }}>{card.icon}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  {card.tag}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>{card.headline}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
