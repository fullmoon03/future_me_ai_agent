// 최소 서비스워커 — 앱 셸 캐시(오프라인 시 첫 화면 표시), /api는 절대 캐시하지 않음.
const CACHE = "future-me-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // API와 비-GET은 항상 네트워크 (캐시 금지)
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  // 네비게이션: 네트워크 우선, 실패 시 캐시된 셸
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/").then((r) => r || fetch(e.request))),
    );
    return;
  }

  // 정적 자원: 캐시 우선
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
