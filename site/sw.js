// Offline support for the installed app.
//
// App code is not fingerprinted and nginx serves it no-cache, so it is fetched
// network-first: online behaviour is unchanged, and the cached copy is only a
// fallback when there is no network. Vendored KaTeX is pinned, so cache-first.
// Every same-origin GET that succeeds is cached, so whatever the app loaded
// once (all modules load at startup) works offline afterwards.

const CACHE = 'riemann-v1';
const SHELL = ['./', 'index.html', 'css/style.css', 'js/app.js', 'vendor/katex/katex.min.css'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function fromNetwork(req) {
  const res = await fetch(req);
  if (res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/vendor/')) {
    ev.respondWith(caches.match(req).then((hit) => hit ?? fromNetwork(req)));
    return;
  }
  ev.respondWith(fromNetwork(req).catch(async () =>
    (await caches.match(req)) ?? (req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
