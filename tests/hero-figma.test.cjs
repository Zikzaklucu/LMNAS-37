"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const hero = (html) => html.slice(html.indexOf('<section class="hero"'), html.indexOf('<section class="countdown-section"'));

test("the updated hero ships the approved decorative exports with accessible HTML copy", () => {
  const section = hero(read("index.html"));
  const assets = [...section.matchAll(/src="(Assets\/figma\/[^"?]+)/g)].map((match) => match[1]);
  for (const asset of assets) assert.ok(fs.statSync(path.join(root, asset)).size > 0, asset);
  assert.equal((section.match(/<h1 /g) || []).length, 1);
  assert.match(section, /class="hero-canopy" aria-hidden="true"/);
  assert.match(section, /class="hero-branch-right" src="Assets\/figma\/hero-branch-right\.svg" alt=""/);
  assert.equal((section.match(/src="Assets\/figma\/hero-(?:canopy|vine|flower)-/g) || []).length, 11);
  assert.match(section, /hero-owl-perched\.png" width="779" height="606" alt="" aria-hidden="true"/);
  assert.match(section, /hero-expedition-updated\.svg/);
  assert.match(section, /data-registration-link>DAFTAR SEKARANG<\/a>/);
});

test("the deployment hero matches canonical markup after asset URL conversion", () => {
  assert.equal(hero(read("LMNas_Deployed/index.html")), hero(read("index.html")).replaceAll('src="Assets/', 'src="https://zikzaklucu.github.io/LMNAS-37/Assets/'));
});

test("hero hierarchy preserves live copy and scopes the readable registration action", () => {
  const section = hero(read("index.html"));
  const css = read("style.css");
  assert.match(section, /<h1 id="hero-title">LMNAS 37<\/h1>/);
  assert.match(section, /Gateway<br \/> to Broader Thinking and Limitless Potential/);
  assert.match(section, /data-registration-link>DAFTAR SEKARANG<\/a>/);
  assert.match(css, /\.hero h1 \{[^}]*font-family: var\(--display\);[^}]*font-size: 135px;[^}]*font-weight: 400;[^}]*letter-spacing: \.035em;/);
  assert.match(css, /\.hero-copy \.hero-subhead \{[^}]*margin: 26px 0 0;/);
  assert.match(css, /\.hero h1 \{ font-size: clamp\(63px, 11\.7vw, 108px\);/);
  assert.match(css, /\.hero h1 \{ margin-top: 0; font-size: clamp\(57\.6px, 15\.3vw, 72px\);/);
  assert.match(css, /\.hero-copy \.hero-subhead \{[^}]*margin-top: 24px;[^}]*font-size: 17px;/);
  assert.match(css, /\.hero-copy \.hero-subhead \{[^}]*margin-top: 22px;[^}]*font-size: 14px;/);
  assert.match(css, /\.hero-copy \.hero-subhead \{[^}]*font-size: 22px;[^}]*font-weight: 500;/);
  assert.match(css, /\.hero-cta \.figma-button \{[^}]*min-height: 64px;[^}]*font-family: var\(--body\);/);
  assert.match(css, /\.hero-cta \.figma-button:focus-visible \{ outline: 3px solid var\(--green-dark\); outline-offset: 5px; \}/);
  assert.match(css, /\.hero-cta::before \{ right: calc\(100% \+ 36px\);/);
  assert.match(css, /\.hero-cta::after \{ left: calc\(100% \+ 36px\);/);
  assert.match(css, /@media \(max-width: 1200px\) \{[^@]*\.hero-cta::before, \.hero-cta::after \{ display: none; \}/);
});

test("desktop canopy uses the exact Figma composition without invented leaf tufts", () => {
  for (const file of ["style.css", "LMNas_Deployed/style.css"]) {
    const css = read(file);
    assert.doesNotMatch(css, /hero-corner-leaves\.svg/);
    assert.match(css, /\.hero-canopy-figma \{ display: none; \}/);
    assert.match(css, /\.hero-canopy > img:not\(\.hero-canopy-figma\) \{ display: none; \}/);
    assert.match(css, /\.hero-canopy \{ top: 0; left: 0; width: 100%; height: 358px; transform: none; \}/);
    assert.match(css, /\.hero-canopy \.hero-canopy-figma \{ display: block; top: 0; width: 1440px; height: auto; \}/);
    assert.match(css, /\.hero-canopy-figma--left \{ left: 0; clip-path: inset\(0 720px 0 0\); \}/);
    assert.match(css, /\.hero-canopy-figma--right \{ right: 0; left: auto; clip-path: inset\(0 0 0 720px\); \}/);
  }
  const section = hero(read("index.html"));
  assert.equal((section.match(/src="Assets\/figma\/hero-canopy-figma\.svg"/g) || []).length, 2);
  assert.match(section, /class="hero-canopy-figma hero-canopy-figma--left"[^>]*width="1440" height="358"[^>]*alt=""/);
  assert.match(section, /class="hero-canopy-figma hero-canopy-figma--right"[^>]*width="1440" height="358"[^>]*alt=""/);
  const svg = read("Assets/figma/hero-canopy-figma.svg");
  assert.match(svg, /viewBox="0 0 1440 358"/);
  const ledger = JSON.parse(read("Assets/figma/hero-canopy-figma.json"));
  assert.equal(ledger.fileKey, "dICcx4cjMj46tNxFXet12l");
  assert.equal(ledger.frame, "2816:2708");
  assert.equal(ledger.heroOriginY, 112);
  assert.equal(ledger.nodes.length, 15);
  const branch = ledger.nodes.find(n => n.id === "4824:16046");
  assert.ok(Math.abs(branch.frameBounds.x - 1099) < .001);
  assert.equal(branch.frameBounds.y, -34);
  assert.ok(Math.abs(branch.frameBounds.width - 548.7646474755147) < .001);
  assert.equal(branch.heroY, -146);
  for (const node of ledger.nodes) assert.ok(svg.includes(`data-figma-node="${node.id}"`), node.id);
});
