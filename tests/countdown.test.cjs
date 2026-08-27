"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

let countdown;
try {
  countdown = require("../countdown.js");
} catch {
  countdown = null;
}

test("formats the remaining time as days, hours, minutes, and seconds", () => {
  assert.equal(typeof countdown?.formatCountdown, "function");

  const target = new Date("2026-09-01T00:00:00+07:00");
  const now = new Date("2026-08-23T17:13:42+07:00");

  assert.deepEqual(countdown.formatCountdown(target, now), {
    value: "8:06:46:18",
    label: "8 hari, 6 jam, 46 menit, 18 detik",
    complete: false,
  });
});

test("stops at zero when registration has opened", () => {
  const target = new Date("2026-09-01T00:00:00+07:00");
  const now = new Date("2026-09-01T00:01:00+07:00");

  assert.deepEqual(countdown.formatCountdown(target, now), {
    value: "0:00:00:00",
    label: "Registrasi Gelombang I telah dibuka",
    complete: true,
  });
});

test("marks a future timeline phase as upcoming", () => {
  assert.deepEqual(
    countdown.formatPhaseStatus(
      new Date("2026-09-01T00:00:00+07:00"),
      new Date("2026-09-12T23:59:59+07:00"),
      new Date("2026-08-23T12:00:00+07:00"),
    ),
    { key: "upcoming", label: "Akan datang" },
  );
});

test("marks an open timeline phase as active", () => {
  assert.deepEqual(
    countdown.formatPhaseStatus(
      new Date("2026-09-01T00:00:00+07:00"),
      new Date("2026-09-12T23:59:59+07:00"),
      new Date("2026-09-05T12:00:00+07:00"),
    ),
    { key: "active", label: "Sedang berlangsung" },
  );
});

test("marks a past timeline phase as complete", () => {
  assert.deepEqual(
    countdown.formatPhaseStatus(
      new Date("2026-09-01T00:00:00+07:00"),
      new Date("2026-09-12T23:59:59+07:00"),
      new Date("2026-09-13T00:00:00+07:00"),
    ),
    { key: "complete", label: "Sudah selesai" },
  );
});

test("formats configured timeline ranges for the visible Indonesian date", () => {
  assert.deepEqual(
    countdown.formatPhaseDateRange(
      new Date("2026-09-01T00:00:00+07:00"),
      new Date("2026-09-12T23:59:59+07:00"),
    ),
    { datetime: "2026-09-01", label: "1–12 September 2026" },
  );
  assert.deepEqual(
    countdown.formatPhaseDateRange(
      new Date("2026-10-24T00:00:00+07:00"),
      new Date("2026-10-24T23:59:59+07:00"),
    ),
    { datetime: "2026-10-24", label: "24 Oktober 2026" },
  );
});

test("loads the countdown initializer from a versioned script URL", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /src="script\.js\?v=\d+"/);
});

test("the runtime timer label keeps the Registrasi Gelombang I target", () => {
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
  const attributes = new Map();
  const display = {
    dataset: {
      countdownLabel: "Registrasi Gelombang I",
      countdownTarget: "2026-09-01T00:00:00+07:00",
    },
    textContent: "0:00:00:00",
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };
  const document = {
    querySelector(selector) {
      return selector === "[data-countdown-target]" ? display : null;
    },
    querySelectorAll() {
      return [];
    },
  };
  const window = {
    LmnasCountdown: countdown,
    clearInterval() {},
    setInterval() {
      return 1;
    },
  };

  vm.runInNewContext(script, { Date, document, window });

  assert.match(attributes.get("aria-label"), /Registrasi Gelombang I/);
  assert.match(attributes.get("aria-label"), /(?:hari|telah dibuka)/);
});

test("timeline status refreshes periodically instead of becoming stale", () => {
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

  assert.match(script, /const updatePhaseStatuses = \(\) =>/);
  assert.match(script, /window\.setInterval\(updatePhaseStatuses, 60_000\)/);
});

test("configured phase dates hydrate the visible time element", () => {
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
  const visibleDate = { dateTime: "", textContent: "" };
  const status = { className: "", textContent: "" };
  const phase = {
    dataset: { phaseKey: "registration-one" },
    querySelector(selector) {
      return selector === "time" ? visibleDate : status;
    },
  };
  const document = {
    body: { classList: { toggle() {} } },
    getElementById() {
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-phase-key]" || selector === "[data-phase-start][data-phase-end]") {
        return [phase];
      }
      return [];
    },
  };
  const window = {
    LMNAS_SITE_CONFIG: {
      phases: {
        "registration-one": {
          start: "2027-01-02T00:00:00+07:00",
          end: "2027-01-04T23:59:59+07:00",
        },
      },
    },
    LmnasCountdown: countdown,
    setInterval() {
      return 1;
    },
  };

  vm.runInNewContext(script, { Date, document, window });

  assert.equal(phase.dataset.phaseStart, "2027-01-02T00:00:00+07:00");
  assert.equal(visibleDate.dateTime, "2027-01-02");
  assert.equal(visibleDate.textContent, "2–4 Januari 2027");
});
