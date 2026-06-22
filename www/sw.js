/* Nanda Tasks service worker — offline app shell + notification click handling.
   Network-first for the page so updates land as soon as you're online; Firebase
   traffic is left untouched so live data keeps syncing. */
const VERSION = 'v2026-06-13.50';            /* bump this every deploy (kept in sync with the app version) so the browser sees a new service worker and updates the installed app automatically */
const CACHE = 'nanda-tasks-' + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {  // cache the web fonts so they show offline / in the installed app
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req).then(hit => {
        const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;           // let Firebase / CDN go straight to network
  if (req.mode === 'navigate') {                              // app page: latest when online, cached when offline
    e.respondWith(
      fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(c => c || fetch(req)));  // static files: cache-first
});

/* a push arrives from the scheduler — show it even when the app is closed */
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: 'Nanda Tasks', body: e.data ? e.data.text() : '' }; }
  const title = data.title || 'Nanda Tasks';
  const opts = {
    body: data.body || 'You have a task reminder.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.tag || 'nanda-reminder',
    renotify: true,
    vibrate: [120, 60, 120],
    data: { url: data.url || './' }
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

/* tapping a task notification focuses (or opens) the app */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
