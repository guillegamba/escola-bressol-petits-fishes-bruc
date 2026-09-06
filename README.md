# 🐟 Fishes Bruc - Diari

Diari no oficial de l'**Escola Bressol Petits Fishes (Bruc)**. Per a cada dia lectiu mostra el menú i les activitats, amb un calendari per moure't entre dies. És una app web (PWA) feta per al mòbil: funciona sense connexió i es pot instal·lar a la pantalla d'inici.

> ⚠️ **No oficial.** Projecte personal, pot contenir errors. No té cap vincle amb l'escola.

## Què fa

- **Diari:** menú, activitats, celebracions i cançó del mes.
- **Setmana:** els set dies amb el menú i les activitats. Toca un dia per veure'n el detall.
- **Calendari:** tots els mesos, navegació amb teclat, botó «Avui» i accés a l'últim dia publicat. Les fletxes del diari també admeten el gest de lliscar.
- **Dates compartibles:** «Copia el dia» o «Copia la setmana» crea un enllaç a la vista seleccionada.
- **La motxilla:** llista personal editable, amb elements suggerits que es poden eliminar, caselles i desmarcat manual. Es desa només a `localStorage` d'aquest navegador. No s'envia al servidor ni se sincronitza entre dispositius.
- **Tema clar i fosc:** segueix el sistema fins que es tria manualment. Respecta el moviment reduït i permet ampliar el text.
- **Sense connexió:** després de la primera visita amb connexió, es desen la interfície i les dades. Un avís identifica la còpia desada. Les dades es comproven primer a la xarxa quan hi ha connexió.

## Nou curs i dades pendents

L'app s'obre a **la data real**, encara que el mes no tingui dades. Un dia laborable sense fila es mostra com a **programació pendent**, mai com a festiu. Els dissabtes i diumenges sense fila es mostren com a cap de setmana; una fila explícita té prioritat.

**Les dades del repositori arriben al 31 de juliol de 2026. Cal afegir la programació real de setembre al CSV.** El redisseny no inventa ni trasllada menús, activitats o festius del curs anterior. El curs de la capçalera es calcula de setembre a agost; no implica que hi hagi una programació publicada.

## Executar-ho en local

Cal servir els fitxers per HTTP:

```bash
npm ci
npm start
# O bé, sense instal·lar dependències:
python3 -m http.server 8000
```

L'aplicació no necessita compilació. Les eines de desenvolupament només serveixen per fer proves i regenerar el petit paquet d'icones. Es pot desplegar la carpeta com a lloc estàtic, també sota una subruta. Es conserva Vercel Web Analytics als desplegaments; no es carrega a localhost.

## Fitxers

| Fitxer                 | Contingut                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `index.html`           | Estructura accessible i diàleg del calendari.                                        |
| `styles.css`           | Disseny adaptable, temes i moviment reduït.                                          |
| `script.js`            | Vistes, navegació, cançons i llista personal.                                        |
| `data.js`              | CSV validat, dates i estats dels dies; compartit amb les proves i el service worker. |
| `calendar.csv`         | Menús, activitats i festius publicats.                                               |
| `sw.js`                | Memòria cau de la PWA i actualització de les dades.                                  |
| `assets/`              | Personatges, Nunito i Lucide amb les seves llicències.                               |
| `tools/icons-entry.js` | Només les icones utilitzades, per regenerar el paquet local.                         |
| `tests/`               | Proves de dades i de navegador.                                                      |

## Actualitzar el diari

Capçalera exacta: `Date,Type,Label,Activities,Menu`.

| Columna      | Contingut                                            |
| ------------ | ---------------------------------------------------- |
| `Date`       | Data vàlida en format `AAAA-MM-DD`, sense duplicats. |
| `Type`       | `school` (lectiu) o `holiday` (festiu).              |
| `Label`      | Nom del festiu o rètol especial opcional.            |
| `Activities` | Activitats separades per `\|`.                       |
| `Menu`       | Plats separats per `\|`.                             |

Exemple de les dades existents:

```csv
Date,Type,Label,Activities,Menu
2026-01-06,holiday,Dia de Reis 👑,,
2026-01-09,school,Aniversari Bruno 🎂,🎶 Cançó del projecte|📚 Literatura del projecte,Crema de carbassa|Llenties estofades amb verdures|Fruita + Crudités + Pa
```

Si un camp conté una coma o un salt de línia, posa'l entre cometes dobles. Una cometa dins d'un camp s'escriu com `""`. La importació rebutja dates incorrectes, tipus desconeguts, duplicats, fitxers buits i errors de format; mostra un error recuperable en lloc d'una pàgina buida.

1. Edita `calendar.csv` amb les dades de l'escola i executa `npm test`.
2. Afegeix les cançons a `SONGS_BY_MONTH` de `script.js`, amb claus `AAAA-MM`.
3. Si canvies HTML, CSS, JavaScript o recursos, incrementa `CACHE` a `sw.js` per actualitzar la interfície desada. Si només canvies el CSV, es comprova a la xarxa sense esperar un canvi de versió.
4. Desplega. Les persones que ja tinguin oberta una versió anterior poden haver de tornar a obrir o recarregar l'app.

## Proves

```bash
npm test
# En un terminal separat:
python3 -m http.server 8000
# En un altre terminal:
npx playwright install chromium
npm run test:browser
```

Les proves de navegador cobreixen el canvi de curs, dies pendents, arxiu, setmana, teclat i focus del diàleg, llista persistent, cançons, cinc amplades, errors de dades i recàrrega offline amb una URL compartida. Generen captures a `test-results/`, que no es versiona.

Opcions: `BASE_URL` (amb `/` final), `CHROME_PATH` (Chrome ja instal·lat) i `ARTIFACT_DIR`.

Per regenerar les icones després de canviar `tools/icons-entry.js`:

```bash
npm run build:icons
```
