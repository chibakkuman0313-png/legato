// Legato Service Worker v1
const CACHE_NAME = 'legato-v1';
const OFFLINE_PAGE = '/index.html';

// ── インストール：オフラインページをキャッシュ ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([OFFLINE_PAGE, '/']);
    })
  );
  // 古いSWを即座に置き換える
  self.skipWaiting();
});

// ── アクティベート：古いキャッシュを削除 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── フェッチ戦略 ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 外部リクエストはSWを通さない
  if (url.origin !== location.origin) return;

  // ナビゲーション（HTMLページ）: Network First → オフライン時は/index.htmlを返す
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 成功したらキャッシュも更新
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // JS/CSS/画像など静的アセット: Cache First → なければネットワーク
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // その他: そのまま通す
});

// ── プッシュ通知（将来の拡張用） ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Legato', {
      body: data.body || '',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
    })
  );
});
