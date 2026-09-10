"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

test("mobile hero centers its intrinsic content and reserves artwork space", () => {
  assert.match(css, /\.hero \{ display: grid; align-items: center; height: auto; min-height: max\(560px, calc\(100svh - 56px\)\); padding-block: 48px 104px;/);
  assert.match(css, /\.hero-copy \{ padding-top: 0; \}/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.hero-cta \.hero-flowers \{ display: none; \}/);
  assert.match(css, /\.hero-copy \.hero-subhead \{[^}]*font-size: 14px;[^}]*line-height: 1\.45;/);
});

test("hero entrance is mobile-only, finite, and respects reduced motion", () => {
  const motion = css.slice(css.indexOf("/* Mobile hero:"), css.indexOf("/* Testimonial carousel:"));
  assert.match(motion, /@media \(max-width: 560px\) and \(prefers-reduced-motion: no-preference\)/);
  assert.match(motion, /animation: mobile-hero-enter 720ms/);
  assert.match(motion, /animation-delay: 240ms/);
  assert.doesNotMatch(motion, /infinite/);
  assert.match(motion, /to \{ opacity: 1; transform: translateY\(0\); \}/);
});
