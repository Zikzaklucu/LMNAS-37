"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const base = "https://zikzaklucu.github.io/LMNAS-37/";
for (const edition of [34, 35, 36]) {
  test(`deployed Soal ${edition} loads navbar styles independently of the WordPress route`, () => {
    const html = fs.readFileSync(path.join(root, `LMNas_Deployed/soal/${edition}/index.html`), "utf8");
    const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(links, [
      `${base}LMNas_Deployed/soal/${edition}/style.css?v=8`,
      `${base}sponsor-tiers.css?v=1`,
    ]);
    const nav = html.match(/<nav\b[\s\S]*?<\/nav>/)[0];
    assert.doesNotMatch(nav, />\s*Daftar\s*<|pendaftaran\.lmnas-ugm\.com/i);
    assert.match(nav, new RegExp(`href="https://lmnas\\.fmipa\\.ugm\\.ac\\.id/soal-${edition}/" aria-current="page"`));
    const papers = nav.match(/<details class="nav-papers">[\s\S]*?<\/details>/)[0];
    assert.equal((papers.match(/>LMNas (?:34|35|36)<\/a>/g) || []).length, 3);
    assert.ok(html.includes(fs.readFileSync(path.join(root, "navigation.js"), "utf8")));
    assert.ok(html.includes(fs.readFileSync(path.join(root, "archive-navigation.js"), "utf8")));
  });
}
