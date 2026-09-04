import React, { useState } from 'react';
import { RELATIONSHIP_SHORTCUTS, RELATIONSHIP_CUSTOM } from '../../data/demoData';

export const FlexibleFamilySection: React.FC = () => {
  const [selectedRelationship, setSelectedRelationship] = useState<string>('Cousin Ravi');
  const [highlightBorder, setHighlightBorder] = useState<boolean>(false);

  const handleSelectChip = (chip: string) => {
    setSelectedRelationship(chip);
    setHighlightBorder(true);
    setTimeout(() => setHighlightBorder(false), 500);
  };

  return (
    <section className="family-setup-section" style={{ padding: '60px 0 80px' }}>
      <div className="section-container">
        <div className="glass-panel" style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <span className="eyebrow-tag">UNIVERSAL DESIGN</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 16px' }}>Built for every kind of family</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.7 }}>
              Families come in all structures. FitFam doesn’t force rigid categories or traditional boxes. 
              Whether you live with parents, siblings, cousins, roommates, or extended family, everyone can participate with their own name and schedule.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Quick shortcuts (Click to test):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {RELATIONSHIP_SHORTCUTS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSelectChip(chip)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        background: selectedRelationship === chip ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.06)',
                        color: selectedRelationship === chip ? '#04120c' : 'var(--text-primary)',
                        border: '1px solid var(--border-glass)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Or any custom relationship:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {RELATIONSHIP_CUSTOM.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSelectChip(chip)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        background: selectedRelationship === chip ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: selectedRelationship === chip ? 'var(--accent-mint)' : 'var(--text-secondary)',
                        border: selectedRelationship === chip ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Setup Mockup Card */}
          <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-glass)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Who should we add?</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>Setup Preview</span>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Member Name / Relationship
                </label>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-deep)',
                    border: highlightBorder ? '1px solid var(--accent-emerald)' : '1px solid rgba(16, 185, 129, 0.35)',
                    color: 'var(--accent-mint)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: highlightBorder ? '0 0 12px var(--accent-emerald-glow)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {selectedRelationship}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Weekly Check-in Schedule
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    Sunday
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    08:00 AM
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '8px', padding: '12px', textAlign: 'center', background: 'var(--accent-emerald)', color: '#04120c', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.9rem', opacity: 0.9 }}>
                Save Member Profile
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
