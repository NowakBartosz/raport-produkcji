/* Service worker: trzyma kopię aplikacji, żeby otwierała się także bez sieci.
   index.html jest pobierany z sieci przy każdym starcie (kopia tylko awaryjnie).
   Przy zmianie ikon lub manifestu podnieś numer wersji poniżej. */
const CACHE = 'raport-produkcji-v1';
const PLIKI = ['./', './index.html', './manifest.webmanifest', './ikona-192.png', './ikona-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(klucze => Promise.all(klucze.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function zLimitem(obietnica, ms) {
  return Promise.race([obietnica, new Promise((_, nie) => setTimeout(() => nie(new Error('timeout')), ms))]);
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // API Google idzie zawsze do sieci

  if (e.request.mode === 'navigate') {
    // najpierw sieć (żeby złapać aktualizację), po 4 s albo bez sieci – kopia
    e.respondWith(
      zLimitem(fetch(e.request), 4000)
        .then(r => { const kopia = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', kopia)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(traf => traf || fetch(e.request).then(r => {
      if (r.ok) { const kopia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopia)); }
      return r;
    }))
  );
});
