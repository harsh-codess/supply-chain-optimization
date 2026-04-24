import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import type { FirestoreDisruption } from "../types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Only initialize if config is present
let db: ReturnType<typeof getFirestore> | null = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase not configured:", e);
}

export async function logDisruption(
  nodeId: string,
  risk: number,
  disruptionType: string,
  action?: string
): Promise<void> {
  if (!db) {
    console.warn("Firebase not initialized, skipping log");
    return;
  }
  try {
    await addDoc(collection(db, "disruptions"), {
      nodeId,
      risk,
      disruptionType,
      action: action || null,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to log disruption:", e);
  }
}

export function subscribeToDisruptions(
  callback: (disruptions: FirestoreDisruption[]) => void
): Unsubscribe | null {
  if (!db) {
    console.warn("Firebase not initialized, skipping subscription");
    return null;
  }
  const q = query(
    collection(db, "disruptions"),
    orderBy("timestamp", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const disruptions: FirestoreDisruption[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        nodeId: data.nodeId,
        risk: data.risk,
        disruptionType: data.disruptionType,
        timestamp: data.timestamp?.toDate?.() || new Date(),
        action: data.action,
      };
    });
    callback(disruptions);
  });
}
