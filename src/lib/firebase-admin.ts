// ==============================================================================
// FIREBASE ADMIN SDK — Server-side Authentication & Database
// ==============================================================================

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// ─── Initialize Firebase Admin ───────────────────────────────────────────────

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function initializeFirebaseAdmin() {
  // Check if already initialized
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return { adminApp, adminAuth, adminDb };
  }

  // For production, use service account credentials from environment
  // For development, we can use default credentials
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      // Production: Use service account
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      // Development: Use default credentials or mock
      console.warn("Firebase Admin: Running in development mode without service account");
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jarvis-53b7c",
      });
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    return { adminApp, adminAuth, adminDb };
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    throw new Error("Firebase Admin SDK initialization failed");
  }
}

// Initialize on module load
const initialized = initializeFirebaseAdmin();
adminApp = initialized.adminApp;
adminAuth = initialized.adminAuth;
adminDb = initialized.adminDb;

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Verify Firebase ID Token
 * Returns decoded token or null if invalid
 */
export async function verifyIdToken(token: string) {
  try {
    // In development without service account, do basic validation
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      // Parse and validate token structure without verification
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      
      // Basic validation: check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }
      
      return payload;
    }
    
    // Production: Full verification
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch {
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const user = await adminDb.collection("profiles").doc(uid).get();
    return user.data()?.role === "admin";
  } catch {
    return false;
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { adminApp, adminAuth, adminDb };
