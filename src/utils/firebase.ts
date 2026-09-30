import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SocialLink, CoachingCollection } from '../types';
import { INITIAL_LINKS, INITIAL_COLLECTIONS } from './initialData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline.');
    }
    return false;
  }
}

// User Profile upsert
export async function syncUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Google Auth Sign-In
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (err: any) {
    console.error('Google Sign-In failed', err);
    throw err;
  }
}

// Email & Password Sign Up
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<User> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch {
        // ignore profile update failure
      }
    }
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
    return cred.user;
  } catch (err: any) {
    console.error('Email sign-up failed', err);
    throw err;
  }
}

// Email & Password Sign In
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
    return cred.user;
  } catch (err: any) {
    console.error('Email sign-in failed', err);
    throw err;
  }
}

// Sign-Out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error', err);
  }
}

// Seed Initial Links and Collections into User's Firebase Vault if Empty
export async function seedUserVaultIfEmpty(userId: string): Promise<boolean> {
  const path = `users/${userId}/links`;
  try {
    const linksSnap = await getDocs(collection(db, 'users', userId, 'links'));
    if (linksSnap.empty) {
      console.log(`Seeding initial high-signal vault links into Firestore for user ${userId}...`);
      await syncLocalDataToFirestore(userId, INITIAL_LINKS, INITIAL_COLLECTIONS);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to seed user vault in Firestore', err);
    return false;
  }
}

// Save or Update Link in Firestore
export async function saveLinkToFirestore(userId: string, link: SocialLink): Promise<void> {
  const path = `users/${userId}/links/${link.id}`;
  const linkRef = doc(db, 'users', userId, 'links', link.id);
  const payload: Record<string, any> = {
    id: link.id,
    userId,
    url: link.url,
    platform: link.platform,
    title: link.title,
    dateAdded: link.dateAdded,
  };

  if (link.notes) payload.notes = link.notes;
  if (link.tags && link.tags.length > 0) payload.tags = link.tags;
  if (link.author) payload.author = link.author;
  if (link.authorHandle) payload.authorHandle = link.authorHandle;
  if (link.authorAvatar) payload.authorAvatar = link.authorAvatar;
  if (link.verified !== undefined) payload.verified = link.verified;
  if (link.badge) payload.badge = link.badge;
  if (link.displayTimeAgo) payload.displayTimeAgo = link.displayTimeAgo;
  if (link.collectionId) payload.collectionId = link.collectionId;
  if (link.originalText) payload.originalText = link.originalText;
  if (link.assetFormat) payload.assetFormat = link.assetFormat;
  if (link.extractedInsight) payload.extractedInsight = link.extractedInsight;
  if (link.readTime) payload.readTime = link.readTime;

  try {
    await setDoc(linkRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete Link from Firestore
export async function deleteLinkFromFirestore(userId: string, linkId: string): Promise<void> {
  const path = `users/${userId}/links/${linkId}`;
  const linkRef = doc(db, 'users', userId, 'links', linkId);
  try {
    await deleteDoc(linkRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Save or Update Collection in Firestore
export async function saveCollectionToFirestore(
  userId: string,
  collectionItem: CoachingCollection
): Promise<void> {
  const path = `users/${userId}/collections/${collectionItem.id}`;
  const colRef = doc(db, 'users', userId, 'collections', collectionItem.id);
  const payload: Record<string, any> = {
    id: collectionItem.id,
    userId,
    title: collectionItem.title,
  };

  if (collectionItem.subtitle) payload.subtitle = collectionItem.subtitle;
  if (collectionItem.tags && collectionItem.tags.length > 0) payload.tags = collectionItem.tags;
  if (collectionItem.color) payload.color = collectionItem.color;
  if (collectionItem.coachSynthesis) payload.coachSynthesis = collectionItem.coachSynthesis;
  if (collectionItem.linkIds) payload.linkIds = collectionItem.linkIds;
  if (collectionItem.readinessScore !== undefined) payload.readinessScore = collectionItem.readinessScore;
  if (collectionItem.updatedAt) payload.updatedAt = collectionItem.updatedAt;
  if (collectionItem.activePillar !== undefined) payload.activePillar = collectionItem.activePillar;

  try {
    await setDoc(colRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete Collection from Firestore
export async function deleteCollectionFromFirestore(
  userId: string,
  collectionId: string
): Promise<void> {
  const path = `users/${userId}/collections/${collectionId}`;
  const colRef = doc(db, 'users', userId, 'collections', collectionId);
  try {
    await deleteDoc(colRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Batch Sync Local Data to Cloud
export async function syncLocalDataToFirestore(
  userId: string,
  links: SocialLink[],
  collections: CoachingCollection[]
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const batch = writeBatch(db);

    links.forEach((link) => {
      const linkRef = doc(db, 'users', userId, 'links', link.id);
      const payload: Record<string, any> = {
        id: link.id,
        userId,
        url: link.url,
        platform: link.platform,
        title: link.title,
        dateAdded: link.dateAdded,
      };
      if (link.notes) payload.notes = link.notes;
      if (link.tags) payload.tags = link.tags;
      if (link.author) payload.author = link.author;
      if (link.authorHandle) payload.authorHandle = link.authorHandle;
      if (link.collectionId) payload.collectionId = link.collectionId;
      if (link.originalText) payload.originalText = link.originalText;
      if (link.assetFormat) payload.assetFormat = link.assetFormat;
      batch.set(linkRef, payload, { merge: true });
    });

    collections.forEach((col) => {
      const colRef = doc(db, 'users', userId, 'collections', col.id);
      const payload: Record<string, any> = {
        id: col.id,
        userId,
        title: col.title,
      };
      if (col.subtitle) payload.subtitle = col.subtitle;
      if (col.tags) payload.tags = col.tags;
      if (col.color) payload.color = col.color;
      if (col.coachSynthesis) payload.coachSynthesis = col.coachSynthesis;
      if (col.linkIds) payload.linkIds = col.linkIds;
      if (col.readinessScore !== undefined) payload.readinessScore = col.readinessScore;
      batch.set(colRef, payload, { merge: true });
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Subscribe to User Vault (Real-time synchronization)
export function subscribeToUserVault(
  userId: string,
  onLinks: (links: SocialLink[]) => void,
  onCollections: (collections: CoachingCollection[]) => void
): () => void {
  const linksPath = `users/${userId}/links`;
  const collectionsPath = `users/${userId}/collections`;

  const unsubLinks = onSnapshot(
    collection(db, 'users', userId, 'links'),
    (snapshot) => {
      const fetchedLinks: SocialLink[] = [];
      snapshot.forEach((docSnap) => {
        fetchedLinks.push(docSnap.data() as SocialLink);
      });
      // Sort newest first
      fetchedLinks.sort(
        (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      );
      onLinks(fetchedLinks);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, linksPath);
    }
  );

  const unsubCollections = onSnapshot(
    collection(db, 'users', userId, 'collections'),
    (snapshot) => {
      const fetchedCollections: CoachingCollection[] = [];
      snapshot.forEach((docSnap) => {
        fetchedCollections.push(docSnap.data() as CoachingCollection);
      });
      onCollections(fetchedCollections);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, collectionsPath);
    }
  );

  return () => {
    unsubLinks();
    unsubCollections();
  };
}
