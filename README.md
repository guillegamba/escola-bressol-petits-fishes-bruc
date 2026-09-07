# 🦒 Giraffes Bruc - Diari

Diari no oficial de l'**Escola Bressol Petits Giraffes (Bruc)**, el grup que a la newsletter de l'escola apareix com a _Southern Giraffes_. Per a cada dia lectiu mostra el menú i les activitats, amb un calendari per moure't entre dies. És una app web (PWA) feta per al mòbil: funciona sense connexió i es pot instal·lar a la pantalla d'inici.

> ⚠️ **No oficial.** Projecte personal, pot contenir errors. No té cap vincle amb l'escola.

## Què fa

- **Diari:** menú, activitats, celebracions i cançó del mes.
- **Tres vistes en un sol selector:** Diari, Setmana i Mes. Les fletxes avancen un dia, una setmana o un mes segons la vista, i al diari també admeten el gest de lliscar.
- **Setmana:** de dilluns a divendres amb el menú i les activitats. Toca un dia per veure'n el detall.
- **Mes:** graella del mes amb navegació amb teclat. Els caps de setmana hi surten en gris i no es poden triar.
- **Dies tancats i dies especials:** un dia sense escola (festiu, lliure disposició) es marca en terracota, amb un quadrat a la llegenda i el rètol «Escola tancada»; un dia amb escola i alguna cosa especial (taller, biblioteca, casal, celebració) porta un punt ambre. La resta del detall es queda dins del dia.
- **Dates compartibles:** «Copia el dia», «Copia la setmana» o «Copia el mes» crea un enllaç a la vista seleccionada.
- **La motxilla:** mostra només els materials indicats a les dades de l'escola, amb la referència del document i la pàgina. Si no n'hi ha, queda buida. Les caselles es desen per data i material en aquest navegador; no hi ha suggeriments ni entrada manual.
- **Personatges:** formes orgàniques grans, retallades pels límits de les targetes. Cada personatge té només dos colors suaus i una cara, sense extremitats ni accessoris. El menú té una expressió satisfeta; les activitats trien una expressió esportiva, relaxada o curiosa. Fan un moviment breu en aparèixer i en passar-hi per sobre, i respecten la preferència de moviment reduït.
- **Tema clar i fosc:** segueix el sistema fins que es tria manualment. Respecta el moviment reduït i permet ampliar el text.
- **Sense connexió:** després de la primera visita amb connexió, es desen la interfície i les dades. Un avís identifica la còpia desada. Les dades es comproven primer a la xarxa quan hi ha connexió.

## Nou curs i dades pendents

L'app s'obre a **la data real**, encara que el mes no tingui dades. Un dia laborable sense fila es mostra com a **programació pendent**, mai com a festiu. Els dissabtes i diumenges sense fila es mostren com a cap de setmana; una fila explícita té prioritat i els torna a fer visibles i triables. Les fletxes del diari salten el cap de setmana: després de divendres ve dilluns.

**El setembre del 2026 està publicat sencer.** A partir d'octubre el CSV només conté el calendari del curs (festius, dies de lliure disposició, casals, piscina i tallers): els dies hi surten amb el seu rètol, però amb el menú i les activitats pendents. Un mes es considera publicat només quan algun dia té menú o activitats, de manera que l'avís «Encara no tenim la programació de…» i el botó «Últim dia publicat» ignoren les files de calendari.

### Curs 2026-2027

| Font                | Què aporta                                                                            |
| ------------------- | ------------------------------------------------------------------------------------- |
| `HORARI_I2_ok_.pdf` | Horari setmanal dels Giraffes: la rutina que omple les activitats de cada dia lectiu. |
| `menu_sept.pdf`     | Menú de l'1 al 30 de setembre del 2026.                                               |
| Newsletter Setembre | Projecte d'Adaptació, tancaments i celebracions del mes.                              |
| Calendari escolar   | Festius, dies de lliure disposició, casals, piscina, tallers i biblioteca.            |

El calendari del curs hi és sencer, del 7 de setembre del 2026 al 30 de juliol del 2027:

| Bloc              | Dates                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| Curs              | Del 7 de setembre del 2026 al 30 de juliol del 2027.                                  |
| Piscina           | Cada dilluns, del 5 d'octubre del 2026 al 14 de juny del 2027.                        |
| Lliure disposició | 25/09, 30/10, 20/11, 07/12, 24/12, 05/01, 08/02, 30/04, 18/05 i 25/06.                |
| Casals            | Setembre 1-4; Nadal 21-23 i 28-31/12 i 04/01; Setmana Santa 22-25/03; agost del 2027. |
| Tallers           | 23/10, 18/12, 23/04 i 23/07, sempre en divendres.                                     |
| Biblioteca        | Un dimecres cada mes, d'octubre a juliol.                                             |

Rutina setmanal dels Giraffes (`HORARI_I2_ok_.pdf`):

| Dia       | Matí                   | Tarda               |
| --------- | ---------------------- | ------------------- |
| Dilluns   | Piscina                | Joc heurístic       |
| Dimarts   | Activitat del projecte | Joc simbòlic        |
| Dimecres  | Psicomotricitat        | Panera del projecte |
| Dijous    | Música                 | Joc simbòlic        |
| Divendres | Activitat del projecte | Conta contes        |

La piscina no consta als dilluns de setembre: el calendari escolar marca l'inici de la piscina a l'octubre, i el setembre és el mes d'adaptació. Tampoc no es dedueixen materials de la piscina; `Supplies` queda buit mentre l'escola no els indiqui per escrit.

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

| Fitxer                            | Contingut                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `index.html`                      | Estructura accessible i diàleg del calendari.                                        |
| `styles.css`                      | Disseny adaptable, temes i moviment reduït.                                          |
| `script.js`                       | Vistes (dia, setmana, mes), navegació, cançons i llista personal.                    |
| `data.js`                         | CSV validat, dates i estats dels dies; compartit amb les proves i el service worker. |
| `calendar.csv`                    | Menús, activitats i festius publicats.                                               |
| `sw.js`                           | Memòria cau de la PWA i actualització de les dades.                                  |
| `characters.js`, `characters.css` | Personatges vectorials i animació.                                                   |
| `assets/`                         | Nunito i Lucide amb les seves llicències.                                            |
| `tools/icons-entry.js`            | Només les icones utilitzades, per regenerar el paquet local.                         |
| `tests/`                          | Proves de dades i de navegador.                                                      |

## Actualitzar el diari

Capçalera: `Date,Type,Label,Activities,Menu,Supplies,SupplySource`. Els CSV antics amb les cinc primeres columnes continuen sent compatibles.

| Columna        | Contingut                                                                            |
| -------------- | ------------------------------------------------------------------------------------ |
| `Date`         | Data vàlida en format `AAAA-MM-DD`, sense duplicats.                                 |
| `Type`         | `school` (lectiu) o `holiday` (festiu).                                              |
| `Label`        | Nom del festiu o rètol especial opcional.                                            |
| `Activities`   | Activitats separades per `\|`.                                                       |
| `Menu`         | Plats separats per `\|`.                                                             |
| `Supplies`     | Materials a portar, separats per `\|`. Buit si no s'han indicat explícitament.       |
| `SupplySource` | Nom del PDF i pàgina d'on s'han extret els materials. Obligatori si hi ha materials. |

Exemple de les dades existents:

```csv
Date,Type,Label,Activities,Menu
2026-01-06,holiday,Dia de Reis 👑,,
2026-01-09,school,Aniversari Bruno 🎂,🎶 Cançó del projecte|📚 Literatura del projecte,Crema de carbassa|Llenties estofades amb verdures|Fruita + Crudités + Pa
```

Si un camp conté una coma o un salt de línia, posa'l entre cometes dobles. Una cometa dins d'un camp s'escriu com `""`. La importació rebutja materials sense font, dates incorrectes, tipus desconeguts, duplicats, fitxers buits i errors de format; mostra un error recuperable en lloc d'una pàgina buida.

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

Les proves de navegador cobreixen el canvi de curs, dies pendents, arxiu, la setmana de dilluns a divendres, la vista de mes amb teclat i caps de setmana inactius, el salt del cap de setmana amb les fletxes, materials amb font i selecció persistent per data, cançons, cinc amplades, errors de dades i recàrrega offline amb una URL compartida. Generen captures a `test-results/`, que no es versiona.

Opcions: `BASE_URL` (amb `/` final), `CHROME_PATH` (Chrome ja instal·lat) i `ARTIFACT_DIR`.

Per regenerar les icones després de canviar `tools/icons-entry.js`:

```bash
npm run build:icons
```

## Extreure materials dels PDF

Quan la família faciliti els PDF d'activitats i menús, copia a `Supplies` només allò que el document demana portar i assigna-ho a la data indicada. Registra el nom del document i la pàgina a `SupplySource`. No dedueixis materials d'una activitat: «piscina» no implica automàticament que calgui portar una tovallola. Si la data o el requisit són ambigus, deixa el camp buit fins a aclarir-los.

Les columnes noves estan preparades però buides a totes les files existents. La vista setmanal agrupa els requisits per dia. Aquesta versió no incorpora un lector automàtic de PDF: les dades verificades s'incorporen al CSV durant l'actualització del diari.
