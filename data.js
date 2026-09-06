/* Pure data helpers shared by the browser and node:test. Dates use local noon to
   keep day navigation stable across daylight-saving changes. */
(function (root) {
  "use strict";
  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function parseDate(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return null;
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12);
    return y >= 1900 && y <= 2100 && dateKey(date) === key ? date : null;
  }
  function addDays(date, amount) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + amount,
      12,
    );
  }
  function weekDates(date) {
    const monday = addDays(date, -((date.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }
  function parseRows(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    text = text.replace(/^\uFEFF/, "");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = !quoted;
      } else if (c === "," && !quoted) {
        row.push(field.trim());
        field = "";
      } else if ((c === "\n" || c === "\r") && !quoted) {
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        field = "";
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else field += c;
    }
    if (quoted) throw new Error("CSV: cometes sense tancar");
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
    return rows;
  }
  function parseCalendar(text) {
    const rows = parseRows(text);
    if (rows.shift()?.join(",") !== "Date,Type,Label,Activities,Menu")
      throw new Error("CSV: capçalera incorrecta");
    const data = {};
    for (const row of rows) {
      const [key, type, label, activities, menu] = row;
      if (
        row.length !== 5 ||
        !parseDate(key) ||
        !["school", "holiday"].includes(type) ||
        data[key]
      )
        throw new Error(`CSV: fila incorrecta (${key || "?"})`);
      const list = (value) =>
        value
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
      data[key] = {
        type,
        label,
        activities: list(activities),
        menu: list(menu),
      };
    }
    if (!Object.keys(data).length) throw new Error("CSV: sense dades");
    return data;
  }
  function dayStatus(date, data) {
    return (
      data[dateKey(date)]?.type ||
      ([0, 6].includes(date.getDay()) ? "weekend" : "unpublished")
    );
  }
  const api = {
    dateKey,
    parseDate,
    addDays,
    weekDates,
    parseRows,
    parseCalendar,
    dayStatus,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DiaryData = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
