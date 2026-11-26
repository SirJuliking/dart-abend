// Minimaler Service Worker: macht die Seite installierbar, speichert aber nichts zwischen (die App braucht Live-Daten).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
