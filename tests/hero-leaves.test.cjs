"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("falling leaves are hero-only and decorative without a visible pause control", () => {
  for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
    const html = read(file);
    const hero = html.slice(html.indexOf('<section class="hero"'), html.indexOf('<section class="countdown-section"'));
    assert.equal((hero.match(/class="hero-leaf"/g) || []).length, 12);
    assert.equal((html.match(/class="hero-leaves"/g) || []).length, 1);
    assert.match(hero, /class="hero-leaves" aria-hidden="true"/);
    assert.doesNotMatch(hero, /hero-leaves-toggle|Jeda animasi daun/);
    assert.match(html, /href="hero-leaves.css\?v=3"/);
  }
});

test("leaf CSS is mirrored, clipped, pointer-transparent and motion-safe", () => {
  const css = read("hero-leaves.css");
  assert.equal(css, read("LMNas_Deployed/hero-leaves.css"));
  assert.match(css, /overflow: hidden; pointer-events: none;/);
  assert.doesNotMatch(css, /hero-leaves-toggle/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.hero-leaf, \.hero-leaf::before \{ animation: none;/);
  const paths = [...css.matchAll(/--x: (\d+)%; --duration: ([\d.]+)s;/g)];
  assert.equal(paths.length, 12);
  assert.equal(paths.filter((match) => +match[1] > 30 && +match[1] < 70).length, 2);
  assert.equal(new Set(paths.map((match) => match[2])).size, 12);
  assert.equal((css.match(/--delay: -[\d.]+s;/g) || []).length, 12);
  assert.match(css, /nth-child\(n\) \{ --sway-scale: \.4;/);
  assert.doesNotMatch(css.slice(css.indexOf("@media (max-width: 1200px)")), /--x:/);
});
