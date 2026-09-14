import {
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  AuthError
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, googleProvider } from './firebase';
import { deleteAllUserData } from './firestoreService';

/**
 * Format raw Firebase Auth errors into clean, human-readable messages.
 * Explicitly guards against silent account merging and credential collisions.
 */
export function formatAuthError(error: AuthError): string {
  const code = error.code || '';
  const msg = error.message || '';

  if (code.includes('api-key-not-valid') || msg.includes('api-key-not-valid') || code === 'auth/invalid-api-key') {
    return 'Firebase Authentication API Key is invalid or unconfigured. Please check VITE_FIREBASE_API_KEY in .env.local.';
  }

  switch (code) {
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email address using a different sign-in method (e.g. Email/Password). Please sign in using your original provider first to securely connect credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Invalid email address or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Redirecting to complete authentication...';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
    default:
      return msg || 'An unexpected authentication error occurred. Please try again.';
  }
}

function ensureAuth() {
  if (!auth) {
    throw new Error('Firebase Authentication is unconfigured or unavailable. Please supply VITE_FIREBASE_API_KEY.');
  }
}

/**
 * Sign in with Google Auth Provider.
 * Uses Native Google Play Services Auth on Android/iOS, and Web Popup/Redirect on desktop browsers.
 */
export async function signInWithGoogleService() {
  ensureAuth();
  try {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '1002272415607-8v1u9fcne8halouc98q2sju33vr68mru.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true
      });
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication?.idToken;
      if (!idToken) {
        throw new Error('Google Sign-In was cancelled or failed to obtain authentication token.');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return result.user;
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const authErr = err as AuthError;
    if (authErr.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw new Error(formatAuthError(authErr));
  }
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmailService(email: string, pass: string) {
  ensureAuth();
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (err: unknown) {
    throw new Error(formatAuthError(err as AuthError));
  }
}

/**
 * Sign In with Email and Password
 */
export async function signInWithEmailService(email: string, pass: string) {
  ensureAuth();
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (err: unknown) {
    throw new Error(formatAuthError(err as AuthError));
  }
}

/**
 * Send Password Reset Email
 */
export async function resetPasswordService(email: string) {
  ensureAuth();
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: unknown) {
    throw new Error(formatAuthError(err as AuthError));
  }
}

/**
 * Sign Out Current User
 */
export async function logoutUserService() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err: unknown) {
    throw new Error(formatAuthError(err as AuthError));
  }
}

/**
 * Set or update password for current authenticated user (e.g. Google user setting email/password access)
 */
export async function setupPasswordForCurrentUser(newPassword: string) {
  ensureAuth();
  if (!auth.currentUser) {
    throw new Error('No authenticated user found. Please sign in first.');
  }
  try {
    const { updatePassword } = await import('firebase/auth');
    await updatePassword(auth.currentUser, newPassword);
  } catch (err: unknown) {
    const authErr = err as AuthError;
    if (authErr.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, setting a password requires recent authentication. Please sign out and sign in again before updating your password.');
    }
    throw new Error(formatAuthError(authErr));
  }
}

/**
 * Permanently delete current user account and all associated Firestore data.
 * MUST REQUIRE AN ACTIVE NETWORK CONNECTION.
 * Reauthenticates current user before executing Firestore batch purge.
 * Only calls deleteUser(currentUser) after Firestore purge succeeds.
 */
export async function deleteUserAccountService(password?: string): Promise<void> {
  ensureAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user found. Please sign in first.');
  }

  // 1. Strict online network policy
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error(
      'Account deletion requires an active internet connection. Please connect to the internet to permanently delete your account and household data.'
    );
  }

  // 2. Reauthenticate user before destructive operation
  try {
    if (password && currentUser.email) {
      const cred = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, cred);
    } else {
      // Reauthenticate Google user
      if (Capacitor.isNativePlatform()) {
        GoogleAuth.initialize({
          clientId: '1002272415607-8v1u9fcne8halouc98q2sju33vr68mru.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
        const googleUser = await GoogleAuth.signIn();
        const idToken = googleUser.authentication?.idToken;
        if (!idToken) {
          throw new Error('Google re-authentication was cancelled or failed to obtain authentication token.');
        }
        const cred = GoogleAuthProvider.credential(idToken);
        await reauthenticateWithCredential(currentUser, cred);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const cred = GoogleAuthProvider.credentialFromResult(result);
        if (cred) {
          await reauthenticateWithCredential(currentUser, cred);
        }
      }
    }
  } catch (err: unknown) {
    const authErr = err as AuthError;
    throw new Error(
      authErr.message || 'Re-authentication failed. Please check your credentials and try again.'
    );
  }

  // 3. Execute complete Firestore batch purge
  try {
    await deleteAllUserData(currentUser.uid);
  } catch (err: unknown) {
    console.error('[FitFam Auth] Firestore data purge failed:', err);
    throw new Error(
      'Failed to purge user data from database. Account deletion was cancelled to prevent data corruption. Please try again.'
    );
  }

  // 4. Delete Firebase Auth user ONLY after Firestore purge succeeded
  try {
    await deleteUser(currentUser);
  } catch (err: unknown) {
    const authErr = err as AuthError;
    throw new Error(formatAuthError(authErr));
  }
}
