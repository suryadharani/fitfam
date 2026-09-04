import React from 'react';

interface HeroSectionProps {
  onOpenAuth?: (mode: 'signup') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth }) => {
  return (
    <section className="hero-section" style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative' }}>
      <div className="section-container">
        {/* Status Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-pill)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.82rem', color: 'var(--accent-mint)', fontWeight: 600, marginBottom: '24px' }}>
          <span>✦</span>
          <span>Open Registration • Private Family Health Platform</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.15 }}>
          Your family’s weekly weigh-in, <br />
          <span className="gradient-text">made simple.</span>
        </h1>

        {/* Slogan */}
        <p style={{ fontSize: '1.25rem', fontFamily: 'var(--font-brand)', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '20px' }}>
          “Record it. Track it. Understand it.”
        </p>

        {/* Description */}
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          FitFam is a private family platform designed to make weekly weight tracking simple, gentle, and meaningful. 
          Each family member can record their weekly check-in and explore trends and insights based purely on their own history.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={() => onOpenAuth?.('signup')}
          >
            <span>Get Started Free</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <a href="#product-concept" className="btn btn-secondary btn-large">
            Explore Interactive Demo ↓
          </a>
        </div>

        {/* Notice Bar */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-glass)' }}>
          <span>🛡️</span>
          <span>Open Registration • 100% Private Data • Designed without clinical stress</span>
        </div>
      </div>
    </section>
  );
};
