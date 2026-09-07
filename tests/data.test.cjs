const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  parseCalendar,
  parseDate,
  dateKey,
  addDays,
  weekDates,
  schoolDates,
  dayStatus,
  dayKind,
  isWeekend,
} = require("../data.js");
const header = "Date,Type,Label,Activities,Menu\n";
test("parses the complete published calendar without changing meals", () => {
  const data = parseCalendar(
    fs.readFileSync(
      require("node:path").join(__dirname, "../calendar.csv"),
      "utf8",
    ),
  );
  assert.ok(Object.keys(data).length > 100);
  assert.equal(
    data["2026-07-28"].menu[1],
    "Llentíes amb pebrot verd, porro i carbassó",
  );
  assert.equal(data["2026-01-01"].type, "holiday");
});
test("CSV handles BOM, CRLF, commas, escaped quotes and multiline fields", () => {
  const data = parseCalendar(
    "\uFEFF" +
      header +
      '2026-09-07,school,"Un ""bon"" dia","Joc\nlliure|Música","Arròs, pèsols|Fruita"\r\n',
  );
  assert.equal(data["2026-09-07"].label, 'Un "bon" dia');
  assert.deepEqual(data["2026-09-07"].activities, ["Joc\nlliure", "Música"]);
  assert.equal(data["2026-09-07"].menu[0], "Arròs, pèsols");
});
test("invalid, duplicate or empty data cannot silently replace the schedule", () => {
  for (const csv of [
    header,
    "<html>404</html>",
    header + "2026-02-30,school,,,",
    header + "2026-09-07,closed,,,",
    header + "2026-09-07,school,,,\n2026-09-07,school,,,",
    header + '2026-09-07,school,"unclosed,,',
  ])
    assert.throws(() => parseCalendar(csv));
});
test("unpublished weekdays are not holidays, and explicit weekend rows win", () => {
  assert.equal(dayStatus(parseDate("2026-09-07"), {}), "unpublished");
  assert.equal(dayStatus(parseDate("2026-09-06"), {}), "weekend");
  assert.equal(
    dayStatus(parseDate("2026-09-06"), { "2026-09-06": { type: "school" } }),
    "school",
  );
});
test("date navigation crosses months, years, leap days and DST", () => {
  assert.equal(dateKey(addDays(parseDate("2026-12-31"), 1)), "2027-01-01");
  assert.equal(dateKey(addDays(parseDate("2024-02-28"), 1)), "2024-02-29");
  assert.equal(dateKey(addDays(parseDate("2026-03-29"), 1)), "2026-03-30");
  assert.equal(dateKey(addDays(parseDate("2026-10-25"), 1)), "2026-10-26");
  assert.equal(parseDate("2026-02-29"), null);
  assert.equal(parseDate("garbage"), null);
  assert.equal(parseDate("0099-01-01"), null);
  assert.deepEqual(weekDates(parseDate("2026-01-01")).map(dateKey), [
    "2025-12-29",
    "2025-12-30",
    "2025-12-31",
    "2026-01-01",
    "2026-01-02",
    "2026-01-03",
    "2026-01-04",
  ]);
});

test("supplies require a source and old calendars stay compatible", () => {
  const newHeader = "Date,Type,Label,Activities,Menu,Supplies,SupplySource\n";
  const data = parseCalendar(
    newHeader +
      "2026-09-07,school,,Pintura,Arròs,Davantal|Davantal|Tovallola,fixture.pdf p.2",
  );
  assert.deepEqual(data["2026-09-07"].supplies, ["Davantal", "Tovallola"]);
  assert.equal(data["2026-09-07"].supplySource, "fixture.pdf p.2");
  assert.throws(() =>
    parseCalendar(newHeader + "2026-09-07,school,,,Davantal,"),
  );
  assert.deepEqual(
    parseCalendar(header + "2026-09-07,school,,,")["2026-09-07"].supplies,
    [],
  );
});

test("characters reflect activity keywords, including Catalan accents", () => {
  const { forActivities, character } = require("../characters.js");
  assert.equal(forActivities(["Psicomotricitat gruixuda", "Ioga"]), "sporty");
  assert.equal(forActivities(["Pintura amb colors"]), "artist");
  assert.equal(forActivities(["Natació a la piscina"]), "swimmer");
  assert.equal(forActivities(["Jocs d’aigua"]), "swimmer");
  assert.equal(
    forActivities(["Psicomotricitat fina", "Pintem amb gel"]),
    "artist",
  );
  assert.ok(character("sporty").includes("mascot-ball"));
});

test("day kinds separate closures from special days", () => {
  const data = parseCalendar(
    "Date,Type,Label,Activities,Menu,Supplies,SupplySource\n" +
      "2026-09-07,school,,Joc,Arròs,,\n" +
      "2026-09-08,school,Taller 🎨,,,,\n" +
      "2026-09-11,holiday,Lliure Disposició,,,,\n" +
      "2026-09-05,school,Portes obertes,,,,\n",
  );
  assert.equal(dayKind(parseDate("2026-09-07"), data), "school");
  assert.equal(dayKind(parseDate("2026-09-08"), data), "special");
  assert.equal(dayKind(parseDate("2026-09-11"), data), "closed");
  assert.equal(dayKind(parseDate("2026-09-09"), data), "unpublished");
  assert.equal(dayKind(parseDate("2026-09-12"), data), "weekend");
  // An explicit row outranks the weekend default.
  assert.equal(dayKind(parseDate("2026-09-05"), data), "special");
});

test("a school week is Monday to Friday unless a weekend row exists", () => {
  const data = parseCalendar(
    "Date,Type,Label,Activities,Menu,Supplies,SupplySource\n" +
      "2026-09-05,school,Portes obertes,,,,\n",
  );
  assert.deepEqual(schoolDates(parseDate("2026-09-09")).map(dateKey), [
    "2026-09-07",
    "2026-09-08",
    "2026-09-09",
    "2026-09-10",
    "2026-09-11",
  ]);
  assert.equal(schoolDates(parseDate("2026-09-02"), data).length, 6);
  assert.deepEqual(
    schoolDates(parseDate("2026-09-02"), data).map(dateKey).at(-1),
    "2026-09-05",
  );
  assert.equal(isWeekend(parseDate("2026-09-05")), true);
  assert.equal(isWeekend(parseDate("2026-09-07")), false);
});
