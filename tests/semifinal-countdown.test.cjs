"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const configContext = { window: {} };
vm.runInNewContext(read("site-config.js"), configContext);
const config = configContext.window.LMNAS_SITE_CONFIG;
const countdown = require("../countdown.js");
const cases = [
  ["2026-10-24T23:59:59.001+07:00", "BEFORE_SEMIFINAL", "Menuju", true],
  ["2026-10-29T12:00:00+07:00", "BEFORE_SEMIFINAL", "Menuju", true],
  ["2026-11-13T23:59:59.999+07:00", "BEFORE_SEMIFINAL", "Menuju", true],
  ["2026-11-14T00:00:00+07:00", "FINALS_ACTIVE", "Sedang berlangsung", false],
  ["2026-11-14T00:00:00.001+07:00", "FINALS_ACTIVE", "Sedang berlangsung", false],
  ["2026-11-15T23:59:59+07:00", "FINALS_ACTIVE", "Sedang berlangsung", false],
  ["2026-11-15T23:59:59.001+07:00", "FINALS_COMPLETE", "Sudah selesai", false],
];
for (const [timestamp, key, kicker, visible] of cases) {
  test(`semifinal boundary ${timestamp}`, () => {
    const phase = countdown.resolveRegistrationPhase(new Date(timestamp), config);
    assert.equal(phase.key, key);
    assert.equal(phase.title, visible ? "Babak Semifinal" : "Babak Semifinal, Final, dan Grandfinal");
    assert.equal(phase.kicker, kicker);
    assert.equal(phase.showCountdown, visible);
    assert.equal(phase.countdownTarget, visible ? config.phases.finals.start : null);
    assert.deepEqual(countdown.resolveRegistrationPhase(new Date(new Date(timestamp).toISOString()), config), phase);
  });
}
function render(file, timestamp) {
  let clock = timestamp;
  const intervals = new Map();
  const cleared = [];
  const attributes = new Map();
  const parts = Object.fromEntries(["days", "hours", "minutes", "seconds"].map(key => [key, { textContent: "" }]));
  const display = {
    dataset: { countdownTarget: config.phases.preliminary.start }, style: {},
    querySelector(selector) { return parts[selector.match(/data-countdown-part="([^"]+)"/)?.[1]]; },
    setAttribute(key, value) { attributes.set(key, value); },
    removeAttribute(key) { attributes.delete(key); },
  };
  const kicker = { textContent: "" }, title = { textContent: "" };
  const document = {
    querySelector(selector) {
      if (selector === "[data-countdown-target]") return display;
      if (selector === ".countdown-copy .section-kicker") return kicker;
      return null;
    },
    querySelectorAll() { return []; },
    getElementById(id) { return id === "countdown-title" ? title : null; },
  };
  const FixedDate = class extends Date { constructor(...args) { super(args.length ? args[0] : clock); } };
  const window = {
    LMNAS_SITE_CONFIG: config,
    setInterval(callback, delay) { const id = intervals.size + 1; intervals.set(id, { callback, delay }); return id; },
    clearInterval(id) { cleared.push(id); intervals.delete(id); },
  };
  const context = { Date: FixedDate, document, window };
  if (file === "script.js") {
    // Execute the real helper in the same clock realm, including its default Date parameters.
    vm.runInNewContext(read("countdown.js"), context);
    window.LmnasCountdown = context.LmnasCountdown;
    vm.runInNewContext(read(file), context);
  } else {
    const inline = read(file).match(/\/\* Inlined from site-config\.js\. \*\/[\s\S]*?(?=<\/script>)/)[0];
    // Browser globals and window refer to the same object for the inlined UMD helper.
    Object.assign(context, window);
    context.window = context;
    vm.runInNewContext(inline, context);
  }
  return { display, attributes, parts, kicker, title, intervals, cleared,
    tick(next) { clock = next; for (const { callback } of [...intervals.values()]) callback(); },
  };
}
for (const file of ["script.js", "LMNas_Deployed/index.html"]) {
  for (const [timestamp, , kicker, visible] of cases) {
    test(`${file} semifinal renders ${timestamp}`, () => {
      const state = render(file, timestamp);
      assert.equal(state.title.textContent, visible ? "Babak Semifinal" : "Babak Semifinal, Final, dan Grandfinal");
      assert.equal(state.kicker.textContent, kicker);
      assert.equal(state.display.style.visibility === "hidden", !visible);
      assert.equal(state.attributes.get("aria-hidden"), visible ? undefined : "true");
      assert.equal(state.attributes.get("role"), visible ? "timer" : undefined);
      assert.match(state.attributes.get("aria-label"), /Babak Semifinal/);
      assert.equal(state.display.dataset.countdownTarget, visible ? config.phases.finals.start : undefined);
      assert.equal(state.intervals.size, kicker === "Sudah selesai" ? 0 : 1);
    });
  }
  test(`${file} ticks from preliminary to semifinal through finals and stops`, () => {
    const state = render(file, "2026-10-24T23:59:59+07:00");
    assert.equal(state.title.textContent, "Babak Penyisihan");
    state.tick("2026-10-24T23:59:59.001+07:00");
    assert.equal(state.title.textContent, "Babak Semifinal");
    assert.equal(state.display.style.visibility, "");
    state.tick("2026-11-13T23:59:59+07:00");
    assert.equal(state.parts.seconds.textContent, "01");
    state.tick("2026-11-14T00:00:00+07:00");
    assert.equal(state.kicker.textContent, "Sedang berlangsung");
    assert.equal(state.display.style.visibility, "hidden");
    assert.equal(state.intervals.size, 1);
    state.tick("2026-11-15T23:59:59+07:00");
    assert.equal(state.kicker.textContent, "Sedang berlangsung");
    state.tick("2026-11-15T23:59:59.001+07:00");
    assert.equal(state.kicker.textContent, "Sudah selesai");
    assert.equal(state.intervals.size, 0);
    assert.equal(state.cleared.length, 1);
  });
}
for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
  test(`${file} static semifinal countdown`, () => {
    const section = read(file).match(/<section class="countdown-section"[\s\S]*?<\/section>/)[0];
    assert.match(section, /id="countdown-title">Babak Semifinal/);
    assert.match(section, /14 November 2026/);
    assert.match(section, /data-countdown-target="2026-11-14T00:00:00\+07:00"/);
    assert.doesNotMatch(section, /Penyisihan|24 Oktober/);
  });
}
