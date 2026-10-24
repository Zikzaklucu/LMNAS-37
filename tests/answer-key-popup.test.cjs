"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const SMP_KEY_URL = "https://drive.google.com/file/d/1t5GzPcPClTMTX6uxZttShoG0jHZPzkTs/view";
const SMA_KEY_URL = "https://drive.google.com/file/d/1qr1yrmL4n38Av0sSNV8A2TvAsbzYKuXv/view";

const SMP_PAPER_URL = "https://drive.google.com/file/d/1z6X08ksc03rigrLlyuN0D0G992wh0nbN/view?usp=sharing";
const SMA_PAPER_URL = "https://drive.google.com/file/d/11KLL1XVLK1hoOBWAtTo3L2pQ1D-YM1Rp/view?usp=sharing";

function setup(answerKeys = {}, { supported = true, present = true, preliminaryPapers = {} } = {}) {
  const element = () => ({
    hidden: true,
    listeners: {},
    children: [],
    addEventListener(name, callback) { this.listeners[name] = callback; },
    replaceChildren(...children) { this.children = children; },
    focus() { this.focused = true; },
  });
  const trigger = element();
  const close = element();
  const slots = ["smp", "sma"].map((level) => ({ ...element(), dataset: { answerKeyLevel: level } }));
  const paperSlots = ["smp", "sma"].map((level) => ({ ...element(), dataset: { preliminaryPaperLevel: level } }));
  const dialog = {
    ...element(), open: false,
    showModal: supported ? function () { this.open = true; } : undefined,
    close() { this.open = false; this.listeners.close(); },
    querySelector() { return close; },
    querySelectorAll(selector) { return selector === "[data-preliminary-paper-level]" ? paperSlots : slots; },
    getBoundingClientRect() { return { left: 100, right: 600, top: 100, bottom: 500 }; },
  };
  const classes = new Set();
  const document = {
    baseURI: "https://lmnas.example.test/",
    documentElement: { classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } },
    querySelector: () => present ? trigger : null,
    getElementById: () => present ? dialog : null,
    createElement: () => element(),
  };
  vm.runInNewContext(read("answer-key.js"), { document, window: { LMNAS_SITE_CONFIG: { answerKeys, preliminaryPapers } }, URL });
  return { trigger, close, dialog, classes, slots, paperSlots };
}

for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
  test(`${file}: hero opens a named native dialog with safe initial states`, () => {
    const html = read(file);
    const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0];
    assert.match(hero, /<button[^>]*type="button"[^>]*aria-haspopup="dialog"[^>]*aria-controls="answer-key-dialog"[^>]*data-answer-key-open[^>]*hidden/);
    assert.match(hero, /Soal &amp; Kunci Jawaban Penyisihan/);
    const dialog = html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0];
    assert.match(dialog, /id="answer-key-dialog"/);
    assert.match(dialog, /aria-labelledby="answer-key-title"/);
    assert.match(dialog, /<h2 id="answer-key-title">Soal &amp; Kunci Jawaban<\/h2>/);
    assert.doesNotMatch(dialog, /LMNAS 37 · BABAK PENYISIHAN|Kunci jawaban Babak Penyisihan LMNas 37 untuk jenjang SMP dan SMA\.|answer-key-description|answer-key-kicker/);
    assert.match(dialog, /data-answer-key-close[^>]*autofocus/);
    assert.match(dialog, /data-answer-key-level="smp">Belum tersedia\.<\/p>/);
    assert.match(dialog, /data-answer-key-level="sma">Belum tersedia\.<\/p>/);
    for (const level of ["smp", "sma"]) assert.ok(dialog.includes(`data-preliminary-paper-level="${level}">Belum tersedia.</p>`));
    assert.doesNotMatch(dialog, /href=|\bopen\b/);
    if (file.startsWith("LMNas_Deployed/")) assert.ok(html.includes(read("site-config.js").trim()));
    const fallback = html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0];
    assert.ok(fallback.includes(`href="${SMA_KEY_URL}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(fallback.includes(`href="${SMP_KEY_URL}" target="_blank" rel="noopener noreferrer"`));
    for (const url of [SMP_PAPER_URL, SMA_PAPER_URL]) assert.ok(fallback.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`));
    assert.doesNotMatch(fallback, /belum tersedia/i);
  });
}

test("the source loads popup assets and deployment inlines the exact script and stylesheet", () => {
  assert.match(read("index.html"), /src="site-config.js\?v=7" defer/);
  assert.match(read("index.html"), /href="answer-key.css\?v=4"/);
  assert.match(read("index.html"), /src="answer-key.js\?v=2" defer/);
  const deployed = read("LMNas_Deployed/index.html");
  assert.ok(deployed.includes(read("answer-key.js").trim()));
  assert.ok(read("LMNas_Deployed/style.css").includes(read("answer-key.css").trim()));
  assert.match(deployed, /LMNas_Deployed\/style.css\?v=188/);
  const config = {};
  vm.runInNewContext(read("site-config.js"), { window: config });
  assert.equal(config.LMNAS_SITE_CONFIG.answerKeys.smp, SMP_KEY_URL);
  assert.equal(config.LMNAS_SITE_CONFIG.answerKeys.sma, SMA_KEY_URL);
});

test("the production configuration activates both exact supplied PDF links", () => {
  const config = {};
  vm.runInNewContext(read("site-config.js"), { window: config });
  const app = setup(config.LMNAS_SITE_CONFIG.answerKeys);
  for (const [index, level, url] of [[0, "SMP", SMP_KEY_URL], [1, "SMA", SMA_KEY_URL]]) {
    assert.equal(app.slots[index].children.length, 1);
    const link = app.slots[index].children[0];
    assert.equal(link.href, url);
    assert.equal(link.textContent, `Lihat Kunci Jawaban ${level}`);
    assert.equal(link.target, "_blank");
    assert.equal(link.rel, "noopener noreferrer");
  }
});

test("the production configuration renders each exact preliminary paper alongside its answer key", () => {
  const config = {};
  vm.runInNewContext(read("site-config.js"), { window: config });
  const { answerKeys, preliminaryPapers } = config.LMNAS_SITE_CONFIG;
  const app = setup(answerKeys, { preliminaryPapers });
  for (const [index, level, url] of [[0, "smp", SMP_PAPER_URL], [1, "sma", SMA_PAPER_URL]]) {
    assert.equal(preliminaryPapers[level], url);
    assert.equal(app.paperSlots[index].children.length, 1);
    const link = app.paperSlots[index].children[0];
    assert.equal(link.href, url);
    assert.equal(link.textContent, `Lihat Soal ${level.toUpperCase()}`);
    assert.equal(link.target, "_blank");
    assert.equal(link.rel, "noopener noreferrer");
    assert.equal(app.slots[index].children.length, 1);
  }
});

test("preliminary papers validate independently and never replace existing answer keys", () => {
  const keys = { smp: SMP_KEY_URL, sma: SMA_KEY_URL };
  const app = setup(keys, { preliminaryPapers: { smp: SMP_PAPER_URL } });
  assert.equal(app.paperSlots[0].children[0].href, SMP_PAPER_URL);
  assert.equal(app.paperSlots[1].children.length, 0);
  assert.equal(app.slots[0].children[0].href, SMP_KEY_URL);
  const relative = setup({}, { preliminaryPapers: { sma: "Assets/documents/sma.pdf" } });
  assert.equal(relative.paperSlots[1].children[0].href, "https://lmnas.example.test/Assets/documents/sma.pdf");
  for (const value of [null, "", "javascript:alert(1)", "data:text/html,test", "https://[", 42]) {
    const pending = setup(keys, { preliminaryPapers: { smp: value } });
    assert.equal(pending.paperSlots[0].children.length, 0, String(value));
    assert.equal(pending.slots[0].children[0].href, SMP_KEY_URL);
  }
});

test("the answer-key popup has a green outer border and inner rim in both stylesheets", () => {
  for (const file of ["answer-key.css", "LMNas_Deployed/style.css"]) {
    const rule = read(file).match(/\.answer-key-dialog \{([^}]+)\}/)?.[1];
    assert.ok(rule, file);
    assert.match(rule, /border: 2px solid var\(--green\);/);
    assert.match(rule, /inset 0 0 0 6px var\(--green\)/);
  }
});

test("popup is user-triggered, locks scroll and restores focus when closed", () => {
  const app = setup();
  assert.equal(app.trigger.hidden, false);
  assert.equal(app.dialog.open, false);
  assert.equal(app.slots[0].children.length, 0);
  app.trigger.listeners.click();
  assert.equal(app.dialog.open, true);
  assert.ok(app.classes.has("answer-key-modal-open"));
  app.close.listeners.click();
  assert.equal(app.dialog.open, false);
  assert.equal(app.classes.size, 0);
  assert.equal(app.trigger.focused, true);
});

test("native Escape close performs the same cleanup", () => {
  const app = setup();
  app.trigger.listeners.click();
  app.dialog.open = false;
  app.dialog.listeners.close();
  assert.equal(app.classes.size, 0);
  assert.equal(app.trigger.focused, true);
});

test("Escape cancellation restores the page immediately, even before a queued close event", () => {
  const app = setup();
  let prevented = false;
  app.dialog.close = function () { this.open = false; };
  app.trigger.listeners.click();
  app.dialog.listeners.cancel({ preventDefault() { prevented = true; } });
  assert.ok(prevented);
  assert.equal(app.dialog.open, false);
  assert.equal(app.classes.size, 0);
  assert.equal(app.trigger.focused, true);
});

test("a delayed close event cannot unlock a newly reopened dialog", () => {
  const app = setup();
  app.trigger.listeners.click();
  app.close.listeners.click();
  app.trigger.listeners.click();
  app.dialog.listeners.close();
  assert.equal(app.dialog.open, true);
  assert.ok(app.classes.has("answer-key-modal-open"));
});

test("a backdrop click closes, but an inside click or a drag from inside does not", () => {
  const app = setup();
  const outside = { target: app.dialog, clientX: 10, clientY: 10 };
  const inside = { target: app.dialog, clientX: 200, clientY: 200 };
  app.trigger.listeners.click();
  app.dialog.listeners.pointerdown(inside);
  app.dialog.listeners.click(outside);
  assert.equal(app.dialog.open, true);
  app.dialog.listeners.pointerdown(outside);
  app.dialog.listeners.click(inside);
  assert.equal(app.dialog.open, true);
  app.dialog.listeners.pointerdown(outside);
  app.dialog.listeners.click(outside);
  assert.equal(app.dialog.open, false);
});

test("approved URLs activate only their own level with safe external-link attributes", () => {
  const app = setup({ smp: "https://files.example.test/smp.pdf" });
  const link = app.slots[0].children[0];
  assert.equal(link.href, "https://files.example.test/smp.pdf");
  assert.equal(link.target, "_blank");
  assert.equal(link.rel, "noopener noreferrer");
  assert.equal(link.textContent, "Lihat Kunci Jawaban SMP");
  assert.equal(app.slots[1].children.length, 0);
});

test("relative document URLs resolve while unsafe or malformed URLs remain unavailable", () => {
  const relative = setup({ sma: "Assets/documents/sma.pdf" });
  assert.equal(relative.slots[1].children[0].href, "https://lmnas.example.test/Assets/documents/sma.pdf");
  for (const value of [null, "", "javascript:alert(1)", "data:text/html,test", "https://[", 42]) {
    const app = setup({ smp: value });
    assert.equal(app.slots[0].children.length, 0, String(value));
  }
});

test("shared script safely skips absent markup or unsupported dialog browsers", () => {
  assert.doesNotThrow(() => setup({}, { present: false }));
  const app = setup({}, { supported: false });
  assert.equal(app.trigger.hidden, true);
});
