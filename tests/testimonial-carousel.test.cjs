"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");

const photos = [
  "testimonial-aldan.jpg",
  "testimonial-rama-790d8f.png",
  "testimonial-jeremy-7f6210.png",
];

test("the testimonial carousel exposes three semantic slides and controls", () => {
  assert.equal((html.match(/data-carousel-slide/g) || []).length, 3);
  assert.equal((html.match(/data-carousel-dot=/g) || []).length, 3);
  assert.match(html, /data-carousel-prev aria-label="Testimoni sebelumnya"/);
  assert.match(html, /data-carousel-next aria-label="Testimoni berikutnya"/);
  assert.match(html, /role="region" aria-roledescription="carousel"/);
});

test("every winner has a distinct local portrait", () => {
  for (const photo of photos) {
    assert.match(script, new RegExp(`Assets/figma/${photo.replaceAll(".", "\\.")}`));
    assert.equal(fs.existsSync(path.join(root, "Assets", "figma", photo)), true);
  }
  assert.equal(new Set(photos).size, 3);
});

test("the three Figma testimonials are present without invented replacement copy", () => {
  assert.match(script, /Assalamualaikum warahmatullahi wabarakatuh/);
  assert.match(script, /Perkenalkan, nama saya Rama Maheswara Pradnya Kusala dari SMP Negeri 1 Boyolali/);
  assert.match(script, /Halo semuanya, nama aku Jeremy Manuelle Gading/);
  assert.doesNotMatch(script, /Kompetisi ini menjadi pengalaman berharga untuk terus belajar/);
  assert.doesNotMatch(script, /LMNas memberi saya kesempatan untuk menguji kemampuan/);
});

test("the testimonial card uses the original Home3 cream, green, and black treatment", () => {
  const figmaStates = css.slice(css.indexOf("/* Figma testimonial states"));
  const cardRule = figmaStates.match(/\.testimonial-card blockquote \{([\s\S]*?)\n\}/)?.[1] || "";
  const nameRule = figmaStates.match(/\.testimonial-name h3 \{([\s\S]*?)\n\}/)?.[1] || "";
  const awardRule = figmaStates.match(/\.testimonial-award \{([\s\S]*?)\n\}/)?.[1] || "";
  assert.match(cardRule, /border:\s*10px solid var\(--green\)/);
  assert.match(cardRule, /color:\s*#000/);
  assert.match(cardRule, /background:\s*var\(--cream\)/);
  assert.doesNotMatch(cardRule, /#384f20/);
  assert.match(nameRule, /color:\s*var\(--green\)/);
  assert.match(awardRule, /color:\s*var\(--green\)/);
  assert.doesNotMatch(nameRule, /-webkit-text-fill-color:\s*transparent/);
});

test("the carousel uses the Figma testimonial color, type, and motion treatment", () => {
  assert.match(css, /--testimonial-track-ease:\s*cubic-bezier\(\.65, 0, \.35, 1\)/);
  assert.match(css, /--testimonial-track-duration:\s*520ms/);
  assert.match(css, /transition:\s*transform var\(--testimonial-track-duration\) var\(--testimonial-track-ease\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("desktop navigation uses the exported Figma arrow pair at its authored geometry", () => {
  const arrowAsset = path.join(root, "Assets", "figma", "testimonial-arrow-figma.svg");
  assert.equal(fs.existsSync(arrowAsset), true);
  const arrowSvg = fs.readFileSync(arrowAsset, "utf8");
  assert.match(arrowSvg, /width="1111" height="62"/);
  assert.match(arrowSvg, /fill="#3E5526"/);
  assert.match(arrowSvg, /fill="#EFC072"/);
  assert.match(css, /background-image: url\("Assets\/figma\/testimonial-arrow-figma\.svg"\)/);
  assert.match(css, /top: 661px/);
  assert.match(css, /left: calc\(50% - 555\.5px\)/);
  assert.match(css, /right: calc\(50% - 555\.5px\)/);
});

test("only incoming testimonial content receives a direction-aware stagger", () => {
  assert.match(css, /testimonial-slide--entering/);
  assert.match(css, /--testimonial-entry-x/);
  assert.match(css, /animation-delay:\s*120ms/);
  assert.match(css, /animation-delay:\s*160ms/);
  assert.match(css, /animation-delay:\s*200ms/);
  assert.match(script, /testimonial-slide--entering/);
  assert.doesNotMatch(script, /testimonial-slide--leaving/);
});

test("touch navigation follows the finger and can cancel safely", () => {
  assert.match(script, /touchmove/);
  assert.match(script, /touchcancel/);
  assert.match(script, /event\.preventDefault\(\)/);
  assert.match(script, /transitionToken/);
  assert.match(css, /touch-action:\s*pan-y/);
});

test("reduced motion keeps only a short opacity fade", () => {
  assert.match(css, /@keyframes testimonial-reduced-fade/);
  assert.match(css, /testimonial-reduced-fade 90ms/);
});
