"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

test("all Daftar CTA buttons use the registration website", () => {
  const hrefs = [...html.matchAll(/<a class="figma-button" href="([^"]+)"[^>]*>Daftar<\/a>/g)]
    .map((match) => match[1]);

  assert.equal(hrefs.length, 2);
  assert.deepEqual(hrefs, [
    "https://pendaftaran.lmnas-ugm.com",
    "https://pendaftaran.lmnas-ugm.com",
  ]);
});

test("the skip link targets the main content landmark", () => {
  assert.match(html, /<a class="skip-link" href="#main-content">/);
  assert.match(html, /<main id="main-content">/);
});

test("published content does not contain placeholder lorem ipsum", () => {
  assert.doesNotMatch(html, /lorem ipsum/i);
});

test("the visible countdown heading matches its registration target", () => {
  assert.match(html, /<h2 id="countdown-title">Registrasi Gelombang I<\/h2>/);
});

test("the navigation exposes the four approved page destinations", () => {
  const desktopNavigation = html.match(/<nav\b[^>]*aria-label="Navigasi utama"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || "";

  assert.equal((desktopNavigation.match(/<a\b/g) || []).length, 4);
  assert.match(desktopNavigation, /<a href="#home">Home<\/a>/);
  assert.match(desktopNavigation, /<a href="buku-panduan\/">Buku Panduan<\/a>/);
  assert.match(desktopNavigation, /<a href="peraturan\/">Peraturan<\/a>/);
  assert.match(desktopNavigation, /<a href="faq\/">FAQ<\/a>/);
});

test("telephone links match the visible contact numbers", () => {
  const contacts = [...html.matchAll(/<a href="tel:([^"]+)">([^<]+)<\/a>/g)];

  assert.equal(contacts.length, 2);
  for (const [, destination, visible] of contacts) {
    const visibleDigits = visible.replace(/\D/g, "");
    const expectedDestination = `62${visibleDigits.slice(1)}`;
    assert.equal(destination.replace(/\D/g, ""), expectedDestination);
  }
});

test("long countdown and tablet timeline have responsive containment rules", () => {
  assert.match(css, /\.countdown-copy h2 \{[^}]*width: 1120px;[^}]*font-size: 100px;[^}]*line-height: 1\.15;/s);
  assert.match(css, /@media \(min-width: 561px\) and \(max-width: 1200px\) \{[^}]*\.timeline-list \.timeline-entry div \{ width: calc\(100% - 57px\); \}/s);
  assert.match(css, /@media \(min-width: 561px\) and \(max-width: 640px\) \{[^}]*\.timeline-board h2 \{[^}]*left: 50%;[^}]*width: calc\(100% - 32px\);[^}]*transform: translateX\(-50%\);/s);
});

test("header controls use a contrasting keyboard focus indicator", () => {
  assert.match(css, /\.site-header :focus-visible \{ outline-color: var\(--gold\); \}/);
});

test("the compact navbar keeps the logo left and Home right", () => {
  assert.match(css, /\.site-header \{[^}]*justify-content: flex-end;[^}]*height: 64px;[^}]*padding: 0 37px;[^}]*background: var\(--green\);/s);
  assert.match(html, /<a class="brand-mark" href="#home" aria-label="LMNAS 37">[\s\S]*?Assets\/figma\/nav-mark-216\.png/);
  assert.match(css, /\.brand-mark \{[^}]*width: 40px;[^}]*height: 41px;[^}]*flex: 0 0 auto;/s);
  assert.match(css, /\.site-header > nav \{[^}]*gap: 30px;[^}]*margin-left: auto;/s);
  assert.match(css, /\.site-header nav a \{[^}]*color: #fffdf2;/s);
  assert.match(css, /\.site-header nav a\[aria-current\] \{[^}]*color: var\(--gold\);[^}]*text-decoration: none;/s);
  assert.match(css, /\.site-header nav a:hover \{ color: var\(--gold\); \}/);
  assert.match(css, /@media \(max-width: 1332px\) \{[^}]*\.site-header \{[^}]*height: 56px;[^}]*padding: 0 18px;/s);
  assert.doesNotMatch(html, /class="(?:menu-toggle|mobile-nav|menu-backdrop)"/);
});

test("the prize card includes the complete Figma prize and promotion content", () => {
  assert.match(html, /<p class="prize-heading prize-heading--total">Total Hadiah<\/p>/);
  assert.match(html, /<p class="prize-amount">Rp38\.000\.000,00<\/p>/);
  assert.match(html, /\+ Medali, Sertifikat, dan Piala Bergilir/);
  assert.match(html, /Gratis Buku Soal dan Pembahasan LMNas 36/);
  assert.match(html, /Daftar 6, Bayar 5/);
  assert.match(html, /\*\* Berlaku kelipatan\./);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "Assets", "figma", "prize-book.svg")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "Assets", "figma", "prize-group.svg")), true);
});

test("the prize total groups the amount with its qualifier and separates Beserta", () => {
  assert.match(css, /\.prize-extras \{[^}]*top: 238px;/);
  assert.match(css, /\.prize-heading--second \{[^}]*top: 326px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.prize-extras \{[^}]*margin-top: 2px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.prize-heading--second \{[^}]*margin-top: 30px;/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*?\.prize-heading--second \{[^}]*margin-top: 24px;/);
});

test("the mobile prize heading keeps its centering transform anchored at 50 percent", () => {
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*?\.prize-section \.section-title \{[^}]*left: 50%;[^}]*width: calc\(100% - 24px\);/,
  );
});

test("the desktop prize card leaves room below the footnotes", () => {
  assert.match(css, /\.prize-section \{ height: 1637px;/);
  assert.match(css, /\.prize-card \{[^}]*height: 900px;/);
  assert.match(css, /\.prize-benefits small \{[^}]*padding-bottom: 18px;/);
});

test("the Kata Mereka section uses the Figma portrait and card geometry", () => {
  assert.match(html, /<h2 class="section-title" id="testimonial-title">Kata Mereka<\/h2>/);
  assert.match(css, /\.testimonial-section \.section-title \{[^}]*font-size: 128px;[^}]*letter-spacing: \.2em;/);
  assert.match(css, /\.testimonial-photo \{[^}]*top: 89px;[^}]*left: 106px;[^}]*width: 396px;[^}]*height: 448px;/);
  assert.match(css, /\.testimonial-card blockquote \{[^}]*width: 1085px;[^}]*height: 514px;[^}]*font-size: 38px;/);
});

test("the lower page includes the complete Figma section sequence", () => {
  const flowIndex = html.indexOf('id="alur"');
  const registrationIndex = html.indexOf('id="pendaftaran"');
  const bookIndex = html.indexOf('id="book-promo-title"');
  const contactIndex = html.indexOf('id="kontak"');
  const footerIndex = html.indexOf('<footer class="footer"');

  assert.ok(flowIndex < registrationIndex);
  assert.ok(registrationIndex < bookIndex);
  assert.ok(bookIndex < contactIndex);
  assert.ok(contactIndex < footerIndex);
  assert.match(html, /<span class="visually-hidden">Buku Pembahasan Soal LMNas 36<\/span>/);
  assert.match(html, /<span class="faq-label">Narahubung<\/span>/);
});

test("the footer follows the Home3 Figma frame rather than filling its approved placeholders", () => {
  assert.match(html, /class="footer-visual" src="Assets\/figma\/footer-panel-divider-home3\.png"/);
  assert.match(html, /class="footer-heading footer-heading--media">Media Partner<\/h2>/);
  assert.match(html, /class="footer-heading footer-heading--partner">Mitra<\/h2>/);
  assert.doesNotMatch(html, /Assets\/(?:sponsors|partners)\//);
  assert.match(css, /\.footer \{[^}]*background: #f3d275;[^}]*overflow: hidden;/);
  assert.match(css, /\.footer-stage \{[^}]*aspect-ratio: 2914 \/ 1125;/);
  assert.match(css, /\.footer-visual \{[^}]*object-fit: fill;/);
  assert.match(css, /\.footer-heading \{[^}]*top: 7\.5%;[^}]*font-family: var\(--display\);/);
  assert.match(css, /\.footer-socials-art \{[^}]*opacity: 1;/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.footer-heading \{[^}]*margin: 18px 0 0;/);
});

test("the lower-page Figma assets are present", () => {
  for (const asset of [
    "flow-heading-foliage.svg",
    "registration-tree.svg",
    "contact-tree.svg",
    "book-title-line-1.svg",
    "book-title-line-2.svg",
    "book-store-label.svg",
    "book-store-shopee.svg",
    "book-store-tokopedia.svg",
    "book-lmnas-blue.png",
    "book-lmnas-red.png",
    "footer-panel-divider-home3.png",
    "footer-socials-home3.svg",
  ]) {
    assert.equal(fs.existsSync(path.join(__dirname, "..", "Assets", "figma", asset)), true);
  }
});

test("the registration and contact sections use their own Figma tree compositions", () => {
  assert.match(html, /class="registration-tree" src="Assets\/figma\/registration-tree\.svg"/);
  assert.match(html, /class="contact-tree" src="Assets\/figma\/contact-tree\.svg"/);
  assert.doesNotMatch(html, /class="(?:registration|contact)-tree" src="Assets\/figma\/timeline-tree\.svg"/);
  assert.match(css, /\.registration-tree \{[^}]*top: -128px;[^}]*left: -151px;[^}]*width: 589px;/);
  assert.match(css, /\.contact-tree \{[^}]*top: 14px;[^}]*right: -302px;[^}]*width: 731px;/);
});

test("the book promotion uses the original Figma title, store, and cover geometry", () => {
  assert.match(html, /book-title-line-1\.svg/);
  assert.match(html, /book-title-line-2\.svg/);
  assert.match(html, /book-store-shopee\.svg/);
  assert.match(html, /book-store-tokopedia\.svg/);
  assert.match(html, /book-lmnas-blue\.png/);
  assert.match(html, /book-lmnas-red\.png/);
  assert.match(css, /\.book-promo \{[^}]*width: 1264px;[^}]*grid-template-columns: 733px 531px;[^}]*margin: 131px auto 0;/);
  assert.match(css, /\.book-covers img:first-child \{[^}]*left: 10px;[^}]*width: 470px;/);
  assert.doesNotMatch(css, /\.book-covers img \{[^}]*filter:/);
});

test("the book promotion links its marketplace artwork to the verified official stores", () => {
  assert.match(
    html,
    /<a href="https:\/\/shopee\.co\.id\/lmnasstore" target="_blank" rel="noopener noreferrer" aria-label="Beli buku pembahasan LMNas 36 di Shopee">[\s\S]*?book-store-shopee\.svg[\s\S]*?<\/a>/,
  );
  assert.match(
    html,
    /<a href="https:\/\/www\.tokopedia\.com\/lmnas-semnas" target="_blank" rel="noopener noreferrer" aria-label="Beli buku pembahasan LMNas 36 di Tokopedia">[\s\S]*?book-store-tokopedia\.svg[\s\S]*?<\/a>/,
  );
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*?\.book-stores a \{[^}]*min-height: 44px;/,
  );
});

test("the footer exposes every official channel as a safe external link", () => {
  for (const destination of [
    "https://www.facebook.com/lombamatematika/",
    "https://www.instagram.com/lmnas_semnas/",
    "https://x.com/lmnas_semnas",
    "https://www.tiktok.com/@lmnas_semnas",
    "https://www.youtube.com/@lmnas_semnas",
  ]) {
    const escaped = destination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      html,
      new RegExp(`<a href="${escaped}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>`),
    );
  }

  for (const label of [
    "Facebook LMNas dan Semnastika UGM",
    "Instagram LMNas dan Semnastika UGM",
    "X LMNas dan Semnastika UGM",
    "TikTok LMNas dan Semnastika UGM",
    "YouTube LMNas dan Semnastika UGM",
  ]) {
    assert.match(html, new RegExp(`aria-label="${label}"`));
  }
});

test("the book promotion stays contained across the tablet-to-desktop seam", () => {
  assert.match(
    css,
    /@media \(min-width: 1201px\) and \(max-width: 1332px\) \{[\s\S]*?\.book-promo \{[^}]*width: min\(100%, calc\(100vw - 160px\)\);[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(260px, 38%\);[^}]*transform: none;/,
  );
  assert.match(css, /\.registration-section \{[^}]*overflow-x: clip;[^}]*overflow-y: visible;/);
  assert.doesNotMatch(css, /\.registration-section \{[^}]*overflow: hidden;/);
});

test("long-page navigation exposes the current section accessibly", () => {
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

  assert.match(script, /IntersectionObserver/);
  assert.match(script, /setAttribute\("aria-current", "location"\)/);
  assert.match(css, /\.site-header nav a\[aria-current\]/);
});

test("below-fold images defer loading while hero artwork stays eager", () => {
  const hero = html.slice(html.indexOf('<section class="hero"'), html.indexOf('<section class="countdown-section"'));
  const belowFold = html.slice(html.indexOf('<section class="countdown-section"'));
  const heroImages = [...hero.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  const belowFoldImages = [...belowFold.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  assert.ok(heroImages.length > 0);
  assert.ok(belowFoldImages.length > 0);
  assert.ok(heroImages.every((image) => !/loading="lazy"/.test(image)));
  assert.ok(belowFoldImages.every((image) => /loading="lazy"/.test(image) && /decoding="async"/.test(image)));
});

test("the mobile testimonial frame uses intrinsic geometry instead of transform-only scaling", () => {
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*?\.testimonial-frame \{[^}]*width: min\(332px, calc\(100vw - 36px\)\);[^}]*height: auto;[^}]*aspect-ratio: 604 \/ 626;[^}]*transform: none;/,
  );
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*?\.testimonial-section \{[^}]*min-height: 0;/,
  );
});

test("a single testimonial does not expose decorative previous or next controls", () => {
  const testimonialName = html.match(/<div class="testimonial-name">([\s\S]*?)<\/div>/)?.[1] || "";

  assert.doesNotMatch(testimonialName, /[‹›]/);
  assert.doesNotMatch(testimonialName, /<span\b/);
});

test("first-load decorative assets use right-sized optimized files", () => {
  const optimizedAssets = [
    ["Assets/figma/paper-texture.webp", 2 * 1024 * 1024],
    ["Assets/figma/nav-mark-216.png", 250 * 1024],
    ["Assets/partners/jogja-tv-optimized.png", 250 * 1024],
    ["Assets/partners/ikut-event-optimized.png", 250 * 1024],
    ["Assets/partners/ikahimatika-optimized.png", 250 * 1024],
    ["Assets/partners/kotaperak-optimized.png", 250 * 1024],
  ];

  for (const [asset, maximumBytes] of optimizedAssets) {
    const absolutePath = path.join(__dirname, "..", asset);
    assert.equal(fs.existsSync(absolutePath), true, `${asset} should exist`);
    assert.ok(fs.statSync(absolutePath).size <= maximumBytes, `${asset} should be right-sized`);
  }

  assert.match(css, /--texture: url\("Assets\/figma\/paper-texture\.webp"\)/);
  assert.equal((html.match(/Assets\/figma\/nav-mark-216\.png/g) || []).length, 2);
  assert.doesNotMatch(html, /Assets\/partners\/(?:jogja-tv|ikut-event|ikahimatika-56586a|kotaperak)\.png/);
});

test("the removed mobile drawer leaves no dead interaction code", () => {
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

  assert.doesNotMatch(script, /\.menu-toggle|\.mobile-nav|\.menu-backdrop|menu-is-open/);
  assert.doesNotMatch(css, /\.menu-toggle|\.mobile-nav|\.menu-backdrop|menu-is-open/);
});

test("upcoming timeline badges use a high-contrast background", () => {
  assert.match(css, /\.timeline-status \{[^}]*color: #fff;[^}]*background: #8a5a17;/s);
  assert.doesNotMatch(css, /\.timeline-status \{[^}]*background: var\(--wood\);/s);
});

test("the Hadiah anchor belongs to the visible prize heading", () => {
  assert.match(html, /<section class="prize-section" aria-labelledby="hadiah">[\s\S]*?<h2 class="section-title" id="hadiah">Kenapa Layak Diikuti\?<\/h2>/);
  assert.match(css, /\.prize-section \.section-title \{[^}]*scroll-margin-top: 132px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.prize-section \.section-title \{[^}]*scroll-margin-top: 96px;/);
});

test("mobile testimonial copy stays readable and the contact panel names its purpose", () => {
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*?\.testimonial-card blockquote \{[^}]*font-size: 16px;[^}]*letter-spacing: \.02em;[^}]*line-height: 1\.45;[^}]*text-align: left;/,
  );
  assert.match(html, /<span class="faq-label">Narahubung<\/span>/);
  assert.doesNotMatch(html, /aria-label="FAQ">FAQ/);
});

test("published dates and registration links are hydrated from the site configuration", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "site-config.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const config = context.window.LMNAS_SITE_CONFIG;
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

  assert.equal(config.registration.url, "https://pendaftaran.lmnas-ugm.com");
  assert.equal(config.countdown.target, "2026-09-01T00:00:00+07:00");
  assert.deepEqual(Object.keys(config.phases), [
    "registration-one",
    "registration-two",
    "preliminary",
    "finals",
  ]);
  assert.match(html, /<script src="site-config\.js\?v=1" defer><\/script>/);
  assert.equal((html.match(/data-registration-link/g) || []).length, 2);
  assert.equal((html.match(/data-phase-key=/g) || []).length, 4);
  assert.match(script, /const config = window\.LMNAS_SITE_CONFIG/);
  assert.match(script, /document\.querySelectorAll\("\[data-registration-link\]"\)/);
  assert.match(script, /document\.querySelectorAll\("\[data-phase-key\]"\)/);
  assert.match(script, /const visibleDate = phase\.querySelector\("time"\)/);
  assert.match(script, /visibleDate\.dateTime = formattedDate\.datetime/);
  assert.match(script, /visibleDate\.textContent = formattedDate\.label/);
});

test("the page provides canonical and complete social-sharing metadata", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/lmnas\.fmipa\.ugm\.ac\.id\/" \/>/);
  assert.match(html, /<meta property="og:type" content="website" \/>/);
  assert.match(html, /<meta property="og:locale" content="id_ID" \/>/);
  assert.match(html, /<meta property="og:title" content="LMNAS 37 \/ Semnastika 18" \/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/zikzaklucu\.github\.io\/LMNAS-37\/Assets\/figma\/header-logo-bar\.png" \/>/);
  assert.match(html, /<meta property="og:image:width" content="933" \/>/);
  assert.match(html, /<meta property="og:image:height" content="218" \/>/);
  assert.match(html, /<meta property="og:image:alt" content="Logo Universitas Gadjah Mada, HIMATIKA, LMNAS 37, dan Semnastika 18" \/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/zikzaklucu\.github\.io\/LMNAS-37\/Assets\/figma\/header-logo-bar\.png" \/>/);
});

test("navigation and footer labels follow the approved copy and footer links meet touch-target guidance", () => {
  assert.equal((html.match(/<a href="#home">Home<\/a>/g) || []).length, 1);
  assert.doesNotMatch(html, /<a href="#home">Beranda<\/a>/);
  assert.match(html, /<h2 class="footer-heading footer-heading--media">Media Partner<\/h2>/);
  assert.match(html, /<h2 class="footer-heading footer-heading--partner">Mitra<\/h2>/);
  assert.match(css, /\.footer-social \{[^}]*min-height: 44px;/);
});

test("the registration-flow panel shows the original in-progress video artwork", () => {
  assert.match(
    html,
    /<figure class="video-card">\s*<img src="Assets\/figma\/registration-video\.png" alt="Video alur pendaftaran LMNAS 37" loading="lazy" decoding="async" \/>\s*<\/figure>/,
  );
  assert.doesNotMatch(html, /<a class="video-card"/);
  assert.match(css, /\.video-card \{[^}]*background: #000;/);
  assert.match(css, /\.video-card img \{[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover;/);
  assert.match(css, /\.flow-section \.section-title \{[^}]*margin: 0 auto 34px;/);
  assert.match(css, /\.flow-heading-art \{[^}]*top: 84px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.flow-section \.section-title \{[^}]*margin-bottom: 48px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.flow-heading-art \{[^}]*top: 80px;/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*?\.flow-section \.section-title \{[^}]*margin-bottom: 40px;/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*?\.flow-heading-art \{[^}]*top: 58px;/);
  assert.doesNotMatch(css, /\.video-card__(?:content|eyebrow|copy|action)/);
});

test("the footer keeps the empty Figma partner regions as approved placeholders", () => {
  assert.doesNotMatch(html, /BSM Rental|Imperial Digital Printing|Jogja TV|Ikut Event|Ikahimatika|Kotaperak/);
  assert.doesNotMatch(html, /class="(?:sponsors|partner-logos)"/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.footer-placeholders \{[^}]*grid-template-columns: 1fr 1fr;/);
});
