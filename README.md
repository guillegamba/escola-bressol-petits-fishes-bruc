# 🐟 Escola Bressol Petits Fishes (Bruc) — Diari

Un diari diari, no oficial i pensat per al mòbil, de l'**Escola Bressol Petits Fishes (Bruc)**. Mostra, per a cada dia lectiu, el **menú** i les **activitats** del dia, amb un calendari mensual per saltar entre dies. Tot plegat és una aplicació web d'una sola pàgina (PWA) que funciona sense connexió i es pot instal·lar a la pantalla d'inici del telèfon.

La interfície és íntegrament en **català**, com la de l'escola.

> ⚠️ **No oficial** — és un projecte personal i pot contenir errors. No està afiliat ni avalat per l'escola.

---

## ✨ Funcionalitats

- **📅 Vista diària** — per a cada dia, una targeta de menú i una d'activitats, amb il·lustracions de tons pastel.
- **🗓️ Calendari mensual** — toca la icona del calendari (o la data) per obrir la graella del mes. Els dies lectius, els festius, el dia d'avui i el dia seleccionat es distingeixen amb estils diferents.
- **⬅️➡️ Navegació** — mou-te dia a dia amb les fletxes, **llisca** cap a l'esquerra/dreta a les pantalles tàctils, o vés directament a **«Avui»**. La navegació salta entre mesos i fa un petit rebot elàstic quan arribes al primer o l'últim dia disponible.
- **🎉 Dies especials** — aniversaris, dies temàtics i celebracions es mostren amb un rètol destacat (p. ex. *Aniversari*, *Dia de la Pau*, *Carnestoltes*).
- **🏖️ Festius i caps de setmana** — els dies no lectius mostren una targeta de «dia lliure» / «cap de setmana» en lloc del menú.
- **🎵 Enllaços de cançons** — les activitats que esmenten una *cançó* poden mostrar un botó ▶ que enllaça amb la cançó del projecte/del cos del mes (YouTube, Spotify, etc.).
- **📲 PWA instal·lable** — s'afegeix a la pantalla d'inici, s'obre en mode estàndard i vertical, i funciona **sense connexió** gràcies a un service worker.
- **📊 Analítica** — hi ha integrat Vercel Web Analytics per tenir una idea bàsica de l'ús.

---

## 🗂️ Estructura del projecte

| Fitxer | Funció |
| --- | --- |
| `index.html` | Tota l'aplicació — marcatge, estils i tota la lògica de JavaScript hi són a dins (autònom). |
| `calendar.csv` | La font de dades: una fila per dia amb el tipus, l'etiqueta, les activitats i el menú. **És el que edites per actualitzar el diari.** |
| `manifest.json` | Manifest de la PWA (nom, icones, colors del tema, visualització estàndard). |
| `sw.js` | Service worker — memòria cau *stale-while-revalidate* per funcionar sense connexió. |
| `favicon.png` | Icona de l'app / favicon / icona per a Apple. |
| `package.json` | Dependència de desenvolupament (`servor`) i l'script `start` per servir l'app en local. |
| `styles.css`, `script.js` | Fitxers sobrants de la plantilla inicial. **No s'utilitzen** a `index.html` — es poden ignorar. |

---

## 📄 El format de dades (`calendar.csv`)

Tot el contingut prové de `calendar.csv`. La fila de capçalera és:

```csv
Date,Type,Label,Activities,Menu
```

| Columna | Significat |
| --- | --- |
| `Date` | Dia en format `AAAA-MM-DD`. |
| `Type` | `school` (lectiu) o `holiday` (festiu). |
| `Label` | Per a `holiday`: el nom del festiu (p. ex. `Dia de Reis 👑`). Per a `school`: un rètol opcional de **dia especial** (p. ex. `Aniversari Bruno 🎂`); deixa'l buit per a un dia normal. |
| `Activities` | Per als dies `school`: una llista d'activitats separades per `\|` (barra vertical). S'ignora en els festius. |
| `Menu` | Per als dies `school`: els plats del menú separats per `\|` (barra vertical). S'ignora en els festius. |

Exemples:

```csv
2026-01-06,holiday,Dia de Reis 👑,,
2026-01-02,school,,🧸 Joc lliure (No hi ha activitats programades),Sopa de verdures|Remenat d'ou|Fruita + Crudités
2026-01-09,school,Aniversari Bruno 🎂,🎶 Cançó del projecte|📚 Literatura del projecte,Crema de carbassa|Llenties estofades amb verdures|Fruita + Crudités + Pa
```

Notes:
- Els **caps de setmana** simplement s'ometen — qualsevol data sense fila es mostra com una targeta de «Cap de setmana».
- Els camps que contenen comes es poden envoltar amb cometes dobles (l'analitzador admet el format CSV estàndard amb cometes).
- L'app dedueix automàticament els mesos disponibles a partir de les dates presents al fitxer. Les dades actuals cobreixen de **gener a juny de 2026**.

### Cançons per mes

Les cançons es configuren a part, dins de `index.html`, a l'objecte `SONGS_BY_MONTH` amb la clau `"AAAA-MM"`:

```js
const SONGS_BY_MONTH = {
    "2026-05": "https://www.youtube.com/watch?v=RuqvGiZi0qg",
};
```

Quan un mes té un URL, qualsevol activitat que contingui el text *«cançó»* mostra un botó ▶ que hi enllaça.

---

## 🚀 Executar en local

L'app és totalment estàtica — funciona amb qualsevol servidor de fitxers estàtics. Com que carrega `calendar.csv` amb `fetch()`, cal servir-la per HTTP (obrir `index.html` directament des del sistema de fitxers no funcionarà).

**Opció A — fes servir l'script inclòs:**

```bash
npm install
npm start        # executa `servor --reload` amb recàrrega en viu
```

**Opció B — qualsevol servidor estàtic:**

```bash
python3 -m http.server 8000
# després obre http://localhost:8000
```

---

## 🛠️ Tecnologies

- **HTML / CSS / JavaScript nadiu** — sense pas de compilació ni cap framework.
- **[Tailwind CSS](https://tailwindcss.com/)** via CDN, amb un tema personalitzat (fons crema, paleta pastel, radis tipus *blob*).
- **[Lucide Icons](https://lucide.dev/)** per a les icones de la interfície.
- **[Nunito](https://fonts.google.com/specimen/Nunito)** via Google Fonts.
- **Service Worker + Web App Manifest** per al comportament PWA / sense connexió.
- **[servor](https://www.npmjs.com/package/servor)** per al desenvolupament local.
- **Vercel Web Analytics.**

---

## ✏️ Actualitzar el diari

1. Edita `calendar.csv` — afegeix o modifica les files dels dies corresponents.
2. (Opcional) Afegeix una cançó per a un mes a `SONGS_BY_MONTH` dins de `index.html`.
3. Fes *commit* i desplega. A la propera càrrega, el service worker refresca les dades en memòria cau.

> Si canvies els recursos bàsics de la memòria cau, incrementa la versió de `CACHE` a `sw.js` (p. ex. `fishes-v1` → `fishes-v2`) perquè els clients rebin l'actualització.

---

## 🌍 Desplegament

Funciona en qualsevol allotjament estàtic (GitHub Pages, Netlify, etc.). El service worker i el manifest fan servir rutes relatives (`./`), de manera que l'app es pot servir des d'un subdirectori. La presència del fragment de Vercel Analytics i de `/_vercel/insights/script.js` suggereix un desplegament a **Vercel**.
