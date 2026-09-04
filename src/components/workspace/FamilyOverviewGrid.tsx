import React from 'react';
import { FamilyMember } from '../../types';
import { MemberCard } from './MemberCard';

interface FamilyOverviewGridProps {
  members: FamilyMember[];
  loading: boolean;
  onOpenAddModal: () => void;
  onSelectMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
}

export const FamilyOverviewGrid: React.FC<FamilyOverviewGridProps> = ({
  members,
  loading,
  onOpenAddModal,
  onSelectMember,
  onEditMember,
  onDeleteMember
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading your family workspace...</p>
      </div>
    );
  }

  // Polished Empty State for Zero Members
  if (members.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ padding: '64px 32px', maxWidth: '600px', margin: '0 auto' }}>
        <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🌿</span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }} className="gradient-text">
          Your FitFam starts here.
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
          Add your first family or household member to begin tracking weekly check-ins together.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onOpenAddModal}
        >
          + Add Family Member
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="eyebrow-tag">FAMILY WORKSPACE</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Family Members ({members.length})
          </h2>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAddModal}
        >
          + Add Member
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onSelect={onSelectMember}
            onEdit={onEditMember}
            onDelete={onDeleteMember}
          />
        ))}
      </div>
    </div>
  );
};
