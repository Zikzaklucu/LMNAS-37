"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const pages = ["index.html", "LMNas_Deployed/index.html"];
const pending = "Tautan pengumuman akan tersedia segera.";
function markup(file) {
  return read(file).match(/<aside\b[^>]*data-preliminary-announcement[\s\S]*?<\/aside>/)?.[0];
}
function runtime(file) {
  if (file === "index.html") return read("announcement.js");
  const script = read(file).match(/<script data-floating-announcement>([\s\S]*?)<\/script>/);
  assert.ok(script, "deployment has self-contained announcement runtime");
  return script[1];
}
function init(file, url) {
  const body = { textContent: pending, children: [], replaceChildren(node) { this.children = [node]; this.textContent = node.textContent; } };
  const close = { addEventListener(event, callback) { assert.equal(event, "click"); this.click = callback; } };
  const notice = { hidden: false, querySelector(selector) { return selector === "[data-announcement-body]" ? body : selector === "[data-announcement-close]" ? close : null; } };
  const context = {
    URL, window: { LMNAS_SITE_CONFIG: { preliminaryAnnouncement: { url } } },
    document: { querySelector(selector) { assert.equal(selector, "[data-preliminary-announcement]"); return notice; }, createElement(tag) { assert.equal(tag, "a"); return { tagName: "A" }; } },
  };
  vm.runInNewContext(runtime(file), context);
  return { body, close, notice };
}
for (const file of pages) {
  test(`${file}: labeled pending notice initializes without a link`, () => {
    assert.ok(markup(file), "homepage has floating announcement aside");
    assert.match(markup(file), /aria-labelledby="preliminary-announcement-title"/);
    assert.match(markup(file), /id="preliminary-announcement-title">Pengumuman Babak Penyisihan LMNas 37<\/h2>/);
    assert.match(markup(file), /Tautan pengumuman akan tersedia segera\./);
    assert.doesNotMatch(markup(file), /<a\b|autofocus|role="(?:alert|dialog)"/);
    const state = init(file, "");
    assert.equal(state.body.textContent, pending);
    assert.equal(state.body.children.length, 0);
    assert.equal(state.notice.hidden, false);
  });
  test(`${file}: dismiss lasts only for this page load`, () => {
    const state = init(file, "");
    assert.equal(typeof state.close.click, "function");
    state.close.click();
    assert.equal(state.notice.hidden, true);
    assert.equal(init(file, "").notice.hidden, false);
    assert.doesNotMatch(runtime(file), /localStorage|sessionStorage|setTimeout|setInterval|\.focus\(|innerHTML/);
  });
  for (const url of ["https://example.org/results?level=smp", "http://example.org/results"]) {
    test(`${file}: configured ${url} creates a safe link`, () => {
      const state = init(file, url);
      assert.equal(state.body.children.length, 1);
      assert.equal(state.body.children[0].href, url);
      assert.equal(state.body.children[0].textContent, "Lihat pengumuman");
    });
  }
  for (const url of ["javascript:alert(1)", "data:text/html,test", "/results", "//example.org/results", "https://", "https:example.org", "not a URL", null]) {
    test(`${file}: rejects ${JSON.stringify(url)}`, () => {
      const state = init(file, url);
      assert.equal(state.body.children.length, 0);
      assert.equal(state.body.textContent, pending);
    });
  }
}
test("source and deployment share markup, runtime, CSS and official announcement config", () => {
  assert.equal(markup(pages[0]), markup(pages[1]));
  assert.equal(runtime(pages[0]).trim(), runtime(pages[1]).trim());
  const css = read("announcement.css");
  assert.equal(read(pages[1]).match(/<style data-floating-announcement>([\s\S]*?)<\/style>/)?.[1].trim(), css.trim());
  for (const file of pages) {
    const context = { window: {} };
    const config = file === "index.html" ? read("site-config.js") : read(file).match(/\/\* Inlined from site-config\.js\. \*\/([\s\S]*?)(?=\/\* Inlined from)/)[1];
    vm.runInNewContext(config, context);
    assert.equal(context.window.LMNAS_SITE_CONFIG.preliminaryAnnouncement.url, "https://bit.ly/HasilPenyisihanLMNas37UGM");
    assert.match(read(file), /data-countdown-target="2026-11-14T00:00:00\+07:00"/);
    assert.match(read(file), /<h2 id="countdown-title">Babak Semifinal<\/h2>/);
    assert.match(markup(file), /type="button" aria-label="Tutup pengumuman babak penyisihan"/);
  }
  assert.match(read(pages[0]), /href="announcement\.css\?v=2"/);
  assert.match(read(pages[0]), /src="announcement\.js\?v=1" defer/);
  assert.match(read(pages[0]), /src="site-config\.js\?v=9" defer/);
  assert.doesNotMatch(read(pages[1]), /(?:src|href)="[^"]*announcement\.(?:css|js)/);
});
test("CSS guardrails: fixed compact desktop, inset mobile, safe-area, focus and hidden", () => {
  const css = read("announcement.css");
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /width:\s*min\(420px,/);
  assert.match(css, /top:[^;]*safe-area-inset-top/);
  assert.match(css, /left:\s*50%/);
  assert.match(css, /transform:\s*translateX\(-50%\)/);
  assert.doesNotMatch(css, /bottom:/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /width:[^;]*safe-area-inset-left/);
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /outline:\s*3px solid/);
  assert.doesNotMatch(css, /animation|transition|backdrop/);
});
