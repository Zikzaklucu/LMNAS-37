"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const pageRoot = path.join(projectRoot, "peraturan");
const html = fs.readFileSync(path.join(pageRoot, "index.html"), "utf8");
const css = fs.readFileSync(path.join(pageRoot, "peraturan.css"), "utf8");
const mainHtml = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");

const footerMarkup = (source) => source.match(/<footer\b[\s\S]*?<\/footer>/)[0]
  .replace(/\.\.\/Assets/g, "Assets")
  .replace(/\s+/g, " ")
  .trim();

test("the page publishes every supplied preliminary-round rule", () => {
  assert.equal((html.match(/class="rules-section"/g) || []).length, 2);
  assert.equal((html.match(/class="rule-item"/g) || []).length, 21);
  assert.match(html, /<h2 id="rules-test-title">Peraturan Pengerjaan Soal<\/h2>/);
  assert.match(html, /<h2 id="rules-supervision-title">Peraturan Pengawasan<\/h2>/);
  assert.match(html, /25 soal pilihan ganda/);
  assert.match(html, /5 soal isian singkat/);
  assert.match(html, /120 menit/);
  assert.match(html, /09\.00 WIB s\.d\. 11\.00 WIB/);
  assert.match(html, /tidak ada konfirmasi selama 10 menit/);
  assert.doesNotMatch(html, /Lorem ipsum/i);
  assert.doesNotMatch(html, /081325201109|Ethan Armana Gellet/);
});

test("the supplied website and objection email are actionable", () => {
  assert.match(html, /href="http:\/\/lmnas\.fmipa\.ugm\.ac\.id"[^>]*>situs web LMNas UGM<\/a>/);
  assert.match(html, /href="mailto:sanggahanlmnas@gmail\.com">sanggahanlmnas@gmail\.com<\/a>/);
});

test("all three supplied camera examples are optimized and explained", () => {
  const images = [
    "camera-position-correct.webp",
    "camera-position-front.webp",
    "camera-position-rear.webp",
  ];

  assert.equal((html.match(/class="camera-example /g) || []).length, 3);
  assert.equal((html.match(/<figcaption>/g) || []).length, 3);
  assert.match(html, /<figcaption><span aria-hidden="true">✓<\/span> Benar<\/figcaption>/);
  assert.equal((html.match(/<figcaption><span aria-hidden="true">✕<\/span> Salah<\/figcaption>/g) || []).length, 2);

  for (const image of images) {
    assert.match(html, new RegExp(`src="assets/${image.replace(".", "\\.")}"[^>]*alt="[^"]+"`));
    assert.equal(fs.existsSync(path.join(pageRoot, "assets", image)), true);
  }
});

test("the content card preserves the LMNAS visual system and reflows on mobile", () => {
  assert.match(css, /\.rules-card \{[^}]*border: 14px solid var\(--green\);[^}]*background: var\(--cream\);/s);
  assert.match(css, /\.rules-section h2 \{[^}]*font-family: var\(--display\);/s);
  assert.match(css, /\.camera-examples \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/s);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.camera-examples \{[^}]*grid-template-columns: 1fr;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("the peraturan page keeps shared navigation and footer content intact", () => {
  assert.match(html, /<a href="\.\/" aria-current="page">Peraturan<\/a>/);
  assert.match(html, /<a href="https:\/\/pendaftaran\.lmnas-ugm\.com">Daftar<\/a>/);
  assert.match(html, /<button type="button" class="nav-contact-toggle" aria-expanded="false" aria-controls="nav-contact-menu">Contact<\/button>/);
  assert.match(html, /<a href="https:\/\/wa\.me\/6285113291516" target="_blank" rel="noopener noreferrer">SMP Contact Person<\/a>/);
  assert.match(html, /<a href="https:\/\/wa\.me\/6285173085643" target="_blank" rel="noopener noreferrer">SMA Contact Person<\/a>/);
  assert.match(html, /<a href="https:\/\/drive\.google\.com\/drive\/folders\/1imqxenO6Xh_K6TGj5i14sCKNBGKQ0Jho\?usp=sharing" target="_blank" rel="noopener noreferrer">Silabus<\/a>/);
  assert.equal(footerMarkup(html), footerMarkup(mainHtml));
  assert.ok(html.indexOf('href="../style.css') < html.indexOf('href="peraturan.css'));
});
