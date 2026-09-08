/* The diary remains build-free and all published schedules live in calendar.csv. */
(() => {
  "use strict";
  const {
    dateKey,
    parseDate,
    addDays,
    schoolDates,
    parseCalendar,
    dayKind,
    isWeekend,
  } = DiaryData;
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
    view: ["week", "month"].includes(initialParams.get("view"))
      ? initialParams.get("view")
      : "day",
    data: {},
    loaded: false,
    failed: false,
    stale: false,
  };
  let toastTimer,
    pendingFocus,
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
    if (state.view === "day") url.searchParams.delete("view");
    else url.searchParams.set("view", state.view);
    history.replaceState(null, "", url);
  }
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const addMonths = (date, count) => {
    const year = date.getFullYear(),
      month = date.getMonth() + count;
    return new Date(
      year,
      month,
      Math.min(date.getDate(), daysInMonth(year, month)),
      12,
    );
  };
  function select(date, view = state.view) {
    state.selected = clampDate(date);
    state.view = view;
    updateUrl();
    render();
  }
  /* Weekends live only in the month grid, so they join a week strip or list
     when the school published a row for one, or when one is the day on screen. */
  function weekViewDates() {
    const dates = schoolDates(state.selected, state.data);
    return dates.some((date) => dateKey(date) === dateKey(state.selected))
      ? dates
      : [...dates, state.selected].sort((a, b) => a - b);
  }
  const selectable = (date) => !isWeekend(date) || !!state.data[dateKey(date)];
  /* Friday's next day is Monday. */
  function nextSchoolDay(from, direction) {
    let next = addDays(from, direction);
    for (let i = 0; i < 7 && !selectable(next); i++)
      next = addDays(next, direction);
    return next;
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
    for (const [id, view] of [
      ["daily-btn", "day"],
      ["weekly-btn", "week"],
      ["monthly-btn", "month"],
    ])
      $(id).setAttribute("aria-pressed", state.view === view);
    const month = state.view === "month",
      week = weekViewDates();
    $("date-context").textContent =
      month || state.view === "week"
        ? String(state.selected.getFullYear())
        : capitalize(format(state.selected, { weekday: "long" }));
    $("date-title").textContent = month
      ? capitalize(format(state.selected, { month: "long" }))
      : state.view === "week"
        ? `${format(week[0], { day: "numeric", month: "short" })} - ${format(week.at(-1), { day: "numeric", month: "short" })}`
        : format(state.selected, { day: "numeric", month: "long" });
    $("date-title").setAttribute(
      "aria-label",
      month
        ? format(state.selected, { month: "long", year: "numeric" })
        : format(state.selected, { dateStyle: "full" }),
    );
    const unit = month ? "Mes" : state.view === "week" ? "Setmana" : "Dia";
    $("prev-day-btn").setAttribute("aria-label", `${unit} anterior`);
    $("next-day-btn").setAttribute("aria-label", `${unit} següent`);
    $("prev-day-btn").disabled = state.selected <= FIRST_DATE;
    $("next-day-btn").disabled = state.selected >= LAST_DATE;
    $("week-strip").hidden = month;
    $("week-strip").innerHTML = month
      ? ""
      : week
          .map((date) => {
            const key = dateKey(date);
            return `<button class="week-day kind-${dayKind(date, state.data)} ${key === dateKey(now) ? "is-today" : ""}" data-date="${key}" aria-pressed="${key === dateKey(state.selected)}" ${key === dateKey(now) ? 'aria-current="date"' : ""} aria-label="${shortDay(date)} ${date.getDate()}, ${escape(format(date, { dateStyle: "full" }))}"><span>${shortDay(date)}</span> <strong>${date.getDate()}</strong></button>`;
          })
          .join("");
    $("share-btn").innerHTML =
      `${icon("link")}Copia ${month ? "el mes" : state.view === "week" ? "la setmana" : "el dia"}`;
    const keys = publishedKeys();
    $("data-range").textContent = keys.length
      ? `Dades: ${format(parseDate(keys[0]), { month: "short" })} - ${format(parseDate(keys.at(-1)), { month: "short", year: "numeric" })}`
      : "";
  }
  // Course-calendar rows name a day (a closure, a camp, a workshop) without
  // publishing its programme, so "published" means a menu or activities.
  const publishedKeys = () =>
    Object.entries(state.data)
      .filter(([, row]) => row.menu.length || row.activities.length)
      .map(([key]) => key)
      .sort();
  // "de" elides before a vowel-initial month: d'abril, d'agost, d'octubre.
  const ofMonth = (date) => {
    const label = format(date, { month: "long", year: "numeric" });
    return `${/^[aeiou]/i.test(label) ? "d’" : "de "}${label}`;
  };
  function renderNotice() {
    const key = dateKey(state.selected).slice(0, 7);
    const hasMonth = publishedKeys().some((d) => d.startsWith(key));
    $("schedule-status").innerHTML =
      state.loaded && !hasMonth
        ? `<div class="schedule-notice">${icon("calendar-clock")}<div><strong>Encara no tenim la programació ${escape(ofMonth(state.selected))}.</strong><p>El menú i les activitats apareixeran quan es publiquin.</p><button class="text-button" data-action="archive">Consulta l’últim dia publicat ${icon("arrow-up-right")}</button></div></div>`
        : "";
  }
  function activity(text, key) {
    const song = SONGS_BY_MONTH[key.slice(0, 7)];
    return `${escape(text)}${song && text.toLowerCase().includes("cançó") ? `<br><a class="song-link" href="${song}" target="_blank" rel="noreferrer">${icon("play")}Escolta la cançó</a>` : ""}`;
  }
  const KIND_TEXT = {
    closed: "escola tancada",
    special: "dia especial",
    school: "amb programació",
    weekend: "cap de setmana",
    unpublished: "programació pendent",
  };
  const { character, forActivities } = DiaryCharacters;
  function renderDay() {
    const key = dateKey(state.selected),
      row = state.data[key],
      kind = dayKind(state.selected, state.data);
    if (kind === "school" || kind === "special") {
      const mealLabels = ["Primer plat", "Segon plat", "Per acabar"];
      return `${row.label ? `<div class="day-flag is-special">${icon("party-popper")}<span>${escape(row.label)}</span></div>` : ""}<div class="day-cards"><section class="diary-card menu-card">${character("foodie")}<div class="card-heading"><span>${icon("utensils")}</span><h2>Menú</h2></div>${row.menu.length ? `<ol class="meal-list">${row.menu.map((meal, i) => `<li><span class="meal-number" aria-hidden="true">${i + 1}</span><div>${mealLabels[i] ? `<span class="meal-label">${mealLabels[i]}</span>` : ""}<span class="meal-text">${escape(meal)}</span></div></li>`).join("")}</ol>` : "<p>Menú pendent de publicar.</p>"}</section><section class="diary-card activities-card personality-${forActivities(row.activities)}">${character(forActivities(row.activities))}<div class="card-heading"><span>${icon("shapes")}</span><h2>Activitats</h2></div>${row.activities.length ? `<ul class="activity-list">${row.activities.map((text) => `<li>${activity(text, key)}</li>`).join("")}</ul>` : "<p>Activitats pendents de publicar.</p>"}</section></div>`;
    }
    const closed = kind === "closed";
    const title = closed
      ? row.label || "Dia festiu"
      : kind === "weekend"
        ? "Cap de setmana"
        : "Programació pendent";
    const body = closed
      ? "Gaudiu del dia lliure!"
      : kind === "weekend"
        ? ""
        : "Encara no hi ha menú ni activitats publicats per a aquest dia. Torna-hi més endavant.";
    return `<section class="empty-day ${kind}"><span class="empty-icon">${icon(kind === "unpublished" ? "sprout" : kind === "weekend" ? "sun" : "door-closed")}</span>${closed ? '<span class="day-flag is-closed">Escola tancada</span>' : ""}<h2>${escape(title)}</h2><p>${body}</p>${kind === "unpublished" ? '<button class="text-button" data-action="refresh">Torna a comprovar</button>' : ""}</section>`;
  }
  function renderWeek() {
    return `<div class="week-list">${weekViewDates()
      .map((date) => {
        const key = dateKey(date),
          row = state.data[key],
          kind = dayKind(date, state.data),
          open = kind === "school" || kind === "special";
        let title, detail;
        if (open) {
          title = row.menu.join(" · ") || "Menú pendent de publicar";
          detail =
            row.activities.join(" · ") || "Activitats pendents de publicar";
        } else {
          title =
            kind === "closed"
              ? row.label || "Dia festiu"
              : kind === "weekend"
                ? "Cap de setmana"
                : "Programació pendent";
          detail =
            kind === "closed"
              ? "Escola tancada"
              : kind === "weekend"
                ? "Gaudiu del dia lliure!"
                : "Encara no hi ha menú ni activitats.";
        }
        return `<button class="week-row kind-${kind} ${open ? "" : "free"} ${key === dateKey(state.selected) ? "selected" : ""}" data-week-date="${key}" aria-label="${shortDay(date)} ${date.getDate()}, ${escape(title)}, ${escape(detail)}. Obre ${escape(format(date, { dateStyle: "full" }))}"><span class="week-date"><span>${shortDay(date)}</span> <strong>${date.getDate()}</strong></span><span class="week-summary">${kind === "special" ? `<span class="week-special">${escape(row.label)}</span>` : ""}<span class="week-row-title">${escape(title)}</span><span class="week-row-detail">${escape(detail)}</span></span>${icon("chevron-right")}</button>`;
      })
      .join("")}</div>`;
  }
  function renderMonth() {
    const y = state.selected.getFullYear(),
      m = state.selected.getMonth(),
      offset = (new Date(y, m, 1).getDay() + 6) % 7;
    let cells = '<span aria-hidden="true"></span>'.repeat(offset);
    for (let d = 1; d <= daysInMonth(y, m); d++) {
      const date = new Date(y, m, d, 12),
        key = dateKey(date),
        kind = dayKind(date, state.data);
      // Weekends stay visible for orientation but are not selectable. They keep
      // focus so the arrow keys can still cross them.
      cells += `<button class="calendar-day kind-${kind}" data-date="${key}" ${kind === "weekend" ? 'aria-disabled="true"' : ""} aria-pressed="${key === dateKey(state.selected)}" ${key === dateKey(today()) ? 'aria-current="date"' : ""} aria-label="${escape(format(date, { dateStyle: "full" }))}, ${KIND_TEXT[kind]}">${d}</button>`;
    }
    return `<div class="month-view"><div class="calendar-weekdays" aria-hidden="true"><span>dl</span><span>dt</span><span>dc</span><span>dj</span><span>dv</span><span>ds</span><span>dg</span></div><div class="calendar-grid">${cells}</div><p class="calendar-legend">${[
      ["closed", "Escola tancada"],
      ["special", "Dia especial"],
      ["school", "Amb programació"],
    ]
      .map(
        ([kind, text]) => `<span><b class="marker-${kind}"></b>${text}</span>`,
      )
      .join("")}</p></div>`;
  }
  function render() {
    renderHeader();
    renderNotice();
    renderChecklist();
    if (state.loaded)
      $("main-container").innerHTML =
        state.view === "month"
          ? renderMonth()
          : state.view === "week"
            ? renderWeek()
            : renderDay();
    else if (state.failed)
      $("main-container").innerHTML =
        `<section class="empty-day unpublished"><span class="empty-icon">${icon("cloud-off")}</span><h2>No hem pogut carregar el diari.</h2><p>Comprova la connexió i torna-ho a provar.</p><button class="text-button" data-action="refresh">Torna-ho a provar</button></section>`;
    $("main-container").setAttribute(
      "aria-busy",
      !state.loaded && !state.failed,
    );
    icons();
    if (pendingFocus) {
      $("main-container")
        .querySelector(`[data-date="${pendingFocus}"]`)
        ?.focus();
      pendingFocus = null;
    }
  }
  function archive() {
    const key = publishedKeys().at(-1);
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
  $("monthly-btn").addEventListener("click", () =>
    select(state.selected, "month"),
  );
  function move(delta) {
    if (state.view === "month") return select(addMonths(state.selected, delta));
    if (state.view === "week")
      return select(addDays(state.selected, delta * 7));
    select(nextSchoolDay(state.selected, delta));
  }
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
    const monthBtn = e.target.closest("[data-date]");
    if (monthBtn && $("main-container").contains(monthBtn)) {
      if (monthBtn.getAttribute("aria-disabled") !== "true")
        select(parseDate(monthBtn.dataset.date), "day");
      return;
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
  $("main-container").addEventListener("keydown", (e) => {
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const date = parseDate(e.target.dataset?.date);
    if (state.view !== "month" || !date || !(e.key in deltas)) return;
    e.preventDefault();
    const next = clampDate(addDays(date, deltas[e.key]));
    pendingFocus = dateKey(next);
    select(next);
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
    const dates = state.view === "week" ? weekViewDates() : [state.selected];
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
  window.addEventListener("online", () => loadData());
  window.addEventListener("offline", connectionStatus);
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    state.selected = parseDate(params.get("date")) || today();
    state.view = ["week", "month"].includes(params.get("view"))
      ? params.get("view")
      : "day";
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
