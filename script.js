/* The diary remains build-free and all published schedules live in calendar.csv. */
(() => {
  "use strict";
  const { dateKey, parseDate, addDays, weekDates, parseCalendar, dayStatus } =
    DiaryData;
  const $ = (id) => document.getElementById(id);
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const icons = () =>
    window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
  const format = (date, options) =>
    new Intl.DateTimeFormat("ca", options).format(date);
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const today = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  };
  const shortDay = (date) =>
    ["dg", "dl", "dt", "dc", "dj", "dv", "ds"][date.getDay()];
  const SONGS_BY_MONTH = {
    "2026-05": "https://www.youtube.com/watch?v=RuqvGiZi0qg",
  };
  const initialParams = new URLSearchParams(location.search);
  const state = {
    selected: parseDate(initialParams.get("date")) || today(),
    view: initialParams.get("view") === "week" ? "week" : "day",
    data: {},
    loaded: false,
    failed: false,
    stale: false,
    calendarMonth: today(),
  };
  let toastTimer,
    lastCalendarTrigger,
    refreshing = false;
  const FIRST_DATE = new Date(1900, 0, 1, 12),
    LAST_DATE = new Date(2100, 11, 31, 12);
  const clampDate = (date) =>
    date < FIRST_DATE ? FIRST_DATE : date > LAST_DATE ? LAST_DATE : date;
  const saved = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const persist = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  function notify(message) {
    $("toast").textContent = message;
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      $("toast").hidden = true;
    }, 3500);
  }
  function updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set("date", dateKey(state.selected));
    if (state.view === "week") url.searchParams.set("view", "week");
    else url.searchParams.delete("view");
    history.replaceState(null, "", url);
  }
  function select(date, view = state.view) {
    state.selected = clampDate(date);
    state.view = view;
    updateUrl();
    render();
  }
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $("theme-btn").setAttribute(
      "aria-label",
      theme === "dark" ? "Activa el tema clar" : "Activa el tema fosc",
    );
    document.querySelector('meta[name="theme-color"]').content =
      theme === "dark" ? "#19251f" : "#FFF9F0";
  }
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  let manualTheme = saved("fishes-theme", null);
  setTheme(
    ["dark", "light"].includes(manualTheme)
      ? manualTheme
      : systemTheme.matches
        ? "dark"
        : "light",
  );
  systemTheme.addEventListener("change", (e) => {
    if (!manualTheme) setTheme(e.matches ? "dark" : "light");
  });
  $("theme-btn").addEventListener("click", () => {
    manualTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(manualTheme);
    persist("fishes-theme", manualTheme);
  });

  function renderHeader() {
    const now = today(),
      startYear =
        now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    $("course-label").textContent =
      `Curs ${startYear}/${String(startYear + 1).slice(-2)}`;
    $("daily-btn").setAttribute("aria-pressed", state.view === "day");
    $("weekly-btn").setAttribute("aria-pressed", state.view === "week");
    $("date-context").textContent =
      state.view === "week"
        ? String(state.selected.getFullYear())
        : capitalize(format(state.selected, { weekday: "long" }));
    const week = weekDates(state.selected);
    $("date-title").textContent =
      state.view === "week"
        ? `${format(week[0], { day: "numeric", month: "short" })} - ${format(week[6], { day: "numeric", month: "short" })}`
        : format(state.selected, { day: "numeric", month: "long" });
    $("date-title").setAttribute(
      "aria-label",
      format(state.selected, { dateStyle: "full" }),
    );
    $("prev-day-btn").setAttribute(
      "aria-label",
      state.view === "week" ? "Setmana anterior" : "Dia anterior",
    );
    $("next-day-btn").setAttribute(
      "aria-label",
      state.view === "week" ? "Setmana següent" : "Dia següent",
    );
    $("prev-day-btn").disabled = state.selected <= FIRST_DATE;
    $("next-day-btn").disabled = state.selected >= LAST_DATE;
    $("week-strip").innerHTML = week
      .map((date) => {
        const key = dateKey(date),
          status = dayStatus(date, state.data);
        return `<button class="week-day ${key === dateKey(now) ? "is-today" : ""} ${state.data[key] ? "has-data" : ""} ${status === "holiday" ? "is-holiday" : ""}" data-date="${key}" aria-pressed="${key === dateKey(state.selected)}" ${key === dateKey(now) ? 'aria-current="date"' : ""} aria-label="${shortDay(date)} ${date.getDate()}, ${escape(format(date, { dateStyle: "full" }))}" ${!parseDate(key) ? "disabled" : ""}><span>${shortDay(date)}</span> <strong>${date.getDate()}</strong></button>`;
      })
      .join("");
    $("share-btn").innerHTML =
      `${icon("link")}Copia ${state.view === "week" ? "la setmana" : "el dia"}`;
    const keys = Object.keys(state.data).sort();
    $("data-range").textContent = keys.length
      ? `Dades: ${format(parseDate(keys[0]), { month: "short" })} - ${format(parseDate(keys.at(-1)), { month: "short", year: "numeric" })}`
      : "";
  }
  function renderNotice() {
    const key = dateKey(state.selected).slice(0, 7);
    const hasMonth = Object.keys(state.data).some((d) => d.startsWith(key));
    $("schedule-status").innerHTML =
      state.loaded && !hasMonth
        ? `<div class="schedule-notice">${icon("calendar-clock")}<div><strong>Encara no tenim la programació de ${escape(format(state.selected, { month: "long", year: "numeric" }))}.</strong><p>El menú i les activitats apareixeran quan es publiquin.</p><button class="text-button" data-action="archive">Consulta l’últim dia publicat ${icon("arrow-up-right")}</button></div></div>`
        : "";
  }
  function activity(text, key) {
    const song = SONGS_BY_MONTH[key.slice(0, 7)];
    return `${escape(text)}${song && text.toLowerCase().includes("cançó") ? `<br><a class="song-link" href="${song}" target="_blank" rel="noreferrer">${icon("play")}Escolta la cançó</a>` : ""}`;
  }
  const { character, forActivities } = DiaryCharacters;
  function renderDay() {
    const key = dateKey(state.selected),
      row = state.data[key],
      status = dayStatus(state.selected, state.data);
    if (status === "school") {
      const mealLabels = ["Primer plat", "Segon plat", "Per acabar"];
      return `${row.label ? `<div class="special-day">${icon("party-popper")}<span>${escape(row.label)}</span></div>` : ""}<div class="day-cards"><section class="diary-card menu-card">${character("foodie")}<div class="card-heading"><span>${icon("utensils")}</span><h2>Menú</h2></div>${row.menu.length ? `<ol class="meal-list">${row.menu.map((meal, i) => `<li><span class="meal-number" aria-hidden="true">${i + 1}</span><div>${mealLabels[i] ? `<span class="meal-label">${mealLabels[i]}</span>` : ""}<span class="meal-text">${escape(meal)}</span></div></li>`).join("")}</ol>` : "<p>Menú pendent de publicar.</p>"}</section><section class="diary-card activities-card personality-${forActivities(row.activities)}">${character(forActivities(row.activities))}<div class="card-heading"><span>${icon("shapes")}</span><h2>Activitats</h2></div>${row.activities.length ? `<ul class="activity-list">${row.activities.map((text) => `<li>${activity(text, key)}</li>`).join("")}</ul>` : "<p>Activitats pendents de publicar.</p>"}</section></div>`;
    }
    const title =
      status === "holiday"
        ? row.label || "Dia festiu"
        : status === "weekend"
          ? "Cap de setmana"
          : "Programació pendent";
    const body =
      status === "holiday"
        ? "Gaudiu del dia lliure!"
        : status === "weekend"
          ? ""
          : "Encara no hi ha menú ni activitats publicats per a aquest dia. Torna-hi més endavant.";
    return `<section class="empty-day ${status}">${character(status === "weekend" ? "swimmer" : "artist")}<span class="empty-icon">${icon(status === "unpublished" ? "sprout" : status === "weekend" ? "sun" : "party-popper")}</span><h2>${escape(title)}</h2><p>${body}</p>${status === "unpublished" ? '<button class="text-button" data-action="refresh">Torna a comprovar</button>' : ""}</section>`;
  }
  function renderWeek() {
    return `<div class="week-list">${weekDates(state.selected)
      .map((date) => {
        const key = dateKey(date),
          row = state.data[key],
          status = dayStatus(date, state.data);
        let title, detail;
        if (status === "school") {
          title = row.menu.join(" · ") || "Menú pendent de publicar";
          detail =
            row.activities.join(" · ") || "Activitats pendents de publicar";
        } else {
          title =
            status === "holiday"
              ? row.label || "Dia festiu"
              : status === "weekend"
                ? "Cap de setmana"
                : "Programació pendent";
          detail =
            status === "unpublished"
              ? "Encara no hi ha menú ni activitats."
              : "Gaudiu del dia lliure!";
        }
        return `<button class="week-row ${status !== "school" ? "free" : ""} ${key === dateKey(state.selected) ? "selected" : ""}" data-week-date="${key}" aria-label="${shortDay(date)} ${date.getDate()}, ${escape(title)}, ${escape(detail)}. Obre ${escape(format(date, { dateStyle: "full" }))}" ${!parseDate(key) ? "disabled" : ""}><span class="week-date"><span>${shortDay(date)}</span> <strong>${date.getDate()}</strong></span><span class="week-summary">${status === "school" && row.label ? `<span class="week-special">${escape(row.label)}</span>` : ""}<span class="week-row-title">${escape(title)}</span><span class="week-row-detail">${escape(detail)}</span></span>${status === "school" ? character(forActivities(row.activities), true) : icon("chevron-right")}</button>`;
      })
      .join("")}</div>`;
  }
  function render() {
    renderHeader();
    renderNotice();
    renderChecklist();
    if (state.loaded)
      $("main-container").innerHTML =
        state.view === "week" ? renderWeek() : renderDay();
    else if (state.failed)
      $("main-container").innerHTML =
        `<section class="empty-day unpublished"><span class="empty-icon">${icon("cloud-off")}</span><h2>No hem pogut carregar el diari.</h2><p>Comprova la connexió i torna-ho a provar.</p><button class="text-button" data-action="refresh">Torna-ho a provar</button></section>`;
    $("main-container").setAttribute(
      "aria-busy",
      !state.loaded && !state.failed,
    );
    icons();
  }
  function archive() {
    const key = Object.keys(state.data).sort().at(-1);
    if (key) select(parseDate(key), "day");
  }
  function connectionStatus() {
    const el = $("connection-status");
    el.hidden = navigator.onLine && !state.stale;
    el.textContent = !navigator.onLine
      ? "Sense connexió. Mostrem les dades desades; podrien haver canviat."
      : "No hem pogut actualitzar les dades. Mostrem l’última còpia desada.";
  }
  async function loadData(userInitiated = false) {
    if (refreshing) return;
    refreshing = true;
    document.querySelectorAll('[data-action="refresh"]').forEach((btn) => {
      btn.disabled = true;
      btn.textContent = "Comprovant…";
    });
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch("./calendar.csv", {
        cache: "no-cache",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = parseCalendar(await response.text());
      state.data = data;
      state.loaded = true;
      state.failed = false;
      state.stale = response.headers.get("X-Fishes-Cached") === "true";
      if (userInitiated)
        notify(
          state.stale
            ? "Mostrem la còpia desada. No s’ha pogut connectar."
            : "Programació comprovada.",
        );
    } catch (error) {
      state.failed = !state.loaded;
      state.stale = state.loaded;
      if (userInitiated)
        notify("No s’ha pogut actualitzar. Torna-ho a provar.");
      console.warn("No s’ha pogut carregar el calendari:", error.message);
    } finally {
      clearTimeout(timeout);
      refreshing = false;
      render();
      connectionStatus();
    }
  }
  $("today-btn").addEventListener("click", () => select(today()));
  $("daily-btn").addEventListener("click", () => select(state.selected, "day"));
  $("weekly-btn").addEventListener("click", () =>
    select(state.selected, "week"),
  );
  const move = (delta) =>
    select(addDays(state.selected, delta * (state.view === "week" ? 7 : 1)));
  $("prev-day-btn").addEventListener("click", () => move(-1));
  $("next-day-btn").addEventListener("click", () => move(1));
  $("week-strip").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (btn) select(parseDate(btn.dataset.date));
  });
  $("diary").addEventListener("click", (e) => {
    const weekBtn = e.target.closest("[data-week-date]");
    if (weekBtn) {
      select(parseDate(weekBtn.dataset.weekDate), "day");
      $("daily-btn").focus();
    }
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "archive") {
      archive();
      $("date-title").tabIndex = -1;
      $("date-title").focus();
    }
    if (action === "refresh") loadData(true);
  });
  $("share-btn").addEventListener("click", async () => {
    updateUrl();
    try {
      await navigator.clipboard.writeText(location.href);
      notify("Enllaç copiat! Ja el pots compartir.");
    } catch {
      notify("Copia l’enllaç de la barra d’adreces per compartir-lo.");
    }
  });
  let touch;
  $("main-container").addEventListener(
    "touchstart",
    (e) => {
      if (e.target.closest("a,button,input")) return;
      touch = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
    },
    { passive: true },
  );
  $("main-container").addEventListener(
    "touchend",
    (e) => {
      if (!touch) return;
      const dx = e.changedTouches[0].clientX - touch.x,
        dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5)
        move(dx > 0 ? -1 : 1);
    },
    { passive: true },
  );
  $("main-container").addEventListener("touchcancel", () => {
    touch = null;
  });

  // Native dialog supplies modal semantics, Escape and a keyboard focus trap.
  function renderCalendar(focusDate) {
    const month = state.calendarMonth,
      y = month.getFullYear(),
      m = month.getMonth();
    $("calendar-month").textContent = format(month, {
      month: "long",
      year: "numeric",
    });
    $("prev-month").disabled = y === 1900 && m === 0;
    $("next-month").disabled = y === 2100 && m === 11;
    $("last-published").disabled = !state.loaded;
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    let html = '<span aria-hidden="true"></span>'.repeat(offset);
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
      const date = new Date(y, m, d, 12),
        key = dateKey(date),
        row = state.data[key];
      html += `<button class="calendar-day ${row ? "has-data" : ""} ${row?.type === "holiday" ? "is-holiday" : ""}" data-date="${key}" aria-pressed="${key === dateKey(state.selected)}" ${key === dateKey(today()) ? 'aria-current="date"' : ""} aria-label="${escape(format(date, { dateStyle: "full" }))}${row?.type === "holiday" ? ", festiu" : row ? ", amb programació" : ""}">${d}</button>`;
    }
    $("calendar-grid").innerHTML = html;
    if (focusDate)
      $("calendar-grid")
        .querySelector(`[data-date="${dateKey(focusDate)}"]`)
        ?.focus();
    icons();
  }
  $("calendar-toggle-btn").addEventListener("click", () => {
    lastCalendarTrigger = document.activeElement;
    state.calendarMonth = new Date(
      state.selected.getFullYear(),
      state.selected.getMonth(),
      1,
      12,
    );
    renderCalendar();
    $("calendar-dialog").showModal();
    $("calendar-grid")
      .querySelector(`[data-date="${dateKey(state.selected)}"]`)
      ?.focus();
  });
  const closeCalendar = () => $("calendar-dialog").close();
  $("close-calendar").addEventListener("click", closeCalendar);
  $("calendar-dialog").addEventListener("close", () =>
    lastCalendarTrigger?.focus(),
  );
  $("calendar-dialog").addEventListener("click", (e) => {
    if (e.target === $("calendar-dialog")) {
      const rect = e.target.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        closeCalendar();
    }
  });
  $("prev-month").addEventListener("click", () => {
    state.calendarMonth = new Date(
      state.calendarMonth.getFullYear(),
      state.calendarMonth.getMonth() - 1,
      1,
      12,
    );
    renderCalendar();
  });
  $("next-month").addEventListener("click", () => {
    state.calendarMonth = new Date(
      state.calendarMonth.getFullYear(),
      state.calendarMonth.getMonth() + 1,
      1,
      12,
    );
    renderCalendar();
  });
  $("calendar-grid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-date]");
    if (btn) {
      select(parseDate(btn.dataset.date), "day");
      closeCalendar();
    }
  });
  $("calendar-grid").addEventListener("keydown", (e) => {
    const date = parseDate(e.target.dataset.date);
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!date || !(e.key in deltas)) return;
    e.preventDefault();
    const next = clampDate(addDays(date, deltas[e.key]));
    state.calendarMonth = new Date(next.getFullYear(), next.getMonth(), 1, 12);
    renderCalendar(next);
  });
  $("calendar-today").addEventListener("click", () => {
    select(today(), "day");
    closeCalendar();
  });
  $("last-published").addEventListener("click", () => {
    archive();
    closeCalendar();
  });

  // School-supplied requirements only. Old personal suggestions are not imported.
  const storedChecks = saved("fishes-supply-checks-v2", {});
  const checked =
    storedChecks &&
    typeof storedChecks === "object" &&
    !Array.isArray(storedChecks)
      ? storedChecks
      : {};
  const itemId = (key, text) => `${key}:${text}`;
  function suppliedDays() {
    const dates =
      state.view === "week" ? weekDates(state.selected) : [state.selected];
    return dates
      .map((date) => ({
        date,
        key: dateKey(date),
        row: state.data[dateKey(date)],
      }))
      .filter((day) => day.row?.supplies?.length);
  }
  function renderChecklist(focusId) {
    const days = suppliedDays();
    const entries = days.flatMap((day) =>
      day.row.supplies.map((text) => ({ id: itemId(day.key, text), text })),
    );
    $("bag-content").hidden = !entries.length;
    $("bag-count").hidden = !entries.length;
    $("bag-count").textContent = entries.length;
    $("checklist").innerHTML = days
      .map(
        (day) =>
          `<div class="supplies-day">${state.view === "week" ? `<h3>${escape(format(day.date, { weekday: "short", day: "numeric", month: "short" }))}</h3>` : ""}${day.row.supplies.map((text) => `<div class="check-row"><label><input type="checkbox" data-item="${escape(itemId(day.key, text))}" ${checked[itemId(day.key, text)] === true ? "checked" : ""}><span>${escape(text)}</span></label></div>`).join("")}<p class="supply-source">${escape(day.row.supplySource)}</p></div>`,
      )
      .join("");
    $("checklist-progress").textContent = entries.length
      ? `${entries.filter((item) => checked[item.id] === true).length} / ${entries.length}`
      : "";
    $("reset-list").disabled = !entries.some(
      (item) => checked[item.id] === true,
    );
    if (focusId)
      Array.from($("checklist").querySelectorAll("input"))
        .find((input) => input.dataset.item === focusId)
        ?.focus();
  }
  function saveChecklist() {
    $("storage-warning").hidden = persist("fishes-supply-checks-v2", checked);
    $("storage-warning").textContent =
      "No s’ha pogut desar la selecció en aquest dispositiu.";
  }
  $("checklist").addEventListener("change", (e) => {
    const id = e.target.dataset.item;
    if (!id) return;
    if (e.target.checked) checked[id] = true;
    else delete checked[id];
    saveChecklist();
    renderChecklist(id);
  });
  $("reset-list").addEventListener("click", () => {
    for (const day of suppliedDays())
      for (const text of day.row.supplies)
        delete checked[itemId(day.key, text)];
    saveChecklist();
    renderChecklist();
  });
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let pauseMotion = saved("fishes-motion-paused", false) === true;
  function syncMotion() {
    const paused = pauseMotion || reducedMotion.matches;
    document.documentElement.dataset.motion = paused ? "paused" : "playing";
    $("motion-btn").setAttribute("aria-pressed", String(paused));
    $("motion-btn").setAttribute(
      "aria-label",
      paused ? "Activa les animacions" : "Atura les animacions",
    );
    $("motion-btn").innerHTML = icon(paused ? "play" : "pause");
    $("motion-btn").hidden = reducedMotion.matches;
    icons();
  }
  $("motion-btn").addEventListener("click", () => {
    pauseMotion = !pauseMotion;
    persist("fishes-motion-paused", pauseMotion);
    syncMotion();
  });
  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();
  window.addEventListener("online", () => loadData());
  window.addEventListener("offline", connectionStatus);
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    state.selected = parseDate(params.get("date")) || today();
    state.view = params.get("view") === "week" ? "week" : "day";
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      renderHeader();
      icons();
    }
  });
  renderChecklist();
  render();
  connectionStatus();
  loadData();
  if ("serviceWorker" in navigator)
    navigator.serviceWorker
      .register("./sw.js")
      .catch((error) => console.warn("SW:", error.message));
})();
