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

const registrationTestConfig = {
  phases: {
    "registration-one": {
      start: "2099-01-02T00:00:00+07:00",
      end: "2099-01-04T23:59:59+07:00",
    },
    "registration-two": {
      start: "2099-01-05T00:00:00+07:00",
      end: "2099-01-07T23:59:59+07:00",
    },
  },
};

test("formats the remaining time as days, hours, minutes, and seconds", () => {
  assert.equal(typeof countdown?.formatCountdown, "function");

  const target = new Date("2026-09-01T12:00:00+07:00");
  const now = new Date("2026-08-23T17:13:42+07:00");

  assert.deepEqual(countdown.formatCountdown(target, now), {
    value: "8:18:46:18",
    label: "8 hari, 18 jam, 46 menit, 18 detik",
    complete: false,
  });
});

test("keeps registration closed until exactly noon WIB", () => {
  const target = new Date("2026-09-01T12:00:00+07:00");

  assert.equal(
    countdown.formatCountdown(target, new Date("2026-09-01T11:59:59+07:00")).complete,
    false,
  );
  assert.equal(
    countdown.formatCountdown(target, new Date("2026-09-01T12:00:00+07:00")).complete,
    true,
  );
});

test("formats a zero countdown without embedding a registration phase label", () => {
  const target = new Date("2026-09-01T12:00:00+07:00");
  const now = new Date("2026-09-01T12:01:00+07:00");

  assert.deepEqual(countdown.formatCountdown(target, now), {
    value: "0:00:00:00",
    label: "0 hari, 0 jam, 0 menit, 0 detik",
    complete: true,
  });
});

test("resolves every registration phase and its countdown presentation", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "site-config.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const config = context.window.LMNAS_SITE_CONFIG;
  const cases = [
    [
      "2026-09-01T11:59:59+07:00",
      {
        key: "BEFORE_WAVE_1",
        kicker: "Menuju",
        title: "Registrasi Gelombang I",
        countdownTarget: "2026-09-01T12:00:00+07:00",
        countdownLabel: "Registrasi Gelombang I",
        showCountdown: true,
      },
    ],
    [
      "2026-09-05T12:00:00+07:00",
      {
        key: "WAVE_1_OPEN",
        kicker: "Registrasi Gelombang I",
        title: "Berakhir dalam",
        countdownTarget: "2026-09-12T23:59:59+07:00",
        countdownLabel: "Registrasi Gelombang I — berakhir dalam",
        showCountdown: true,
      },
    ],
    [
      "2026-09-12T23:59:59+07:00",
      {
        key: "WAVE_1_OPEN",
        kicker: "Registrasi Gelombang I",
        title: "Berakhir dalam",
        countdownTarget: "2026-09-12T23:59:59+07:00",
        countdownLabel: "Registrasi Gelombang I — berakhir dalam",
        showCountdown: true,
      },
    ],
    [
      "2026-09-12T23:59:59.001+07:00",
      {
        key: "BEFORE_WAVE_2",
        kicker: "Menuju",
        title: "Registrasi Gelombang II",
        countdownTarget: "2026-09-13T00:00:00+07:00",
        countdownLabel: "Registrasi Gelombang II",
        showCountdown: true,
      },
    ],
    [
      "2026-09-13T00:00:00+07:00",
      {
        key: "WAVE_2_OPEN",
        kicker: "Registrasi Gelombang II",
        title: "Berakhir dalam",
        countdownTarget: "2026-09-26T23:59:59+07:00",
        countdownLabel: "Registrasi Gelombang II — berakhir dalam",
        showCountdown: true,
      },
    ],
    [
      "2026-09-20T12:00:00+07:00",
      {
        key: "WAVE_2_OPEN",
        kicker: "Registrasi Gelombang II",
        title: "Berakhir dalam",
        countdownTarget: "2026-09-26T23:59:59+07:00",
        countdownLabel: "Registrasi Gelombang II — berakhir dalam",
        showCountdown: true,
      },
    ],
    [
      "2026-09-26T23:59:59+07:00",
      {
        key: "WAVE_2_OPEN",
        kicker: "Registrasi Gelombang II",
        title: "Berakhir dalam",
        countdownTarget: "2026-09-26T23:59:59+07:00",
        countdownLabel: "Registrasi Gelombang II — berakhir dalam",
        showCountdown: true,
      },
    ],
    [
      "2026-09-27T00:00:00+07:00",
      {
        key: "REGISTRATION_CLOSED",
        kicker: "Registrasi",
        title: "LMNas 37 telah ditutup",
        countdownTarget: null,
        countdownLabel: "Registrasi LMNas 37 telah ditutup",
        showCountdown: false,
      },
    ],
  ];

  for (const [timestamp, expected] of cases) {
    assert.deepEqual(
      countdown.resolveRegistrationPhase(new Date(timestamp), config),
      expected,
      timestamp,
    );
  }
});

test("resolves registration boundaries by the explicit WIB offset", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "site-config.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);

  assert.equal(
    countdown.resolveRegistrationPhase(
      new Date("2026-09-01T05:00:00.000Z"),
      context.window.LMNAS_SITE_CONFIG,
    ).key,
    "WAVE_1_OPEN",
  );
});

test("renders the resolved registration state into the homepage countdown", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "site-config.js"), "utf8");
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const config = context.window.LMNAS_SITE_CONFIG;
  const cases = [
    ["2026-09-01T11:59:59+07:00", "Menuju", "Registrasi Gelombang I", "2026-09-01T12:00:00+07:00", true],
    ["2026-09-05T12:00:00+07:00", "Registrasi Gelombang I", "Berakhir dalam", "2026-09-12T23:59:59+07:00", true],
    ["2026-09-12T23:59:59.001+07:00", "Menuju", "Registrasi Gelombang II", "2026-09-13T00:00:00+07:00", true],
    ["2026-09-13T00:00:00+07:00", "Registrasi Gelombang II", "Berakhir dalam", "2026-09-26T23:59:59+07:00", true],
    ["2026-09-27T00:00:00+07:00", "Registrasi", "LMNas 37 telah ditutup", null, false],
  ];

  for (const [timestamp, expectedKicker, expectedTitle, expectedTarget, visible] of cases) {
    const parts = Object.fromEntries(["days", "hours", "minutes", "seconds"].map((part) => [part, { textContent: "" }]));
    const attributes = new Map();
    const kicker = { textContent: "Menuju" };
    const title = { textContent: "Registrasi Gelombang I" };
    const display = {
      dataset: {
        countdownLabel: "Registrasi Gelombang I",
        countdownTarget: "2026-09-01T12:00:00+07:00",
      },
      style: { visibility: "" },
      querySelector(selector) {
        const part = selector.match(/data-countdown-part="([^"]+)"/)?.[1];
        return parts[part] || null;
      },
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
    };
    const document = {
      querySelector(selector) {
        if (selector === "[data-countdown-target]") return display;
        if (selector === ".countdown-copy .section-kicker") return kicker;
        return null;
      },
      querySelectorAll() {
        return [];
      },
      getElementById(id) {
        return id === "countdown-title" ? title : null;
      },
    };
    const FixedDate = class extends Date {
      constructor(...args) {
        super(args.length ? args[0] : timestamp);
      }
    };
    const window = {
      LMNAS_SITE_CONFIG: config,
      LmnasCountdown: countdown,
      clearInterval() {},
      setInterval() {
        return 1;
      },
    };

    vm.runInNewContext(script, { Date: FixedDate, document, window });

    assert.equal(kicker.textContent, expectedKicker, timestamp);
    assert.equal(title.textContent, expectedTitle, timestamp);
    assert.equal(display.dataset.countdownTarget ?? null, expectedTarget, timestamp);
    assert.equal(display.style.visibility === "hidden", !visible, timestamp);
    assert.equal(attributes.get("aria-hidden") ?? null, visible ? null : "true", timestamp);
  }
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
    LMNAS_SITE_CONFIG: registrationTestConfig,
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

test("the runtime timer updates each visible countdown number", () => {
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
  const parts = Object.fromEntries(["days", "hours", "minutes", "seconds"].map((part) => [part, { textContent: "" }]));
  const attributes = new Map();
  const display = {
    dataset: {
      countdownLabel: "Registrasi Gelombang I",
      countdownTarget: "2099-09-01T00:00:00+07:00",
    },
    querySelector(selector) {
      const part = selector.match(/data-countdown-part="([^"]+)"/)?.[1];
      return parts[part] || null;
    },
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
    getElementById() {
      return null;
    },
  };
  const window = {
    LMNAS_SITE_CONFIG: registrationTestConfig,
    LmnasCountdown: countdown,
    clearInterval() {},
    setInterval() {
      return 1;
    },
  };

  vm.runInNewContext(script, { Date, document, window });

  assert.match(parts.days.textContent, /^\d+$/);
  for (const part of ["hours", "minutes", "seconds"]) {
    assert.match(parts[part].textContent, /^\d{2}$/);
  }
  assert.match(attributes.get("aria-label"), /hari|jam|menit|detik/);
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
