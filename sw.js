/* Bump the shell version whenever HTML, CSS, JS or bundled assets change. */
importScripts("./data.js");
const CACHE = "giraffes-v5";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./characters.css",
  "./script.js",
  "./data.js",
  "./characters.js",
  "./calendar.csv",
  "./favicon.png",
  "./manifest.json",
  "./assets/lucide.min.js",
  "./assets/nunito-latin.woff2",
];
const absolute = (path) => new URL(path, self.registration.scope).href;
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith("giraffes-") || key.startsWith("fishes-")) &&
                key !== CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
async function freshCalendar(request) {
  const cache = await caches.open(CACHE),
    controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(request, {
      signal: controller.signal,
      cache: "no-cache",
    });
    if (!response.ok) throw new Error("Calendar unavailable");
    DiaryData.parseCalendar(await response.clone().text());
    await cache.put(absolute("./calendar.csv"), response.clone());
    return response;
  } catch {
    const cached = await cache.match(absolute("./calendar.csv"));
    if (!cached) return new Response("Calendar unavailable", { status: 503 });
    const headers = new Headers(cached.headers);
    headers.set("X-Fishes-Cached", "true");
    return new Response(await cached.arrayBuffer(), { status: 200, headers });
  } finally {
    clearTimeout(timer);
  }
}
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (url.href === absolute("./calendar.csv")) {
    event.respondWith(freshCalendar(event.request));
    return;
  }
  // Only cache our own shell. Analytics and unrelated same-origin apps are excluded.
  if (
    event.request.mode === "navigate" &&
    url.pathname.startsWith(new URL(self.registration.scope).pathname)
  ) {
    event.respondWith(
      caches
        .open(CACHE)
        .then(
          async (cache) =>
            (await cache.match(absolute("./index.html"))) ||
            fetch(event.request),
        ),
    );
    return;
  }
  if (CORE_ASSETS.some((asset) => absolute(asset) === url.href)) {
    event.respondWith(
      caches
        .open(CACHE)
        .then(
          async (cache) =>
            (await cache.match(event.request)) || fetch(event.request),
        ),
    );
  }
});
