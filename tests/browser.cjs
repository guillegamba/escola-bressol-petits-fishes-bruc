const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const artifacts = process.env.ARTIFACT_DIR || "test-results";
fs.mkdirSync(artifacts, { recursive: true });
const base = process.env.BASE_URL || "http://127.0.0.1:8000/";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: "Europe/Madrid",
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/_vercel/**", (r) =>
    r.fulfill({ status: 200, body: "" }),
  );
  await page.clock.install({ time: new Date("2026-09-06T12:00:00+02:00") });
  await page.goto(base + "");
  await page.locator(".empty-day").waitFor();
  assert.match(
    await page.locator("#date-title").textContent(),
    /6 de setembre/,
  );
  assert.match(
    await page.locator("#schedule-status").textContent(),
    /setembre del 2026/,
  );
  await page.locator("#next-day-btn").click();
  assert.match(
    await page.locator(".empty-day").textContent(),
    /Encara no hi ha menú/,
  );
  await page.locator("#weekly-btn").click();
  assert.equal(await page.locator(".week-row").count(), 7);
  assert.equal(
    await page
      .locator(".week-row")
      .filter({ hasText: "Programació pendent" })
      .count(),
    5,
  );
  await page.locator('[data-week-date="2026-09-07"]').click();
  assert.equal(
    await page.locator("#daily-btn").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#calendar-toggle-btn").click();
  assert.equal(
    await page.locator("#calendar-dialog").evaluate((e) => e.open),
    true,
  );
  await page.keyboard.press("ArrowLeft");
  assert.equal(
    await page.evaluate(() => document.activeElement.dataset.date),
    "2026-09-06",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#calendar-dialog").evaluate((e) => e.open),
    false,
  );
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "calendar-toggle-btn",
  );
  await page.locator('[data-action="archive"]').click();
  assert.match(await page.locator("#date-title").textContent(), /31 de juliol/);
  assert.match(
    await page.locator(".menu-card").textContent(),
    /Arròs a la cubana/,
  );
  assert.equal(await page.locator("#bag-content").isVisible(), false);
  assert.equal(await page.locator("#checklist").textContent(), "");
  await page.evaluate(() =>
    localStorage.setItem(
      "fishes-bag-v1",
      JSON.stringify([{ id: "old", text: "Roba de recanvi", done: false }]),
    ),
  );
  await page.reload();
  await page.locator(".menu-card").waitFor();
  assert.equal(await page.locator("#checklist").textContent(), "");
  const fixture =
    "Date,Type,Label,Activities,Menu,Supplies,SupplySource\n2026-09-07,school,,Pintura,Arròs,Davantal|Tovallola,fixture.pdf p.2\n2026-09-08,school,,Piscina,Sopa,Tovallola,fixture.pdf p.3\n";
  await page.route("**/calendar.csv", (route) =>
    route.fulfill({ status: 200, body: fixture }),
  );
  await page.goto(base + "?date=2026-09-07");
  await page.locator(".menu-card").waitFor();
  assert.equal(await page.locator("#bag-content").isVisible(), true);
  assert.match(
    await page.locator("#checklist").textContent(),
    /fixture.pdf p.2/,
  );
  await page.getByLabel("Davantal", { exact: true }).check();
  await page.reload();
  await page.locator(".menu-card").waitFor();
  assert.equal(
    await page.getByLabel("Davantal", { exact: true }).isChecked(),
    true,
  );
  await page.locator("#next-day-btn").click();
  assert.equal(
    await page.getByLabel("Tovallola", { exact: true }).isChecked(),
    false,
  );
  assert.equal(await page.locator(".mascot-swimmer").count(), 1);
  await page.locator("#weekly-btn").click();
  assert.equal(await page.locator(".supplies-day").count(), 2);
  assert.equal(await page.locator("#checklist input").count(), 3);
  await page.locator("#reset-list").click();
  assert.equal(await page.locator("#checklist input:checked").count(), 0);
  await page.locator("#daily-btn").click();
  await page.locator("#next-day-btn").click();
  assert.equal(await page.locator("#bag-content").isVisible(), false);
  await page.unroute("**/calendar.csv");
  await page.goto(base + "?date=2026-05-06");
  await page.locator(".menu-card").waitFor();
  assert.ok(
    (await page.locator(".song-link").first().getAttribute("href")).startsWith(
      "https://www.youtube.com/",
    ),
  );
  await page.goto(base + "?date=2026-07-24");
  await page.locator(".menu-card").waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `overflow at ${width}`,
    );
  }
  await page.screenshot({
    path: path.join(artifacts, "desktop-final.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.locator(".menu-card").waitFor();
  await page.screenshot({
    path: path.join(artifacts, "mobile-final.png"),
    fullPage: true,
  });
  await page.locator("#theme-btn").click();
  await page.screenshot({
    path: path.join(artifacts, "dark-final.png"),
    fullPage: true,
  });
  await page.locator("#calendar-toggle-btn").click();
  await page.screenshot({
    path: path.join(artifacts, "calendar-final.png"),
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.locator("#theme-btn").click();
  await page.locator("#weekly-btn").click();
  await page.screenshot({
    path: path.join(artifacts, "week-final.png"),
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base + "?date=2026-07-23");
  await page.locator(".menu-card").waitFor();
  assert.equal(await page.locator(".mascot-sporty").count(), 1);
  assert.equal(
    await page
      .locator(".mascot-ball")
      .evaluate((el) => getComputedStyle(el).animationName),
    "ball-bounce",
  );
  await page.locator("#motion-btn").click();
  assert.equal(
    await page
      .locator(".mascot-ball")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.reload();
  await page.locator(".menu-card").waitFor();
  assert.equal(
    await page.locator("#motion-btn").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#motion-btn").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".mascot-ball")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.locator("#motion-btn").waitFor({ state: "hidden" });
  assert.equal(
    await page.locator(".welcome,.family-note,#checklist-form").count(),
    0,
  );
  await page.route("**/calendar.csv", (r) =>
    r.fulfill({ status: 200, body: "<html>not a csv</html>" }),
  );
  await page.reload();
  await page
    .getByRole("heading", { name: "No hem pogut carregar el diari." })
    .waitFor();
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(
    "PASS: current date; unpublished weekdays; week view; archive; modal keyboard/focus; source-backed supplies, empty bag, date-scoped persistence; song links; five viewport widths; malformed CSV error.",
  );
  await context.close();
  // Real service worker: cache installation, immediate fresh data, offline shared URLs.
  const offlineContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(base + "?date=2026-07-24");
  await offlinePage.locator(".menu-card").waitFor();
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  await offlinePage.reload();
  await offlinePage.locator(".menu-card").waitFor();
  await offlineContext.setOffline(true);
  await offlinePage.goto(base + "?date=2026-07-23");
  await offlinePage.locator(".menu-card").waitFor();
  assert.equal(
    await offlinePage.locator("#connection-status").isVisible(),
    true,
  );
  assert.match(
    await offlinePage.locator(".menu-card").textContent(),
    /Remenat/,
  );
  assert.equal(await offlinePage.locator(".card-heading svg").count(), 2);
  assert.equal(
    await offlinePage.evaluate(() => document.fonts.check("800 16px Nunito")),
    true,
  );
  console.log(
    "PASS: installed service worker, offline shared-date reload, cached meals, offline notice, local icons and font.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
