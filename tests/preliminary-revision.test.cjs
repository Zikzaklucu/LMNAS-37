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
  ["2026-10-10T23:59:59.001+07:00", "BEFORE_PRELIMINARY", "Menuju", true],
  ["2026-10-23T23:59:59.999+07:00", "BEFORE_PRELIMINARY", "Menuju", true],
  ["2026-10-24T00:00:00+07:00", "PRELIMINARY_ACTIVE", "Sedang berlangsung", false],
  ["2026-10-24T00:00:00.001+07:00", "PRELIMINARY_ACTIVE", "Sedang berlangsung", false],
  ["2026-10-24T23:59:58.999+07:00", "PRELIMINARY_ACTIVE", "Sedang berlangsung", false],
  ["2026-10-24T23:59:59+07:00", "PRELIMINARY_ACTIVE", "Sedang berlangsung", false],
  ["2026-10-24T23:59:59.001+07:00", "PRELIMINARY_COMPLETE", "Sudah selesai", false],
];
for (const [timestamp, key, kicker, visible] of cases) {
  test(`preliminary boundary ${timestamp}`, () => {
    const phase = countdown.resolveRegistrationPhase(new Date(timestamp), config);
    assert.equal(phase.key, key);
    assert.equal(phase.title, "Babak Penyisihan");
    assert.equal(phase.kicker, kicker);
    assert.equal(phase.showCountdown, visible);
    assert.equal(phase.countdownTarget, visible ? config.phases.preliminary.start : null);
    const utc = new Date(timestamp).toISOString();
    assert.deepEqual(countdown.resolveRegistrationPhase(new Date(utc), config), phase);
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
  for (const [timestamp, , expectedKicker, visible] of cases) {
    test(`${file} renders ${timestamp}`, () => {
      const state = render(file, timestamp);
      assert.equal(state.title.textContent, "Babak Penyisihan");
      assert.equal(state.kicker.textContent, expectedKicker);
      assert.equal(state.display.style.visibility === "hidden", !visible);
      assert.equal(state.attributes.get("aria-hidden"), visible ? undefined : "true");
      assert.equal(state.attributes.get("role"), visible ? "timer" : undefined);
      assert.match(state.attributes.get("aria-label"), /Babak Penyisihan/);
      assert.equal(state.display.dataset.countdownTarget, visible ? config.phases.preliminary.start : undefined);
      assert.equal(state.intervals.size, expectedKicker === "Sudah selesai" ? 0 : 1);
    });
  }
  test(`${file} ticks from upcoming through active to complete and stops`, () => {
    const state = render(file, "2026-10-23T23:59:59+07:00");
    assert.equal(state.parts.seconds.textContent, "01");
    state.tick("2026-10-24T00:00:00+07:00");
    assert.equal(state.kicker.textContent, "Sedang berlangsung");
    assert.equal(state.display.style.visibility, "hidden");
    assert.equal(state.intervals.size, 1);
    state.tick("2026-10-24T23:59:59+07:00");
    assert.equal(state.kicker.textContent, "Sedang berlangsung");
    state.tick("2026-10-24T23:59:59.001+07:00");
    assert.equal(state.kicker.textContent, "Sudah selesai");
    assert.equal(state.intervals.size, 0);
    assert.equal(state.cleared.length, 1);
  });
}
function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if ([".git", ".playwright-mcp", "Assets", ".hermes", ".fallow"].includes(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : entry.name.endsWith(".html") ? [target] : [];
  });
}
test("no served HTML or dormant FAQ generator contains a Daftar navigation/button anchor", () => {
  for (const file of htmlFiles(root)) {
    const html = fs.readFileSync(file, "utf8");
    for (const anchor of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
      assert.doesNotMatch(anchor[0], />\s*(?:Daftar|DAFTAR SEKARANG)\s*<\/a>/i, file);
      assert.doesNotMatch(anchor[0], /data-registration-link/, file);
    }
  }
  assert.doesNotMatch(read("FAQ.js"), /['"]Daftar['"]/);
});
for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
  test(`${file} closed copy and static countdown agree with the new target`, () => {
    const html = read(file);
    for (const section of ["hero", "registration-section"]) {
      const markup = html.match(new RegExp(`<section class="${section}"[\\s\\S]*?<\\/section>`))[0];
      assert.match(markup, /Registrasi LMNas 37 telah ditutup/);
      assert.doesNotMatch(markup, /Perpanjangan Pendaftaran|Tunggu Apa Lagi|Daftar Sekarang/i);
    }
    const markup = html.match(/<section class="countdown-section"[\s\S]*?<\/section>/)[0];
    assert.match(markup, />Menuju<\/p>/);
    assert.match(markup, /id="countdown-title">Babak Penyisihan/);
    assert.match(markup, /24 Oktober 2026/);
    assert.match(markup, /data-countdown-target="2026-10-24T00:00:00\+07:00"/);
    assert.doesNotMatch(html.match(/<head>[\s\S]*?<\/head>/)[0], /Perpanjangan Pendaftaran/);
    assert.match(html, /<h3>Perpanjangan Pendaftaran<\/h3><time datetime="2026-09-27">27 September–10 Oktober 2026/);
    assert.equal((html.match(/class="book-store-link/g) || []).length, 4);
  });
}
