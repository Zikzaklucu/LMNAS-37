"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "buku-panduan");
const htmlPath = path.join(root, "index.html");
const cssPath = path.join(root, "style.css");
const scriptPath = path.join(root, "script.js");

test("all thirteen Figma guide exports are optimized for local delivery", () => {
  const pagesDirectory = path.join(root, "assets", "pages");
  const files = fs.readdirSync(pagesDirectory)
    .filter((file) => /^page-\d{2}\.webp$/.test(file))
    .sort();

  assert.deepEqual(files, Array.from({ length: 13 }, (_, index) => `page-${String(index + 1).padStart(2, "0")}.webp`));
  let totalBytes = 0;
  for (const file of files) {
    const bytes = fs.statSync(path.join(pagesDirectory, file)).size;
    totalBytes += bytes;
    assert.ok(bytes < 700 * 1024, `${file} should remain below 700 KiB`);
  }
  assert.ok(totalBytes < 8 * 1024 * 1024, "the thirteen-page guide should remain below 8 MiB");
  assert.equal(fs.readdirSync(pagesDirectory).some((file) => file.endsWith(".png")), false);
});

test("the local page has semantic manual flipbook controls and no autoplay", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(html, /<html lang="id">/);
  assert.match(html, /<main\b[^>]*id="main-content"/);
  assert.match(html, /<button[^>]+data-direction="previous"[^>]+aria-label="Halaman sebelumnya"/);
  assert.match(html, /<button[^>]+data-direction="next"[^>]+aria-label="Halaman berikutnya"/);
  assert.match(html, /class="reader-status"[^>]+aria-live="polite"/);
  assert.match(html, /class="book-stage"/);
  assert.match(html, /class="mobile-page"/);
  assert.doesNotMatch(script, /setInterval|autoplay/i);
});

test("the guide uses the same compact navigation as the main page", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  const mainHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const css = fs.readFileSync(cssPath, "utf8");
  const guideNavigation = html.match(/<nav\b[^>]*aria-label="Navigasi utama"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || "";
  const mainNavigation = mainHtml.match(/<nav\b[^>]*aria-label="Navigasi utama"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || "";
  const labels = (navigation) => [...navigation.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());

  assert.deepEqual(labels(mainNavigation), ["Home", "Buku Panduan", "Peraturan", "FAQ"]);
  assert.deepEqual(labels(guideNavigation), ["Home", "Buku Panduan", "Peraturan", "FAQ"]);
  assert.match(mainNavigation, /href="buku-panduan\/"[^>]*>Buku Panduan/);
  assert.match(guideNavigation, /href="\.\/"[^>]*aria-current="page"[^>]*>Buku Panduan/);
  assert.match(guideNavigation, /href="\.\.\/index\.html#home"[^>]*>Home/);
  assert.match(guideNavigation, /href="\.\.\/peraturan\/"[^>]*>Peraturan/);
  assert.match(guideNavigation, /href="\.\.\/faq\/"[^>]*>FAQ/);
  assert.doesNotMatch(guideNavigation, /nav-placeholder|aria-disabled/);
  assert.match(css, /--header-height:\s*64px/);
  assert.match(css, /\.site-header\s*\{[^}]*position:\s*sticky;[^}]*justify-content:\s*flex-end;[^}]*height:\s*64px;[^}]*padding:\s*0 37px/s);
  assert.match(css, /\.site-header > nav\s*\{[^}]*gap:\s*30px;[^}]*margin-left:\s*auto/s);
});

test("the guide shell contains the Figma title and approved footer composition", () => {
  const html = fs.readFileSync(htmlPath, "utf8");

  assert.match(html, /<h1[^>]*>Buku Panduan<\/h1>/);
  assert.doesNotMatch(html, /class="guide-kicker"|class="guide-intro"/);
  assert.match(html, /class="footer-visual"[^>]+footer-panel-divider-home3\.png/);
  assert.match(html, /class="footer-placeholder footer-placeholder--media"/);
  assert.match(html, /class="footer-placeholder footer-placeholder--partner"/);
  assert.match(html, />Media Partner<\/h2>/);
  assert.match(html, />Mitra<\/h2>/);
  assert.match(html, /class="footer-socials"/);
});

test("the guide footer reuses the main-page footer composition exactly", () => {
  const mainHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const guideHtml = fs.readFileSync(htmlPath, "utf8");
  const mainCss = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");
  const guideCss = fs.readFileSync(cssPath, "utf8");
  const footerMarkup = (html) => html.match(/<footer\b[\s\S]*?<\/footer>/)[0]
    .replace(/guide-footer/g, "footer")
    .replace(/\.\.\/Assets/g, "Assets")
    .replace(/\s+/g, " ")
    .trim();
  const declarations = (css, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [...css.matchAll(new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^}]*)\\}`, "g"))]
      .map((match) => match[1]
        .replace(/\.\.\//g, "")
        .replace(/\s+/g, "")
        .split(";")
        .filter(Boolean)
        .sort()
        .join(";"));
  };

  assert.equal(footerMarkup(guideHtml), footerMarkup(mainHtml));
  assert.deepEqual(declarations(guideCss, ".guide-footer"), declarations(mainCss, ".footer"));

  for (const selector of [
    ".footer-stage",
    ".footer-visual",
    ".footer-placeholders",
    ".footer-placeholders::after",
    ".footer-placeholder",
    ".footer-heading",
    ".footer-heading--media",
    ".footer-heading--partner",
    ".footer-socials",
    ".footer-socials-art",
    ".footer-social",
    ".footer-social span",
    ".footer-social:hover",
    ".footer-social--facebook",
    ".footer-social--instagram",
    ".footer-social--youtube",
    ".footer-social--x",
    ".footer-social--tiktok",
    ".footer-social::before",
    ".footer-social--facebook::before",
    ".footer-social--instagram::before",
    ".footer-social--youtube::before",
    ".footer-social--x::before",
    ".footer-social--tiktok::before",
  ]) {
    assert.deepEqual(declarations(guideCss, selector), declarations(mainCss, selector), selector);
  }
});

test("the guide manifest follows the supplied Figma order", () => {
  const guide = require(scriptPath);

  assert.equal(guide.PAGES.length, 13);
  assert.deepEqual(guide.PAGES.map((page) => page.src), Array.from(
    { length: 13 },
    (_, index) => `assets/pages/page-${String(index + 1).padStart(2, "0")}.webp`,
  ));
  assert.ok(guide.PAGES.every((page) => page.width === 1190 && page.height === 1684));
  assert.equal(guide.PAGES[0].label, "Sampul Buku Panduan LMNas 37");
  assert.equal(guide.PAGES[12].label, "Sampul belakang LMNas 37");
});

test("desktop spread navigation preserves all thirteen pages in book order", () => {
  const guide = require(scriptPath);

  assert.deepEqual(guide.getVisibleRange(1, "spread"), { start: 1, end: 1, spread: 0 });
  assert.deepEqual(guide.getVisibleRange(2, "spread"), { start: 2, end: 3, spread: 1 });
  assert.deepEqual(guide.getVisibleRange(13, "spread"), { start: 12, end: 13, spread: 6 });

  assert.equal(guide.getAdjacentPage(1, "next", "spread"), 2);
  assert.equal(guide.getAdjacentPage(2, "next", "spread"), 4);
  assert.equal(guide.getAdjacentPage(13, "next", "spread"), 13);
  assert.equal(guide.getAdjacentPage(12, "previous", "spread"), 10);
  assert.equal(guide.getAdjacentPage(2, "previous", "spread"), 1);
});

test("mobile navigation advances one design at a time and clamps endpoints", () => {
  const guide = require(scriptPath);

  assert.deepEqual(guide.getVisibleRange(7, "single"), { start: 7, end: 7, spread: 3 });
  assert.equal(guide.getAdjacentPage(1, "previous", "single"), 1);
  assert.equal(guide.getAdjacentPage(1, "next", "single"), 2);
  assert.equal(guide.getAdjacentPage(13, "next", "single"), 13);
});

test("the stylesheet protects fidelity, focus visibility, and reduced motion", () => {
  const css = fs.readFileSync(cssPath, "utf8");

  assert.match(css, /aspect-ratio:\s*595\s*\/\s*842/);
  assert.match(css, /\.reader-control:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.doesNotMatch(css, /\.(?:page-face img|mobile-page)\s*\{[^}]*object-fit:\s*fill/s);
});

test("desktop page artwork has a compositor-safe paint layer", () => {
  const css = fs.readFileSync(cssPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(script, /face\.style\.backgroundImage\s*=\s*`url\("\$\{page\.src\}"\)`/);
  assert.match(css, /\.page-face\s*\{[^}]*background-position:\s*center[^}]*background-repeat:\s*no-repeat[^}]*background-size:\s*contain/s);
  assert.match(css, /\.page-face img\s*\{[^}]*opacity:\s*0/s);
});

test("the desktop shell encodes the measured 1440px Figma geometry", () => {
  const css = fs.readFileSync(cssPath, "utf8");

  assert.match(css, /--canvas:\s*#f3d275/i);
  assert.match(css, /--header-height:\s*64px/);
  assert.match(css, /--cover-width:\s*939px/);
  assert.match(css, /--cover-height:\s*1329px/);
  assert.match(css, /--footer-start:\s*2657px/);
  assert.match(css, /\.site-header\s*\{[^}]*height:\s*64px/s);
  assert.match(css, /\.guide-heading\s*\{[^}]*top:\s*228px/s);
  assert.match(css, /\.reader\s*\{[^}]*top:\s*652px/s);
  assert.match(css, /\.guide-heading h1\s*\{[^}]*font-size:\s*150px/s);
  assert.match(css, /\.book\.is-closed-front\s*\{[^}]*--book-scale:\s*1\.40149/s);
  assert.match(css, /\.footer-stage\s*\{[^}]*aspect-ratio:\s*2914\s*\/\s*1125/s);
  assert.doesNotMatch(css, /\.guide-heading h1\s*\{[^}]*text-shadow/s);
});
