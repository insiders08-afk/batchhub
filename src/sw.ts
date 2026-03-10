/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Workbox precache manifest injected at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ─── Push notification handler ───────────────────────────────────────────────
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: { title?: string; body?: string; url?: string; icon?: string } = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "New Announcement", body: event.data.text() };
  }

  const title = payload.title || "BatchHub";
  const options: NotificationOptions = {
    body: payload.body || "",
    icon: payload.icon || "/icons/pwa-192x192.png",
    badge: "/icons/pwa-192x192.png",
    data: { url: payload.url || "/" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: "batchhub-announcement",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click handler ──────────────────────────────────────────────
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const targetUrl: string = (event.notification.data?.url as string) || "/";

  event.waitUntil(
    (self.clients as Clients).matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          (client as WindowClient).navigate(targetUrl);
          return (client as WindowClient).focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
