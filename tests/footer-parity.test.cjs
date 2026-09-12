"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const footer = (html) => {
  const start = html.indexOf("<footer");
  const end = html.indexOf("</footer>", start) + "</footer>".length;
  assert.ok(start >= 0 && end > start, "page has a footer block");
  return html.slice(start, end);
};
const normalizeSourceAssets = (block) => block
  .replaceAll('src="../Assets/', 'src="Assets/')
  .replaceAll('src="../../Assets/', 'src="Assets/');

const sourceRoutes = [
  "index.html",
  "faq/index.html",
  "peraturan/index.html",
  "buku-panduan/index.html",
  "soal/34/index.html",
  "soal/35/index.html",
  "soal/36/index.html",
];
const deployedRoutes = sourceRoutes.map((file) => `LMNas_Deployed/${file}`);

const assertPartnerContent = (block) => {
  assert.match(block, /<footer class="footer"/);
  assert.equal((block.match(/class="footer-logo footer-logo--/g) || []).length, 11);
  assert.equal((block.match(/class="footer-logo footer-logo--(?:standard|bsm|mic|taman-batik|raden|wisma|imperial|takaful|fumalife)/g) || []).length, 9);
  assert.equal((block.match(/class="footer-logo footer-logo--(?:jogja-tv|kotaperak)/g) || []).length, 2);
  assert.match(block, /alt="Fumalife"/);
  assert.match(block, /alt="Jogja TV"/);
  assert.match(block, /alt="Kotaperak 94\.6 FM"/);
};

test("all source subpages reuse the main page partner footer", () => {
  const main = normalizeSourceAssets(footer(read("index.html")));
  for (const route of sourceRoutes) {
    const block = normalizeSourceAssets(footer(read(route)));
    assert.equal(block, main, route);
    assertPartnerContent(block);
  }
});

test("all deployed subpages reuse the deployed main page partner footer", () => {
  const main = footer(read("LMNas_Deployed/index.html"));
  for (const route of deployedRoutes) {
    const block = footer(read(route));
    assert.equal(block, main, route);
    assertPartnerContent(block);
  }
});

test("the guide footer uses the shared footer class at every responsive breakpoint", () => {
  for (const stylesheet of ["buku-panduan/style.css", "LMNas_Deployed/buku-panduan/style.css"]) {
    const css = read(stylesheet);
    assert.doesNotMatch(css, /guide-footer/);
    assert.match(css, /\.footer\s*\{/);
  }
});
