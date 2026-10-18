"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const stylesheets = ["style.css", "LMNas_Deployed/style.css", ...[
  "faq", "peraturan", "soal/34", "soal/35", "soal/36",
].map(page => `LMNas_Deployed/${page}/style.css`)];
const homeScope = "html:has(#main-content > .hero#home)";
for (const file of stylesheets) {
  test(`${file}: mobile mandatory snapping and targets require actual homepage content`, () => {
    const css = read(file);
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    const mandatory = rules.filter(([, , body]) => /scroll-snap-type:\s*y mandatory/.test(body));
    assert.equal(mandatory.length, 1);
    assert.equal(mandatory[0][1].trim(), homeScope);
    const targets = rules.filter(([, , body]) => /scroll-snap-align:/.test(body));
    assert.equal(targets.length, 1);
    assert.deepEqual(targets[0][1].trim().split(/,\s*/), [
      `${homeScope} #main-content > section`, `${homeScope} .footer`,
    ]);
    assert.match(css, /@media \(max-width: 640px\) \{\s*:root \{[^}]*\}\s*html:has\(#main-content > \.hero#home\)/);
    // Descendant :has searches through WordPress outer body/content wrappers;
    // a body class or html > body > main chain would not survive that markup.
    assert.doesNotMatch(mandatory[0][1], /body|:not/);
  });
}
test("guide stylesheets do not enable section snapping", () => {
  for (const file of ["buku-panduan/style.css", "LMNas_Deployed/buku-panduan/style.css"]) {
    assert.doesNotMatch(read(file), /scroll-snap-(?:type|align):/);
  }
});
test("only canonical and bundled homepages carry the positive snap marker", () => {
  for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
    assert.match(read(file), /<main id="main-content">\s*<section class="hero" id="home"/);
  }
  for (const prefix of ["", "LMNas_Deployed/"]) {
    for (const page of ["faq", "peraturan", "buku-panduan", "soal/34", "soal/35", "soal/36"]) {
      assert.doesNotMatch(read(`${prefix}${page}/index.html`), /<section[^>]*class="hero"[^>]*id="home"/);
    }
  }
});
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if ([".git", ".playwright-mcp", "Assets", ".hermes", ".fallow"].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}
test("actual navigation contains no expired registration link, while FAQ instructions remain", () => {
  for (const file of htmlFiles(root)) {
    for (const [nav] of read(path.relative(root, file)).matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)) {
      for (const [anchor] of nav.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
        const text = anchor.replace(/<[^>]*>/g, " ").trim();
        assert.doesNotMatch(text, /\bdaftar\b/i, file);
        assert.doesNotMatch(anchor, /pendaftaran\.lmnas-ugm\.com|data-registration-link/i, file);
      }
    }
  }
  for (const file of ["faq/index.html", "LMNas_Deployed/faq/index.html"]) {
    assert.match(read(file), /Peserta dapat melakukan pendaftaran melalui situs <a href="https:\/\/pendaftaran\.lmnas-ugm\.com"/);
  }
});
