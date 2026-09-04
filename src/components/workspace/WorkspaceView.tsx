import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember } from '../../types';
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
} from '../../services/firestoreService';
import { FamilyOverviewGrid } from './FamilyOverviewGrid';
import { AddMemberModal } from './AddMemberModal';
import { EditMemberModal } from './EditMemberModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { MemberDetailView } from './MemberDetailView';

export const WorkspaceView: React.FC = () => {
  const { user, logout } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  // Fetch real family members from Firestore for authenticated user
  const fetchMembers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getFamilyMembers(user.uid);
      setMembers(data);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const handleAddMember = async (memberData: {
    name: string;
    relationship: string;
    scheduleDay: string;
    scheduleTime: string;
    targetWeightKg?: number | null;
  }) => {
    if (!user) return;
    const newMember = await addFamilyMember(user.uid, memberData);
    setMembers((prev) => [...prev, newMember]);
  };

  const handleUpdateMember = async (
    memberId: string,
    updates: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>
  ) => {
    if (!user) return;
    await updateFamilyMember(user.uid, memberId, updates);
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
    );
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleDeleteMember = async () => {
    if (!user || !deletingMember) return;
    await deleteFamilyMember(user.uid, deletingMember.id);
    setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
    if (selectedMember && selectedMember.id === deletingMember.id) {
      setSelectedMember(null);
    }
    setDeletingMember(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Workspace Header */}
      <header
        className="site-header"
        style={{
          padding: '16px 0',
          borderBottom: '1px solid var(--border-glass)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌿</span>
            <div>
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>FitFam</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>Private Workspace</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--accent-mint)',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              👤 {user?.email || user?.displayName || 'Authenticated User'}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => logout()}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main style={{ flex: 1, padding: '40px 0 60px' }}>
        <div className="section-container">
          {selectedMember ? (
            <MemberDetailView
              member={selectedMember}
              onBack={() => setSelectedMember(null)}
            />
          ) : (
            <FamilyOverviewGrid
              members={members}
              loading={loading}
              onOpenAddModal={() => setIsAddOpen(true)}
              onSelectMember={(m) => setSelectedMember(m)}
              onEditMember={(m) => setEditingMember(m)}
              onDeleteMember={(m) => setDeletingMember(m)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
      />

      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onUpdateMember={handleUpdateMember}
      />

      <DeleteConfirmModal
        isOpen={!!deletingMember}
        memberName={deletingMember?.name || ''}
        onConfirm={handleDeleteMember}
        onCancel={() => setDeletingMember(null)}
      />
    </div>
  );
};
