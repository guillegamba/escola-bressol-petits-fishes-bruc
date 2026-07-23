# 🐟 Escola Bressol Petits Fishes (Bruc) — Diari

An unofficial, mobile-first daily diary for the **Escola Bressol Petits Fishes (Bruc)** nursery school. It shows, for each school day, the day's **menu** and **activities**, plus a monthly calendar to jump between days. The whole thing is a single-page Progressive Web App (PWA) that works offline and can be installed to a phone's home screen.

The interface is entirely in **Catalan**, matching the school's language.

> ⚠️ **No oficial** — this is a personal project and may contain errors. It is not affiliated with or endorsed by the school.

---

## ✨ Features

- **📅 Daily view** — for each day, a menu card and an activities card, with playful pastel illustrations.
- **🗓️ Monthly calendar** — tap the calendar icon (or the date) to open a month grid. School days, holidays, today, and the selected day are all styled distinctly.
- **⬅️➡️ Navigation** — move day by day with the arrow buttons, **swipe** left/right on touch devices, or jump straight to **"Avui"** (today). Navigation rolls over between months and gives a subtle rubber-band bounce at the first/last available day.
- **🎉 Special days** — birthdays, themed days and celebrations get a highlighted banner (e.g. *Aniversari*, *Dia de la Pau*, *Carnestoltes*).
- **🏖️ Holidays & weekends** — non-school days show a friendly "day off" / "weekend" card instead of a menu.
- **🎵 Song links** — activities that mention a *cançó* (song) can show a ▶ play button linking to the month's project/body song (YouTube, Spotify, etc.).
- **📲 Installable PWA** — add to home screen, launches standalone in portrait, and works **offline** via a service worker.
- **📊 Analytics** — Vercel Web Analytics is wired in for basic usage insight.

---

## 🗂️ Project structure

| File | Purpose |
| --- | --- |
| `index.html` | The entire app — markup, styles, and all JavaScript logic live here (self-contained). |
| `calendar.csv` | The data source: one row per day with type, label, activities, and menu. **This is what you edit to update the diary.** |
| `manifest.json` | PWA manifest (name, icons, theme colors, standalone display). |
| `sw.js` | Service worker — stale-while-revalidate caching for offline support. |
| `favicon.png` | App icon / favicon / Apple touch icon. |
| `package.json` | Dev dependency (`servor`) and the `start` script for local serving. |
| `styles.css`, `script.js` | Leftover starter-template files. **Not used** by `index.html` — safe to ignore. |

---

## 📄 The data format (`calendar.csv`)

All content is driven by `calendar.csv`. The header row is:

```csv
Date,Type,Label,Activities,Menu
```

| Column | Meaning |
| --- | --- |
| `Date` | Day in `YYYY-MM-DD` format. |
| `Type` | Either `school` or `holiday`. |
| `Label` | For `holiday`: the holiday name (e.g. `Dia de Reis 👑`). For `school`: an optional **special-day** banner (e.g. `Aniversari Bruno 🎂`); leave empty for a normal day. |
| `Activities` | For `school` days: a list of activities separated by `\|` (pipe). Ignored for holidays. |
| `Menu` | For `school` days: the menu courses separated by `\|` (pipe). Ignored for holidays. |

Examples:

```csv
2026-01-06,holiday,Dia de Reis 👑,,
2026-01-02,school,,🧸 Joc lliure (No hi ha activitats programades),Sopa de verdures|Remenat d'ou|Fruita + Crudités
2026-01-09,school,Aniversari Bruno 🎂,🎶 Cançó del projecte|📚 Literatura del projecte,Crema de carbassa|Llenties estofades amb verdures|Fruita + Crudités + Pa
```

Notes:
- **Weekends** are simply omitted — any date without a row renders as a "Cap de setmana" (weekend) card.
- Fields containing commas can be wrapped in double quotes (standard CSV quoting is supported by the parser).
- The app derives available months automatically from the dates present in the file. The current data covers **January–June 2026**.

### Song links per month

Songs are configured separately, inline in `index.html`, in the `SONGS_BY_MONTH` object keyed by `"YYYY-MM"`:

```js
const SONGS_BY_MONTH = {
    "2026-05": "https://www.youtube.com/watch?v=RuqvGiZi0qg",
};
```

When a month has a URL, any activity text containing *"cançó"* gets a ▶ play button linking to it.

---

## 🚀 Running locally

The app is fully static — any static file server works. Because it loads `calendar.csv` via `fetch()`, you must serve it over HTTP (opening `index.html` directly from the filesystem won't work).

**Option A — use the bundled script:**

```bash
npm install
npm start        # runs `servor --reload` with live reload
```

**Option B — any static server:**

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 🛠️ Tech stack

- **Vanilla HTML / CSS / JavaScript** — no build step, no framework.
- **[Tailwind CSS](https://tailwindcss.com/)** via CDN, with a small custom theme (cream background, pastel palette, blob radii).
- **[Lucide Icons](https://lucide.dev/)** for the UI icons.
- **[Nunito](https://fonts.google.com/specimen/Nunito)** via Google Fonts.
- **Service Worker + Web App Manifest** for PWA / offline behaviour.
- **[servor](https://www.npmjs.com/package/servor)** for local development.
- **Vercel Web Analytics.**

---

## ✏️ Updating the diary

1. Edit `calendar.csv` — add or change rows for the relevant dates.
2. (Optional) Add a song for a month in `SONGS_BY_MONTH` inside `index.html`.
3. Commit and deploy. On next load the service worker refreshes the cached data.

> If you change cached core assets, bump the `CACHE` version in `sw.js` (e.g. `fishes-v1` → `fishes-v2`) so clients pick up the update.

---

## 🌍 Deployment

Any static host works (GitHub Pages, Netlify, etc.). The service worker and manifest use relative paths (`./`), so the app can be served from a subpath. The presence of the Vercel Analytics snippet and `/_vercel/insights/script.js` suggests deployment on **Vercel**.
