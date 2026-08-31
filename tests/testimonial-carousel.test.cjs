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
  "testimonial-janssen-20f486.png",
];

test("the testimonial carousel exposes four semantic slides and controls", () => {
  assert.equal((html.match(/data-carousel-slide/g) || []).length, 4);
  assert.equal((html.match(/data-carousel-dot=/g) || []).length, 4);
  assert.match(html, /data-carousel-prev aria-label="Testimoni sebelumnya"/);
  assert.match(html, /data-carousel-next aria-label="Testimoni berikutnya"/);
  assert.match(html, /role="region" aria-roledescription="carousel"/);
});

test("every winner has a distinct local portrait", () => {
  for (const photo of photos) {
    assert.match(script, new RegExp(`Assets/figma/${photo.replaceAll(".", "\\.")}`));
    assert.equal(fs.existsSync(path.join(root, "Assets", "figma", photo)), true);
  }
  assert.equal(new Set(photos).size, 4);
});

test("the four Figma testimonials are present without invented replacement copy", () => {
  assert.match(script, /Assalamualaikum warahmatullahi wabarakatuh/);
  assert.match(script, /Perkenalkan, nama saya Rama Maheswara Pradnya Kusala dari SMP Negeri 1 Boyolali/);
  assert.match(script, /Halo semuanya, nama aku Jeremy Manuelle Gading/);
  assert.match(script, /name: "Janssen Samuel Halim"/);
  assert.match(script, /placement: "Peraih Medali Perunggu LMNas 36 tingkat SMA"/);
  assert.match(script, /placement: "Juara 1 LMNas 36 tingkat SMP"/);
  assert.match(script, /placement: "Peraih Medali Perak LMNas 36 tingkat SMP"/);
  assert.match(script, /placement: "Juara 1 LMNas 36 tingkat SMA"/);
  assert.equal((script.match(/name: "Janssen Samuel Halim"/g) || []).length, 1);
  assert.match(script, /Halo semuanya, perkenalkan nama saya Janssen Samuel Halim sebagai juara 1 LMNas UGM yang ke-36\. Kesan saya saat mengikuti LMNas UGM adalah setiap soal yang disajikan, baik dari babak penyisihan, semifinal, final, juga grand final, sangat berkualitas, menarik dan menantang untuk saya kerjakan, dan sangat menyenangkan untuk saya diskusikan dengan teman-teman saya\. Setiap Panitia LMNas juga sangat berusaha keras dan juga dengan baik memenuhi segala kebutuhan peserta LMNas UGM\. Pesan saya untuk setiap peserta LMNas UGM tahun ini adalah persiapkan diri dengan baik, belajar dengan giat, raihlah prestasi yang terbaik, dan jangan lupa berdoa\. Terima kasih\./);
  assert.doesNotMatch(script, /Kompetisi ini menjadi pengalaman berharga untuk terus belajar/);
  assert.doesNotMatch(script, /LMNas memberi saya kesempatan untuk menguji kemampuan/);
});

test("all testimonial body copy uses one shared responsive typography rule", () => {
  assert.match(script, /<blockquote class="testimonial-copy">\$\{item\.quote\}<\/blockquote>/);
  assert.doesNotMatch(script, /quoteSize/);
  assert.doesNotMatch(script, /testimonial-quote-size/);
  assert.match(css, /\.testimonial-copy \{[^}]*font-family: var\(--body\);[^}]*font-size: 27px;[^}]*font-weight: 500;[^}]*letter-spacing: \.05em;[^}]*line-height: 1\.2;/);
  assert.match(css, /\.testimonial-copy \{[^}]*padding: 28px 132px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.testimonial-copy \{[^}]*font-size: clamp\(18px, 2\.2vw, 27px\);/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*?\.testimonial-copy \{[^}]*font-size: 16px;[^}]*line-height: 1\.48;[^}]*text-align: left;/);
  assert.doesNotMatch(css, /\.testimonial-slide:nth-child\(\d+\)[^}]*testimonial-copy/);
  assert.doesNotMatch(css, /\.testimonial-card blockquote/);
});

test("the testimonial card uses the original Home3 cream, green, and black treatment", () => {
  const figmaStates = css.slice(css.indexOf("/* Figma testimonial states"));
  const cardRule = figmaStates.match(/\.testimonial-copy \{([\s\S]*?)\n\}/)?.[1] || "";
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

test("narrow testimonial controls preserve touch targets without flex shrink", () => {
  assert.match(
    css,
    /@media \(max-width: 360px\) \{[\s\S]*?\.testimonial-controls \{ gap: 4px; \}[\s\S]*?\.testimonial-arrow \{[^}]*width: 44px;[^}]*height: 44px;[^}]*flex: 0 0 44px;[^}]*background-size: 788\.45px 44px;[\s\S]*?\.testimonial-dots \{ gap: 4px; \}/,
  );
});

test("the carousel uses the Figma testimonial color, type, and motion treatment", () => {
  assert.match(css, /--testimonial-track-ease:\s*cubic-bezier\(\.65, 0, \.35, 1\)/);
  assert.match(css, /--testimonial-track-duration:\s*520ms/);
  assert.match(css, /transition:\s*transform var\(--testimonial-track-duration\) var\(--testimonial-track-ease\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("desktop navigation uses the exported Figma arrow pair beside the media frame", () => {
  const arrowAsset = path.join(root, "Assets", "figma", "testimonial-arrow-figma.svg");
  assert.equal(fs.existsSync(arrowAsset), true);
  const arrowSvg = fs.readFileSync(arrowAsset, "utf8");
  assert.match(arrowSvg, /width="1111" height="62"/);
  assert.match(arrowSvg, /fill="#3E5526"/);
  assert.match(arrowSvg, /fill="#EFC072"/);
  assert.match(css, /background-image: url\("Assets\/figma\/testimonial-arrow-figma\.svg"\)/);
  assert.match(css, /position: absolute;[\s\S]*?top: 287px;/);
  assert.doesNotMatch(css, /top: 661px/);
  assert.match(css, /left: calc\(50% - 555\.5px\)/);
  assert.match(css, /right: calc\(50% - 555\.5px\)/);
  assert.match(css, /\.testimonial-arrow \{[\s\S]*?width: 52px;[\s\S]*?height: 52px;[\s\S]*?background-size: 931\.81px 52px;/);
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

test("testimonial height follows the active slide instead of clipping at a fixed section height", () => {
  assert.match(css, /\.testimonial-section \{ height: auto; min-height: 0;[^}]*overflow-x: clip; overflow-y: visible;/);
  assert.match(css, /\.testimonial-copy \{[^}]*height: auto;[^}]*min-height: 0;/);
  assert.doesNotMatch(css, /\.testimonial-copy \{[^}]*min-height: 514px;/);
  assert.match(css, /\.testimonial-viewport \{ width: 100%; overflow-x: clip; overflow-y: visible;/);
  assert.match(script, /const syncHeight = \(\) =>/);
  assert.match(script, /viewport\.style\.height = ""/);
  assert.match(script, /track\.style\.height = ""/);
  assert.match(script, /const height = activeSlide\.scrollHeight/);
  assert.match(script, /viewport\.style\.height = `\$\{height\}px`/);
  assert.match(script, /track\.style\.height = `\$\{height\}px`/);
  assert.match(script, /new ResizeObserver\(syncHeight\)/);
  assert.match(script, /document\.fonts\?\.ready\.then\(syncHeight\)/);
  assert.match(script, /window\.addEventListener\("resize", syncHeight/);
});
