// Inbait service worker: cache-first for static files, network-first for the news feed.
const VERSION = 'inbait-v3';
const STATIC = [
  './', 'index.html', 'manifest.webmanifest',
  'css/tokens.css', 'css/base.css', 'css/layout.css', 'css/components.css', 'css/modules.css', 'css/print.css',
  'js/theme-init.js', 'js/app.js', 'js/router.js', 'js/store.js', 'js/util.js',
  'js/ui/toast.js', 'js/ui/modal.js', 'js/ui/popover.js', 'js/ui/ring.js', 'js/ui/confetti.js',
  'js/modules/scenes.js', 'js/modules/practice.js', 'js/modules/inbox.js', 'js/modules/calls.js', 'js/modules/chat.js',
  'js/modules/browser.js', 'js/modules/texts.js', 'js/modules/challenge.js', 'js/modules/radar.js', 'js/modules/learn.js',
  'js/modules/hooked.js', 'js/modules/about.js',
  'assets/icons.svg', 'assets/logo.svg', 'assets/favicon.svg', 'assets/favicon-32.png', 'assets/apple-touch-icon.png',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/qr-quishing.svg',
];
const NETWORK_FIRST = /\/(data\/feed(-meta)?\.json|content\/[^/]+\.json)$/;

self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(STATIC))); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (NETWORK_FIRST.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
