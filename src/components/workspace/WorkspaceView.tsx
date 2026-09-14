import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember, WeighInEntry } from '../../types';
import {
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  reactivateFamilyMember,
  addWeighInEntry,
  subscribeToFamilyMembers,
  subscribeToWeighInEntries
} from '../../services/firestoreService';
import { Unsubscribe } from 'firebase/firestore';
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
  const [hasPendingWrites, setHasPendingWrites] = useState<boolean>(false);
  
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

  const pendingWritesRef = useRef<Record<string, boolean>>({});

  const activeMembers = members.filter((m) => m.isActive !== false);

  useEffect(() => {
    if (!user) {
      setMembers([]);
      setEntriesMap({});
      setLoading(false);
      setHasPendingWrites(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const entryUnsubscribes: Record<string, Unsubscribe> = {};

    const updatePendingWritesAggregate = () => {
      const isAnyPending = Object.values(pendingWritesRef.current).some(Boolean);
      setHasPendingWrites(isAnyPending);
    };

    // Real-time subscription to family members
    const unsubscribeMembers = subscribeToFamilyMembers(
      user.uid,
      (memberList, membersPending) => {
        setMembers(memberList);
        setLoading(false);
        pendingWritesRef.current['__members'] = membersPending;
        updatePendingWritesAggregate();

        const currentMemberIds = new Set(memberList.map((m) => m.id));

        // Clean up subscriptions for removed members
        Object.keys(entryUnsubscribes).forEach((mId) => {
          if (!currentMemberIds.has(mId)) {
            entryUnsubscribes[mId]();
            delete entryUnsubscribes[mId];
            delete pendingWritesRef.current[mId];
            setEntriesMap((prev) => {
              const copy = { ...prev };
              delete copy[mId];
              return copy;
            });
          }
        });

        // Subscribe to entries for active members
        memberList.forEach((m) => {
          if (!entryUnsubscribes[m.id]) {
            entryUnsubscribes[m.id] = subscribeToWeighInEntries(
              user.uid,
              m.id,
              (entries, entriesPending) => {
                setEntriesMap((prev) => ({ ...prev, [m.id]: entries }));
                pendingWritesRef.current[m.id] = entriesPending;
                updatePendingWritesAggregate();

                if (!hasDismissedPopup && m.isActive !== false) {
                  const status = getMemberCheckInStatus(m, entries[0] || null);
                  if (status === 'waiting' || status === 'due') {
                    setMissedPopupMember(m);
                  }
                }
              },
              (err) => {
                console.error(`[FitFam Entries Sub Error] member ${m.id}:`, err);
              }
            );
          }
        });
      },
      (err) => {
        console.error('[FitFam Members Sub Error]:', err);
        setFetchError('FitFam needs an internet connection to restore your family data on this device.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeMembers();
      Object.values(entryUnsubscribes).forEach((unsub) => unsub());
    };
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
    try {
      const newMember = await addFamilyMember(user.uid, memberData);
      setMembers((prev) => [...prev, newMember]);
      setEntriesMap((prev) => ({ ...prev, [newMember.id]: [] }));
    } catch (err) {
      console.error('[FitFam Add Member Error]:', err);
      alert('Unable to save update. Please check your connection and try again.');
    }
  };

  const handleUpdateMember = async (
    memberId: string,
    updates: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>
  ) => {
    if (!user) return;
    try {
      await updateFamilyMember(user.uid, memberId, updates);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
      );
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) => (prev ? { ...prev, ...updates } : null));
      }
      setEditingMember(null);
    } catch (err) {
      console.error('[FitFam Update Member Error]:', err);
      alert('Unable to save update. Please check your connection and try again.');
    }
  };

  const handleDeleteMember = async () => {
    if (!user || !deletingMember) return;
    try {
      await deleteFamilyMember(user.uid, deletingMember.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === deletingMember.id
            ? { ...m, isActive: false, deactivatedAt: new Date().toISOString() }
            : m
        )
      );
      if (selectedMember && selectedMember.id === deletingMember.id) {
        setSelectedMember(null);
      }
      setDeletingMember(null);
    } catch (err) {
      console.error('[FitFam Deactivate Member Error]:', err);
      alert('Unable to save update. Please check your connection and try again.');
    }
  };

  const handleReactivateMember = async (memberToReactivate: FamilyMember) => {
    if (!user) return;
    try {
      await reactivateFamilyMember(user.uid, memberToReactivate.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberToReactivate.id
            ? { ...m, isActive: true, deactivatedAt: undefined }
            : m
        )
      );
    } catch (err) {
      console.error('[FitFam Reactivate Member Error]:', err);
      alert('Unable to save update. Please check your connection and try again.');
    }
  };

  const handleQuickAddWeighIn = async (data: { weightKg: number; date: string; notes?: string }) => {
    if (!user || !quickRecordMember) return;
    try {
      const newEntry = await addWeighInEntry(user.uid, quickRecordMember.id, data);
      setEntriesMap((prev) => {
        const existing = prev[quickRecordMember.id] || [];
        const updated = [newEntry, ...existing].sort((a, b) => {
          if (b.date !== a.date) return b.date.localeCompare(a.date);
          const timeA = a.createdAt || '';
          const timeB = b.createdAt || '';
          if (timeA && timeB) return timeB.localeCompare(timeA);
          return 0;
        });
        return { ...prev, [quickRecordMember.id]: updated };
      });
      setQuickRecordMember(null);
    } catch (err) {
      console.error('[FitFam Quick Add Weigh-in Error]:', err);
      alert('Unable to save update. Please check your connection and try again.');
    }
  };

  const notifications = generateNotifications(activeMembers, entriesMap);

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
            <img src="./fitfam-logo-master.png" alt="FitFam Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
            <div>
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>FitFam</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-mint)', fontWeight: 600 }}>Private Family Home</span>
            </div>
          </div>

          {/* Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Ambient Calm Pending Sync Badge */}
            {hasPendingWrites && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-amber)',
                  fontWeight: 600,
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                Saved locally — will sync when online
              </span>
            )}

            {/* Quick Add Weigh In Button */}
            {activeMembers.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setQuickRecordMember(activeMembers[0])}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                + Quick Add
              </button>
            )}

            {/* Notification Center Bell */}
            <NotificationCenter
              notifications={notifications}
              onSelectMemberForWeighIn={(mId) => {
                const targetM = activeMembers.find((m) => m.id === mId);
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
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Let's reconnect you
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                {fetchError}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              >
                Try Again
              </button>
            </div>
          ) : isSettingsOpen ? (
            <SettingsView
              members={members}
              onBack={() => setIsSettingsOpen(false)}
              onOpenAddMember={() => setIsAddOpen(true)}
              onEditMember={(m) => setEditingMember(m)}
              onDeleteMember={(m) => setDeletingMember(m)}
              onReactivateMember={handleReactivateMember}
            />
          ) : selectedMember ? (
            <MemberDetailView
              member={selectedMember}
              allMembers={members}
              onBack={() => setSelectedMember(null)}
            />
          ) : (
            <FamilyOverviewGrid
              members={activeMembers}
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
