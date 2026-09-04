import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
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
 * Note: Zero default members are seeded automatically.
 */
export async function addFamilyMember(
  uid: string,
  data: Omit<FamilyMember, 'id' | 'createdAt'>
): Promise<FamilyMember> {
  const membersRef = collection(db, 'users', uid, 'members');
  const now = new Date().toISOString();
  
  const docRef = await addDoc(membersRef, {
    ...data,
    createdAt: now
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: now
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
 * Delete a family member document
 */
export async function deleteFamilyMember(uid: string, memberId: string): Promise<void> {
  const memberRef = doc(db, 'users', uid, 'members', memberId);
  await deleteDoc(memberRef);
}

/**
 * Add a weigh-in entry to users/{uid}/members/{memberId}/entries/
 * Storage unit standard MUST BE numeric weightKg.
 */
export async function addWeighInEntry(
  uid: string,
  memberId: string,
  data: { weightKg: number; date: string; notes?: string }
): Promise<WeighInEntry> {
  const entriesRef = collection(db, 'users', uid, 'members', memberId, 'entries');
  const now = new Date().toISOString();

  const payload = {
    memberId,
    weightKg: data.weightKg, // Stored in kg
    date: data.date,
    notes: data.notes || null,
    createdAt: now
  };

  const docRef = await addDoc(entriesRef, payload);

  return {
    id: docRef.id,
    ...payload
  };
}

/**
 * Get all weigh-in entries for a family member ordered by date
 */
export async function getWeighInEntries(uid: string, memberId: string): Promise<WeighInEntry[]> {
  const entriesRef = collection(db, 'users', uid, 'members', memberId, 'entries');
  const q = query(entriesRef, orderBy('date', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<WeighInEntry, 'id'>)
  }));
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
