import { initializeApp, type FirebaseApp } from "firebase/app";
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
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { FirestoreDisruption } from "../types";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "",
};

let app: FirebaseApp | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db  = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase not configured:", e);
}

// ── Firestore: log disruptions ──────────────────────────────────────────────

export async function logDisruption(
  nodeId: string,
  risk: number,
  disruptionType: string,
  action?: string
): Promise<void> {
  if (!db) return;
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
  if (!db) return null;
  const q = query(
    collection(db, "disruptions"),
    orderBy("timestamp", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const disruptions: FirestoreDisruption[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        nodeId:         data.nodeId,
        risk:           data.risk,
        disruptionType: data.disruptionType,
        timestamp:      data.timestamp?.toDate?.() || new Date(),
        action:         data.action,
      };
    });
    callback(disruptions);
  });
}

// ── FCM: push notification registration ────────────────────────────────────

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

/**
 * Requests notification permission, registers the service worker,
 * and returns the FCM token (to be sent to the backend).
 * Returns null if permission denied or FCM unavailable.
 */
export async function initPushNotifications(): Promise<string | null> {
  if (!app || !("Notification" in window) || !("serviceWorker" in navigator)) {
    console.warn("Push notifications not supported");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey:          VAPID_KEY,
      serviceWorkerRegistration: reg,
    });

    if (!token) {
      console.warn("No FCM token received — check VAPID key");
      return null;
    }

    console.log("FCM token:", token);

    // Handle foreground messages (app is open) — show a native browser notification
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "⚡ Supply Chain Alert";
      const body  = payload.notification?.body  || "Disruption detected.";
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
    });

    return token;
  } catch (e) {
    console.error("FCM init error:", e);
    return null;
  }
}
