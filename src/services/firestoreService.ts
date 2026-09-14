import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, FamilyMember, WeighInEntry } from '../types';

/**
 * Ensure user profile document exists in Firestore (users/{uid})
 * Locked default storage unit: 'kg'
 */
export async function createUserProfileIfNotExists(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    uid,
    email,
    displayName,
    defaultUnit: 'kg', // Database storage standard locked to kg
    createdAt: new Date().toISOString()
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * Get user profile document
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Add a new family member to users/{uid}/members/
 * Uses explicit client-generated document reference for offline durability.
 */
export async function addFamilyMember(
  uid: string,
  data: Omit<FamilyMember, 'id' | 'createdAt'>
): Promise<FamilyMember> {
  const membersRef = collection(db, 'users', uid, 'members');
  const newMemberRef = doc(membersRef);
  const now = new Date().toISOString();
  
  const payload = {
    ...data,
    createdAt: now
  };

  await setDoc(newMemberRef, payload);

  return {
    id: newMemberRef.id,
    ...payload
  };
}

/**
 * Get all family members for an authenticated user
 */
export async function getFamilyMembers(uid: string): Promise<FamilyMember[]> {
  const membersRef = collection(db, 'users', uid, 'members');
  const q = query(membersRef, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<FamilyMember, 'id'>)
  }));
}

/**
 * Real-time subscription to family members for an authenticated user.
 * Emits updated member array and pending writes status.
 */
export function subscribeToFamilyMembers(
  uid: string,
  onUpdate: (members: FamilyMember[], hasPendingWrites: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const membersRef = collection(db, 'users', uid, 'members');
  const q = query(membersRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snap) => {
      const members = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FamilyMember, 'id'>)
      }));
      onUpdate(members, snap.metadata.hasPendingWrites);
    },
    (err) => {
      console.error('[FitFam Firestore] Family members subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Update family member details
 */
export async function updateFamilyMember(
  uid: string,
  memberId: string,
  updates: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>
): Promise<void> {
  const memberRef = doc(db, 'users', uid, 'members', memberId);
  await updateDoc(memberRef, updates);
}

/**
 * Deactivate a family member document (Soft-delete).
 * Preserves the parent document and historical weigh-in entries subcollection.
 */
export async function deleteFamilyMember(uid: string, memberId: string): Promise<void> {
  const memberRef = doc(db, 'users', uid, 'members', memberId);
  await updateDoc(memberRef, {
    isActive: false,
    deactivatedAt: new Date().toISOString()
  });
}

/**
 * Reactivate a previously deactivated family member document.
 */
export async function reactivateFamilyMember(uid: string, memberId: string): Promise<void> {
  const memberRef = doc(db, 'users', uid, 'members', memberId);
  await updateDoc(memberRef, {
    isActive: true,
    deactivatedAt: null
  });
}

/**
 * Add a weigh-in entry to users/{uid}/members/{memberId}/entries/
 * Uses explicit client-generated document reference for offline durability.
 * Storage unit standard MUST BE numeric weightKg.
 */
export async function addWeighInEntry(
  uid: string,
  memberId: string,
  data: { weightKg: number; date: string; notes?: string }
): Promise<WeighInEntry> {
  const entriesRef = collection(db, 'users', uid, 'members', memberId, 'entries');
  const newEntryRef = doc(entriesRef);
  const now = new Date().toISOString();

  const payload = {
    memberId,
    weightKg: data.weightKg, // Stored in kg
    date: data.date,
    notes: data.notes || null,
    createdAt: now
  };

  await setDoc(newEntryRef, payload);

  return {
    id: newEntryRef.id,
    ...payload
  };
}

/**
 * Get all weigh-in entries for a family member ordered deterministically by date DESC, then createdAt DESC.
 */
export async function getWeighInEntries(uid: string, memberId: string): Promise<WeighInEntry[]> {
  const entriesRef = collection(db, 'users', uid, 'members', memberId, 'entries');
  const q = query(entriesRef, orderBy('date', 'desc'));
  const snap = await getDocs(q);

  const entries = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<WeighInEntry, 'id'>)
  }));

  // Deterministic ordering: date DESC, then createdAt DESC (with fallback for legacy records without createdAt)
  return entries.sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    const timeA = a.createdAt || '';
    const timeB = b.createdAt || '';
    if (timeA && timeB) {
      return timeB.localeCompare(timeA);
    }
    return 0;
  });
}

/**
 * Real-time subscription to weigh-in entries for a family member.
 * Emits deterministically sorted entries and pending writes status.
 */
export function subscribeToWeighInEntries(
  uid: string,
  memberId: string,
  onUpdate: (entries: WeighInEntry[], hasPendingWrites: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const entriesRef = collection(db, 'users', uid, 'members', memberId, 'entries');
  const q = query(entriesRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const entries = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<WeighInEntry, 'id'>)
      }));

      // Deterministic ordering: date DESC, then createdAt DESC
      entries.sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        const timeA = a.createdAt || '';
        const timeB = b.createdAt || '';
        if (timeA && timeB) {
          return timeB.localeCompare(timeA);
        }
        return 0;
      });

      onUpdate(entries, snap.metadata.hasPendingWrites);
    },
    (err) => {
      console.error('[FitFam Firestore] Weigh-in entries subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Delete a weigh-in entry document
 */
export async function deleteWeighInEntry(
  uid: string,
  memberId: string,
  entryId: string
): Promise<void> {
  const entryRef = doc(db, 'users', uid, 'members', memberId, 'entries', entryId);
  await deleteDoc(entryRef);
}
