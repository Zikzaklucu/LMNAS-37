"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const hero = html => html.slice(html.indexOf('<section class="hero"'), html.indexOf('<section class="countdown-section"'));

test("perched owl is one decorative composite after the live hero copy", () => {
  const section = hero(read("index.html"));
  assert.match(section, /data-hero-owl/);
  assert.equal((section.match(/class="hero-mascot"/g) || []).length, 1);
  assert.match(section, /class="hero-owl-stage" aria-hidden="true"/);
  assert.ok(section.indexOf('class="hero-owl-stage"') > section.indexOf('data-registration-link'));
  assert.match(section, /hero-owl-perched\.png" width="779" height="606" alt="" aria-hidden="true" decoding="async"/);
  assert.doesNotMatch(section, /hero-mascot-updated\.png/);
  assert.match(section, /<h1 id="hero-title">LMNAS 37<\/h1>/);
  assert.match(section, /href="https:\/\/pendaftaran\.lmnas-ugm\.com" data-registration-link>DAFTAR SEKARANG/);
  const png = fs.readFileSync(path.join(root, "Assets/figma/hero-owl-perched.png"));
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.ok(png.readUInt32BE(16) >= 779, "export is not undersized");
  assert.ok(Math.abs(png.readUInt32BE(16) / png.readUInt32BE(20) - 779 / 606) < 0.005);
});

test("perched owl layout is loaded last and mirrored without shared CSS changes", () => {
  for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
    const html = read(file);
    const links = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(m => m[0]);
    assert.match(links.at(-1), /href="hero-owl\.css\?v=5"/);
  }
  assert.equal(read("hero-owl.css"), read("LMNas_Deployed/hero-owl.css"));
});

test("owl variant restores the centered poster and original left tree", () => {
  const css = read("hero-owl.css");
  assert.match(css, /padding-block: 64px 56px;/);
  assert.doesNotMatch(css, /translate: calc\(720px - 65vw\)/);
  assert.doesNotMatch(css, /grid-template-columns: minmax\(0, 1fr\) calc/);
  assert.doesNotMatch(css, /font-size: clamp/);
  assert.match(css, /padding: 112px 0 156px;/);
  assert.match(css, /position: absolute;\s*right: 0;\s*bottom: 56px;/);
});

test("desktop poster balances the text vertically and pins the full tree to the left", () => {
  const desktop = read("hero-owl.css").split("@media (min-width: 1201px) {")[1].split("@media (min-width: 1333px)")[0];
  assert.match(desktop, /align-content: center;/);
  assert.match(desktop, /--owl-width: clamp\(480px, 40vw, 660px\);/);
  assert.match(desktop, /--owl-crop: 0\.28;/);
  assert.match(desktop, /aspect-ratio: 560\.88 \/ 606;/);
  assert.match(desktop, /left: -112px;/);
  assert.match(desktop, /transform-origin: 112px 50\.2%;/);
  assert.match(desktop, /mask-image: none;/);
});
