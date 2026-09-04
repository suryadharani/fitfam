import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: '👨‍👩‍👧‍👦',
      title: 'Add your family',
      desc: 'Add anyone in your household or family circle with customizable names and roles.'
    },
    {
      number: '02',
      icon: '⏰',
      title: 'Choose check-in times',
      desc: "Default to Sunday at 8:00 AM, or tailor day and time for each individual's schedule."
    },
    {
      number: '03',
      icon: '⚖️',
      title: 'Record once a week',
      desc: 'Step on the scale, log your number in 5 seconds, and you’re done for the entire week.'
    },
    {
      number: '04',
      icon: '📈',
      title: 'Build personal history',
      desc: 'Accumulate consistent weekly logs that reveal long-term personal trajectory.'
    },
    {
      number: '05',
      icon: '💡',
      title: 'See meaningful insights',
      desc: 'Understand rolling averages and trends calculated purely from your own history.'
    }
  ];

  return (
    <section className="how-it-works-section" style={{ padding: '60px 0 80px' }}>
      <div className="section-container">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <span className="eyebrow-tag">SIMPLE ROUTINE</span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>How FitFam Works</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            No complicated meal tracking, no calorie counts. Just one gentle check-in a week.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {steps.map((step) => (
            <div
              key={step.number}
              className="glass-panel"
              style={{
                padding: '24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-mint)', opacity: 0.8 }}>
                {step.number}
              </span>
              <span style={{ fontSize: '2.2rem' }}>{step.icon}</span>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{step.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
