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

  assert.deepEqual(labels(mainNavigation), ["Home", "Daftar", "Buku Panduan", "Silabus", "Peraturan", "FAQ", "SMP Contact Person", "SMA Contact Person"]);
  assert.deepEqual(labels(guideNavigation), ["Home", "Daftar", "Buku Panduan", "Silabus", "Peraturan", "FAQ", "SMP Contact Person", "SMA Contact Person"]);
  assert.match(mainNavigation, /href="https:\/\/pendaftaran\.lmnas-ugm\.com"[^>]*>Daftar/);
  assert.match(guideNavigation, /href="https:\/\/pendaftaran\.lmnas-ugm\.com"[^>]*>Daftar/);
  assert.match(guideNavigation, /<button type="button" class="nav-contact-toggle" aria-expanded="false" aria-controls="nav-contact-menu">Contact<\/button>/);
  assert.match(guideNavigation, /href="https:\/\/wa\.me\/6285113291516"[^>]*>SMP Contact Person/);
  assert.match(guideNavigation, /href="https:\/\/wa\.me\/6285173085634"[^>]*>SMA Contact Person/);
  assert.match(css, /--green: #3e5626;/);
  assert.match(css, /\.nav-contact-menu \{[\s\S]*?background: var\(--green\);[\s\S]*?\}/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.site-header\[data-nav-ready\] \.nav-toggle \{[\s\S]*?background: var\(--green\);[\s\S]*?\.site-header > nav \{[\s\S]*?background: var\(--green\);/);
  assert.match(mainNavigation, /href="buku-panduan\/"[^>]*>Buku Panduan/);
  assert.match(mainNavigation, /href="https:\/\/drive\.google\.com\/drive\/folders\/1imqxenO6Xh_K6TGj5i14sCKNBGKQ0Jho\?usp=sharing" target="_blank" rel="noopener noreferrer">Silabus/);
  assert.match(guideNavigation, /href="https:\/\/drive\.google\.com\/drive\/folders\/1imqxenO6Xh_K6TGj5i14sCKNBGKQ0Jho\?usp=sharing" target="_blank" rel="noopener noreferrer">Silabus/);
  assert.match(guideNavigation, /href="\.\/"[^>]*aria-current="page"[^>]*>Buku Panduan/);
  assert.match(guideNavigation, /href="\.\.\/index\.html#home"[^>]*>Home/);
  assert.match(guideNavigation, /href="\.\.\/peraturan\/"[^>]*>Peraturan/);
  assert.match(guideNavigation, /href="\.\.\/faq\/"[^>]*>FAQ/);
  assert.doesNotMatch(guideNavigation, /nav-placeholder|aria-disabled/);
  assert.match(css, /--header-height:\s*64px/);
  assert.match(css, /\.site-header\s*\{[^}]*position:\s*sticky;[^}]*justify-content:\s*flex-end;[^}]*height:\s*64px;[^}]*padding:\s*0 37px/s);
  assert.match(css, /\.site-header > nav\s*\{[^}]*gap:\s*30px;[^}]*margin-left:\s*auto/s);
  assert.match(css, /\.site-header nav a\s*\{[^}]*display:\s*inline-flex;[^}]*min-height:\s*44px;[^}]*align-items:\s*center/s);
});

test("the guide shell contains the Figma title and filled partner footer", () => {
  const html = fs.readFileSync(htmlPath, "utf8");

  assert.match(html, /<h1[^>]*>Buku Panduan<\/h1>/);
  assert.doesNotMatch(html, /class="guide-kicker"|class="guide-intro"/);
  assert.match(html, /class="footer-visual"[^>]+footer-panel-divider-home3\.png/);
  assert.match(html, /class="footer-partner-group footer-partner-group--media"/);
  assert.match(html, /class="footer-partner-group footer-partner-group--mitra"/);
  assert.match(html, />Media Partner<\/h2>/);
  assert.match(html, />Mitra<\/h2>/);
  assert.equal((html.match(/class="footer-logo footer-logo--/g) || []).length, 11);
  assert.doesNotMatch(html, /footer-logo--ikut-event|footer-logo--ikahimatika|alt="Ikut Event"|alt="Ikahimatika"/);
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
    ".footer-partners",
    ".footer-partners::after",
    ".footer-partner-group",
    ".footer-heading",
    ".footer-heading--media",
    ".footer-heading--partner",
    ".footer-logo-list",
    ".footer-logo",
    ".footer-logo img",
    ".footer-logo--standard",
    ".footer-logo--bsm",
    ".footer-logo--mic",
    ".footer-logo--taman-batik",
    ".footer-logo--raden",
    ".footer-logo--wisma",
    ".footer-logo--imperial",
    ".footer-logo--jogja-tv",
    ".footer-logo--ikut-event",
    ".footer-logo--ikahimatika",
    ".footer-logo--kotaperak",
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

test("the guide CTA opens the complete PDF in Google Drive", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  const css = fs.readFileSync(cssPath, "utf8");

  assert.match(html, /<a class="reader-zoom"[^>]*href="https:\/\/drive\.google\.com\/file\/d\/10vxgSd67hemwKveXq0G0r_a7N6KTRuzf\/view\?usp=sharing"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Buka Buku Panduan lengkap">[\s\S]*?<\/a>/);
  assert.doesNotMatch(html, /reader-zoom[^>]*data-zoom/);
  assert.doesNotMatch(html, /href="assets\/pages\/page-01\.webp"[^>]*target="_blank"/);
  assert.match(html, /<div class="book-anchor">[\s\S]*<a class="reader-zoom"/);
  assert.match(css, /\.book-anchor \{[\s\S]*?position: absolute;[\s\S]*?width: min\(1340px, calc\(100% - 100px\)\);[\s\S]*?aspect-ratio: 1190 \/ 842;[\s\S]*?transform: translateX\(-50%\);/);
  assert.match(css, /\.reader-zoom \{[\s\S]*?position: absolute;[\s\S]*?top: 24px;[\s\S]*?right: 24px;[\s\S]*?left: auto;[\s\S]*?width: 56px;[\s\S]*?height: 56px;/);
  assert.match(css, /\.book-anchor:has\(\.book\.is-closed-front\) \.reader-zoom \{\s*right: calc\(14\.92537% \+ 24px\);\s*\}/);
  assert.match(css, /\.reader-zoom \{[\s\S]*?transition: transform 400ms cubic-bezier\(\.22, 1, \.36, 1\);/);
  assert.match(css, /\.reader-zoom:hover,\s*\.reader-zoom:focus-visible\s*\{[\s\S]*?background: var\(--gold\);/);
  assert.doesNotMatch(css, /\.reader-zoom:hover[^}]*transform:|\.reader-zoom:active[^}]*transform:/s);
  assert.match(css, /@media \(max-width: 700px\) \{[\s\S]*?\.book-anchor \{[\s\S]*?position: relative;[\s\S]*?width: 100%;[\s\S]*?aspect-ratio: auto;[\s\S]*?\.reader-zoom \{[\s\S]*?top: 10px;[\s\S]*?right: max\(10px, calc\(\(100% - min\(100%, 595px\)\) \/ 2 \+ 10px\)\);[\s\S]*?left: auto;[\s\S]*?\.reader-zoom \{[\s\S]*?width: 52px;[\s\S]*?height: 52px;/);
  assert.match(css, /\.reader-zoom:focus-visible/);
  assert.match(css, /\.reader-control,\s*\.reader-zoom\s*\{[\s\S]*?transition: none;/);
});

test("book navigation retains the original page-flip timing and stack flow", () => {
  const css = fs.readFileSync(cssPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(css, /\.book-anchor \{[\s\S]*?transform: translateX\(-50%\);/);
  assert.doesNotMatch(css, /\.book-anchor[^}]*transition:/s);
  assert.doesNotMatch(css, /\.book-anchor\.is-transitioning-/);
  assert.match(css, /\.book\s*\{[\s\S]*?transition: transform 720ms cubic-bezier\(0\.65, 0, 0\.35, 1\);/);
  assert.match(css, /\.paper\s*\{[\s\S]*?transition: transform 720ms cubic-bezier\(0\.65, 0, 0\.35, 1\);/);
  assert.match(script, /paper\.style\.zIndex = String\(flipped \? index \+ 1 : papers\.length - index\);/);
  assert.doesNotMatch(script, /transitionFrame|transitionStackingZIndex|activeStackingTransition|handlePaperTransitionEnd|is-transitioning-/);
});

test("the PDF control keeps its fixed destination while following the visible book", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(html, /<script src="script\.js\?v=4" defer><\/script>/);
  assert.match(script, /const zoomLink = document\.querySelector\("\.reader-zoom"\);/);
  assert.match(script, /function getVisibleBookBounds\(mode, root = book\)/);
  assert.match(script, /function measureBookBounds\(range, mode\)/);
  assert.match(script, /book\.cloneNode\(true\)/);
  assert.match(script, /function animateZoomButton\(previousRect, position, mode\)/);
  assert.match(script, /zoomLink\.getBoundingClientRect\(\)/);
  assert.match(script, /zoomLink\.style\.transform = `translate\(\$\{deltaX\}px, \$\{deltaY\}px\)`/);
  assert.match(script, /zoomAnimationFrame = requestAnimationFrame\(\(\) => \{/);
  assert.match(script, /cancelAnimationFrame\(zoomAnimationFrame\)/);
  assert.match(script, /window\.addEventListener\("resize"/);
  assert.doesNotMatch(script, /zoomLink\.href\s*=|zoomLink\.setAttribute\("aria-label"/);
  assert.doesNotMatch(script, /document\.querySelector\("\[data-zoom\]"\)/);
  assert.doesNotMatch(script, /current\.src/);
});

test("desktop page flips do not use transition-time stacking diagnostics", () => {
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.doesNotMatch(script, /activeStackingTransition|transitionStackingZIndex|handlePaperTransitionEnd|transitionend/);
  assert.doesNotMatch(script, /style\.zIndex = String\(transition/);
});

test("mobile page artwork commits only after cached image readiness", () => {
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(script, /const preparedImages = new Map\(\);/);
  assert.match(script, /function prepareImage\(src\)/);
  assert.match(script, /image\.addEventListener\("load", decodeIfReady/);
  assert.match(script, /image\.addEventListener\("error", \(\) => finish\(false\)/);
  assert.match(script, /image\.decode\(\)/);
  assert.match(script, /function commitMobilePage\(page, version\)/);
  assert.match(script, /if \(!loaded \|\| version !== navigationVersion\) return;/);
  assert.match(script, /mobileImage\.src = page\.src;/);
  assert.match(script, /function preloadAdjacentPages\(page, mode\)/);
  assert.match(script, /preloadAdjacentPages\(currentPage, mode\);/);
  assert.doesNotMatch(script, /mobileImage\.src = current\.src;/);
});

test("the page counter stays in sentence case for initial and dynamic states", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  const css = fs.readFileSync(cssPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(html, /<p class="reader-status"[^>]*>Halaman 1 dari 13<\/p>/);
  assert.match(script, /status\.textContent = `Halaman \$\{currentPage\} dari \$\{PAGES\.length\}`;/);
  assert.doesNotMatch(css, /\.reader-status[^}]*text-transform:\s*uppercase/i);
  assert.doesNotMatch(html, /HALAMAN 1 DARI 13/);
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
