"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const pages = ["index.html", "buku-panduan/index.html", "faq/index.html", "peraturan/index.html", "soal/34/index.html", "soal/35/index.html", "soal/36/index.html"];

test("all source and deployment footers load tiers and identify Fumalife correctly", () => {
  for (const file of [...pages, ...pages.map(file => `LMNas_Deployed/${file}`)]) {
    const html = read(file);
    const href = html.match(/href="([^"]*sponsor-tiers\.css\?v=1)"/);
    assert.ok(href, file);
    assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), href[1].split("?")[0])), file);
    const sponsors = html.split('aria-label="Mitra LMNAS 37">')[1].split("</ul>")[0];
    assert.equal((sponsors.match(/<li /g) || []).length, 9, file);
    for (const name of ["standard", "bsm", "mic", "taman-batik", "raden", "wisma", "imperial", "takaful", "fumalife"]) {
      assert.ok(sponsors.includes(`footer-logo--${name}\"`), `${file}: ${name}`);
    }
    assert.match(sponsors, /alt="Fumalife"/);
    assert.doesNotMatch(sponsors, /alt="Manulife"/);
  }
});

test("tier stylesheet is mirrored exactly and preserves intrinsic logo proportions", () => {
  const css = read("sponsor-tiers.css");
  assert.equal(read("LMNas_Deployed/sponsor-tiers.css"), css);
  for (const [width, height] of [[120,60], [180,90], [320,120], [80,40], [220,80]]) {
    assert.match(css, new RegExp(`width: ${width}px;\\s*height: ${height}px;`));
  }
  assert.match(css, /transform: none; object-fit: contain/);
});
