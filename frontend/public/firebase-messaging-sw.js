// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBE5n4buEI2dDXWm_ACCLwQS74UXHksXp8",
  authDomain: "supply-chain-76169.firebaseapp.com",
  projectId: "supply-chain-76169",
  storageBucket: "supply-chain-76169.firebasestorage.app",
  messagingSenderId: "855846841440",
  appId: "1:855846841440:web:f262ca3e1a86d090e76705",
});

const messaging = firebase.messaging();

// Handle background messages (app closed / not focused)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const title = payload.notification?.title || '⚡ Supply Chain Alert';
  const body  = payload.notification?.body  || 'Disruption detected — Gemini AI is rerouting.';

  self.registration.showNotification(title, {
    body,
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    tag:     'supply-chain-alert',      // replaces previous notification rather than stacking
    data:    payload.data || {},
    actions: [
      { action: 'view',    title: '📊 View Dashboard' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
});

// Click on notification → focus / open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(self.location.origin);
    })
  );
});
