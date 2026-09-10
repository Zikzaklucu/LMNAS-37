"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

test("hero CTA uses a scoped forest-green surface and decorative chevron", () => {
  assert.match(css, /\.hero-cta \.figma-button \{[^}]*border: 2px solid #d8b45e;[^}]*color: #fff3ce;[^}]*background: var\(--green-dark\);/);
  assert.match(css, /\.hero-cta \.figma-button::after \{[^}]*content: "";/);
  assert.match(css, /\.hero-cta \.figma-button \{ min-height: 56px; \}/);
});

test("hero CTA has pointer-gated hover, pressed feedback and reduced-motion support", () => {
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.hero-cta \.figma-button:hover/);
  assert.match(css, /\.hero-cta \.figma-button:active \{ transform: translateY\(3px\);/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.hero-cta \.figma-button \{ transition: none;/);
});
