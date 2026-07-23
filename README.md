# 🐟 Fishes Bruc — Diari

Diari no oficial de l'**Escola Bressol Petits Fishes (Bruc)**. Per a cada dia lectiu mostra el menú i les activitats, amb un calendari per moure't entre dies. És una app web (PWA) feta per al mòbil: funciona sense connexió i es pot instal·lar a la pantalla d'inici.

> ⚠️ **No oficial.** Projecte personal, pot contenir errors. No té cap vincle amb l'escola.

## Què fa

- **Vista del dia:** una targeta de menú i una d'activitats.
- **Calendari:** graella del mes que distingeix dies lectius, festius, avui i el dia triat.
- **Navegació:** fletxes, gest de lliscar al mòbil o botó «Avui». Salta de mes a mes i rebota suaument al primer i l'últim dia.
- **Dies especials:** aniversaris i celebracions surten amb un rètol destacat.
- **Festius i caps de setmana:** targeta de dia lliure en lloc del menú.
- **Cançons:** si una activitat parla d'una *cançó* i el mes en té una configurada, apareix un botó ▶ que hi enllaça.

## Fitxers

| Fitxer | Què és |
| --- | --- |
| `index.html` | Tota l'app: marcatge, estils i lògica en un sol fitxer. |
| `calendar.csv` | Les dades. **És el que edites per actualitzar el diari.** |
| `manifest.json` | Manifest de la PWA. |
| `sw.js` | Service worker (memòria cau per funcionar offline). |
| `favicon.png` | Icona de l'app. |
| `package.json` | Dependència i script de desenvolupament (`servor`). |
| `styles.css`, `script.js` | Restes de la plantilla inicial. **No es fan servir.** |

## Les dades (`calendar.csv`)

Capçalera: `Date,Type,Label,Activities,Menu`

| Columna | Contingut |
| --- | --- |
| `Date` | Data en format `AAAA-MM-DD`. |
| `Type` | `school` (lectiu) o `holiday` (festiu). |
| `Label` | En festius, el nom del festiu. En lectius, un rètol de dia especial (opcional). |
| `Activities` | Activitats separades per `\|`. Només en dies lectius. |
| `Menu` | Plats separats per `\|`. Només en dies lectius. |

```csv
2026-01-06,holiday,Dia de Reis 👑,,
2026-01-02,school,,🧸 Joc lliure,Sopa de verdures|Remenat d'ou|Fruita + Crudités
2026-01-09,school,Aniversari Bruno 🎂,🎶 Cançó del projecte|📚 Literatura,Crema de carbassa|Llenties estofades|Fruita + Pa
```

- Els dies sense fila (caps de setmana) surten com a «Cap de setmana».
- Els mesos disponibles es dedueixen de les dates del fitxer. Ara mateix, de gener a juny de 2026.
- Les cançons es configuren a `index.html`, a l'objecte `SONGS_BY_MONTH` (clau `"AAAA-MM"`).

## Executar-ho en local

Cal servir-ho per HTTP, perquè carrega el CSV amb `fetch()` (obrir el fitxer directament no funciona).

```bash
npm install && npm start      # servor amb recàrrega en viu
# o bé:
python3 -m http.server 8000   # http://localhost:8000
```

## Actualitzar el diari

1. Edita `calendar.csv`.
2. Si cal, afegeix la cançó del mes a `SONGS_BY_MONTH`.
3. Commit i desplega. Si canvies fitxers bàsics, apuja la versió de `CACHE` a `sw.js` (p. ex. `fishes-v1` → `fishes-v2`) perquè els clients rebin els canvis.

## Tecnologies

HTML/CSS/JS nadiu, sense compilació. Tailwind i Lucide via CDN, tipografia Nunito, service worker + manifest per a la PWA i Vercel Web Analytics. Desplegable a qualsevol allotjament estàtic (les rutes són relatives); l'ús de Vercel Analytics apunta a un desplegament a **Vercel**.
