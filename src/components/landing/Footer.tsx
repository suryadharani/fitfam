import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" style={{ padding: '60px 0 30px', borderTop: '1px solid var(--border-glass)', background: 'rgba(7, 10, 18, 0.85)', position: 'relative' }}>
      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌿</span>
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>FitFam</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>“Your family’s weekly weigh-in, made simple.”</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent-mint)', fontWeight: 600 }}>✦ Open Registration Health Platform</p>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Project</span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><a href="#product-concept" style={{ color: 'inherit' }}>Interactive Preview</a></li>
              <li><a href="#how-it-works" style={{ color: 'inherit' }}>How It Works</a></li>
            </ul>
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Philosophy</span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><span>100% Private Data</span></li>
              <li><span>Non-Clinical Math</span></li>
              <li><span>₹0 / $0 Cost Stack</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
        <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>© 2026 FitFam. Built with care for families.</p>
          <p style={{ fontStyle: 'italic' }}>Notice: FitFam is a personal tracking tool and does not provide medical diagnosis or advice.</p>
        </div>
      </div>
    </footer>
  );
};
