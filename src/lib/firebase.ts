// ==============================================================================
// FIREBASE CONFIGURATION — Odyssey.ai
// Auth (Email + Google) + Firestore
// ==============================================================================

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  NextOrObserver,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDXch5wQxmCzJJ8MttAly0fD_Ej09iUu8o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jarvis-53b7c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jarvis-53b7c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jarvis-53b7c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "586497768527",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:586497768527:web:88846b1e5320fc5021be3a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3WGS3MWDH0",
};

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export type AuthResult = {
  user: User | null;
  error: AuthError | null;
  message: string;
};

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null, message: "Connexion réussie!" };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: authError, message: getAuthErrorMessage(authError.code) };
  }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user);
    return { user: result.user, error: null, message: "Compte créé avec succès!" };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: authError, message: getAuthErrorMessage(authError.code) };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    await createUserProfile(result.user);
    return { user: result.user, error: null, message: "Connexion avec Google réussie!" };
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/popup-closed-by-user') {
      return { user: null, error: authError, message: "Connexion annulée." };
    }
    return { user: null, error: authError, message: getAuthErrorMessage(authError.code) };
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Email de réinitialisation envoyé!" };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, message: getAuthErrorMessage(authError.code) };
  }
}

export async function updateDisplayName(name: string): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, { displayName: name });
    await updateUserProfile(user.uid, { full_name: name });
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: NextOrObserver<User>): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function createUserProfile(user: User): Promise<void> {
  const userRef = doc(db, "profiles", user.uid);
  await setDoc(userRef, {
    id: user.uid,
    email: user.email,
    full_name: user.displayName || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    odyssey_score: 500,
    mental_clarity: 50,
    countries_simulated: 0,
    network_nodes: 0,
    preferences: { language: "fr", theme: "dark" },
  }, { merge: true });
}

export async function getUserProfile(userId: string): Promise<DocumentData | null> {
  const docRef = doc(db, "profiles", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export async function updateUserProfile(userId: string, data: Partial<DocumentData>): Promise<void> {
  const userRef = doc(db, "profiles", userId);
  await setDoc(userRef, { ...data, updated_at: new Date().toISOString() }, { merge: true });
}

export async function firestoreRead(collectionName: string, constraints: QueryConstraint[] = []): Promise<DocumentData[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function firestoreWrite(collectionName: string, docId: string, data: DocumentData): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
}

export const COLLECTIONS = {
  PROFILES: "profiles",
  SIMULATIONS: "simulations",
  POSTS: "posts",
  CONVERSATIONS: "conversations",
  SKILL_TRACKS: "skill_tracks",
  SKILL_MISSIONS: "skill_missions",
  LANGUAGE_PROFILES: "language_profiles",
  LANGUAGE_PROGRESS: "language_progress",
  LANGUAGE_LESSONS: "language_lessons",
  CHECKINS: "checkins",
  MATCHES: "matches",
  BADGES: "badges",
  AUDIT_LOG: "audit_log",
};

function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Cet email est déjà utilisé.",
    "auth/invalid-email": "Email invalide.",
    "auth/operation-not-allowed": "Opération non autorisée.",
    "auth/weak-password": "Mot de passe trop faible (min 6 caractères).",
    "auth/user-disabled": "Ce compte a été désactivé.",
    "auth/user-not-found": "Compte non trouvé.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Identifiants incorrects.",
    "auth/too-many-requests": "Trop de tentatives. Réessaie plus tard.",
    "auth/network-request-failed": "Erreur de connexion réseau.",
    "auth/popup-closed-by-user": "Connexion annulée.",
  };
  return messages[code] || "Une erreur est survenue.";
}

export { app, auth, db };
export type { User };
