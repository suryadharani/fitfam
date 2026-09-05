import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember, WeighInEntry } from '../../types';
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getWeighInEntries,
  addWeighInEntry
} from '../../services/firestoreService';
import { generateNotifications, getMemberCheckInStatus, getMemberDisplayName } from '../../services/checkInEvaluator';

import { FamilyOverviewGrid } from './FamilyOverviewGrid';
import { AddMemberModal } from './AddMemberModal';
import { EditMemberModal } from './EditMemberModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { MemberDetailView } from './MemberDetailView';
import { SettingsView } from '../settings/SettingsView';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { MissedCheckInModal } from './MissedCheckInModal';
import { LogWeighInModal } from './LogWeighInModal';

export const WorkspaceView: React.FC = () => {
  const { user, logout } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [entriesMap, setEntriesMap] = useState<Record<string, WeighInEntry[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Navigation & View States
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  // Quick Weigh-In & Missed Check-in Popup State
  const [quickRecordMember, setQuickRecordMember] = useState<FamilyMember | null>(null);
  const [missedPopupMember, setMissedPopupMember] = useState<FamilyMember | null>(null);
  const [hasDismissedPopup, setHasDismissedPopup] = useState(false);

  // Fetch real family members & entries from Firestore for authenticated user
  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setFetchError(null);
      const memberList = await getFamilyMembers(user.uid);
      setMembers(memberList);

      const map: Record<string, WeighInEntry[]> = {};
      await Promise.all(
        memberList.map(async (m) => {
          const mEntries = await getWeighInEntries(user.uid, m.id);
          map[m.id] = mEntries;
        })
      );
      setEntriesMap(map);

      // Evaluate missed check-in for contextual popup on load
      if (!hasDismissedPopup) {
        const waitingMember = memberList.find((m) => {
          const latest = map[m.id]?.[0] || null;
          const status = getMemberCheckInStatus(m, latest);
          return status === 'waiting' || status === 'due';
        });
        if (waitingMember) {
          setMissedPopupMember(waitingMember);
        }
      }
    } catch (err: unknown) {
      console.error('[FitFam Home] Failed to fetch family data from Firestore:', err);
      setFetchError('Unable to load family check-ins from database. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddMember = async (memberData: {
    name: string;
    fullName?: string;
    nickname?: string;
    relationship: string;
    scheduleDay: string;
    scheduleTime: string;
    targetWeightKg?: number | null;
  }) => {
    if (!user) return;
    const newMember = await addFamilyMember(user.uid, memberData);
    setMembers((prev) => [...prev, newMember]);
    setEntriesMap((prev) => ({ ...prev, [newMember.id]: [] }));
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
    setEditingMember(null);
  };

  const handleDeleteMember = async () => {
    if (!user || !deletingMember) return;
    await deleteFamilyMember(user.uid, deletingMember.id);
    setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
    setEntriesMap((prev) => {
      const copy = { ...prev };
      delete copy[deletingMember.id];
      return copy;
    });
    if (selectedMember && selectedMember.id === deletingMember.id) {
      setSelectedMember(null);
    }
    setDeletingMember(null);
  };

  const handleQuickAddWeighIn = async (data: { weightKg: number; date: string; notes?: string }) => {
    if (!user || !quickRecordMember) return;
    const newEntry = await addWeighInEntry(user.uid, quickRecordMember.id, data);
    setEntriesMap((prev) => ({
      ...prev,
      [quickRecordMember.id]: [newEntry, ...(prev[quickRecordMember.id] || [])]
    }));
    setQuickRecordMember(null);
  };

  const notifications = generateNotifications(members, entriesMap);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Family Home Header */}
      <header
        className="site-header"
        style={{
          padding: '14px 0',
          borderBottom: '1px solid var(--border-glass)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Logo & Family Brand */}
          <div
            onClick={() => {
              setSelectedMember(null);
              setIsSettingsOpen(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.8rem' }}>🌿</span>
            <div>
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>FitFam</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>Private Family Home</span>
            </div>
          </div>

          {/* Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Add Weigh In Button */}
            {members.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setQuickRecordMember(members[0])}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                + Quick Add
              </button>
            )}

            {/* Notification Center Bell */}
            <NotificationCenter
              notifications={notifications}
              onSelectMemberForWeighIn={(mId) => {
                const targetM = members.find((m) => m.id === mId);
                if (targetM) setQuickRecordMember(targetM);
              }}
            />

            {/* Settings Button */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsSettingsOpen(true);
                setSelectedMember(null);
              }}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              ⚙️ Settings
            </button>

            {/* User Badge */}
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--accent-mint)',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              👤 {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </span>

            {/* Sign Out */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => logout()}
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Home Container */}
      <main style={{ flex: 1, padding: '36px 0 60px' }}>
        <div className="section-container">
          {fetchError ? (
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                textAlign: 'center',
                maxWidth: '540px',
                margin: '40px auto',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.06)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Database Sync Warning
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {fetchError}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchData}
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              >
                🔄 Retry Loading
              </button>
            </div>
          ) : isSettingsOpen ? (
            <SettingsView
              members={members}
              onBack={() => setIsSettingsOpen(false)}
              onOpenAddMember={() => setIsAddOpen(true)}
              onEditMember={(m) => setEditingMember(m)}
              onDeleteMember={(m) => setDeletingMember(m)}
            />
          ) : selectedMember ? (
            <MemberDetailView
              member={selectedMember}
              allMembers={members}
              onBack={() => setSelectedMember(null)}
            />
          ) : (
            <FamilyOverviewGrid
              members={members}
              loading={loading}
              entriesMap={entriesMap}
              onOpenAddModal={() => setIsAddOpen(true)}
              onSelectMember={(m) => setSelectedMember(m)}
              onQuickRecordWeighIn={(m) => setQuickRecordMember(m)}
            />
          )}
        </div>
      </main>

      {/* Contextual Missed Check-In Modal */}
      <MissedCheckInModal
        isOpen={!!missedPopupMember && !hasDismissedPopup}
        member={missedPopupMember}
        allMembers={members}
        onClose={() => {
          setHasDismissedPopup(true);
          setMissedPopupMember(null);
        }}
        onRecordWeighIn={(m) => setQuickRecordMember(m)}
      />

      {/* Quick Add Weigh In Modal */}
      {quickRecordMember && (
        <LogWeighInModal
          isOpen={!!quickRecordMember}
          member={quickRecordMember}
          allMembers={members}
          previousWeightKg={entriesMap[quickRecordMember.id]?.[0]?.weightKg}
          onClose={() => setQuickRecordMember(null)}
          onAddEntry={handleQuickAddWeighIn}
        />
      )}

      {/* Member Management Modals */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
      />

      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        allMembers={members}
        onClose={() => setEditingMember(null)}
        onUpdateMember={handleUpdateMember}
      />

      <DeleteConfirmModal
        isOpen={!!deletingMember}
        memberName={deletingMember ? getMemberDisplayName(deletingMember, members) : ''}
        onConfirm={handleDeleteMember}
        onCancel={() => setDeletingMember(null)}
      />
    </div>
  );
};
