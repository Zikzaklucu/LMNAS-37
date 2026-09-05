"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pagesBase = "https://zikzaklucu.github.io/LMNAS-37/";
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const absolutizeCssUrls = (css, publicUrl) => css.replace(
  /url\((["'])([^"']+)\1\)/g,
  (match, quote, value) => {
    if (/^(?:https?:|data:|#)/i.test(value)) return match;
    return `url(${quote}${new URL(value, publicUrl).href}${quote})`;
  },
);

test("the deploy bundle mirrors the canonical shared stylesheet", () => {
  const canonical = read("style.css");
  const expectedShared = absolutizeCssUrls(canonical, `${pagesBase}style.css`);

  assert.equal(
    read("LMNas_Deployed/style.css"),
    `/* LMNAS 37 WordPress deploy bundle: local assets resolve through GitHub Pages. */\n${expectedShared}`,
  );
  assert.equal(
    read("LMNas_Deployed/faq/style.css"),
    `/* LMNAS 37 FAQ WordPress deploy CSS: shared styles followed by FAQ styles. */\n/* Inlined from ../style.css. */\n${expectedShared.trimEnd()}\n\n/* Inlined from faq/faq.css. */\n${absolutizeCssUrls(read("faq/faq.css"), `${pagesBase}faq/faq.css`)}`,
  );
  assert.equal(
    read("LMNas_Deployed/peraturan/style.css"),
    `/* LMNAS 37 Peraturan WordPress deploy CSS: shared styles followed by page styles. */\n/* Inlined from ../style.css. */\n${expectedShared.trimEnd()}\n\n/* Inlined from peraturan/peraturan.css. */\n${absolutizeCssUrls(read("peraturan/peraturan.css"), `${pagesBase}peraturan/peraturan.css`)}`,
  );
});

test("the deployed home page includes the approved hero flowers and registration video", () => {
  const deployed = read("LMNas_Deployed/index.html");

  assert.match(deployed, /<link rel="stylesheet" href="style\.css\?v=142" \/>/);
  assert.match(deployed, /<p class="hero-event-name">Lomba Matematika Nasional ke-37 Universitas Gadjah Mada<\/p>/);
  assert.match(
    deployed,
    /<div class="hero-cta">\s*<img class="hero-flowers" src="https:\/\/zikzaklucu\.github\.io\/LMNAS-37\/Assets\/figma\/hero-flowers\.svg"[^>]*>\s*<a class="figma-button"[^>]*>Daftar<\/a>\s*<\/div>/,
  );
  assert.match(
    deployed,
    /<iframe\s+src="https:\/\/www\.youtube-nocookie\.com\/embed\/_ruwWMc1S_w"\s+title="Video Alur Pendaftaran LMNAS 37"[^>]*allowfullscreen><\/iframe>/,
  );
  assert.match(
    deployed,
    /<a class="flow-details-link" href="https:\/\/drive\.google\.com\/file\/d\/1pYd8Sj2RYEzygERhh99JPcT_kCFOKEy8\/view\?usp=sharing" target="_blank" rel="noopener noreferrer">Untuk informasi selengkapnya, lihat di sini\.<\/a>/,
  );
  assert.doesNotMatch(deployed, /registration-video\.png/);
});

test("the deployed home page keeps registration and book content in sibling slides", () => {
  const deployed = read("LMNas_Deployed/index.html");
  const registrationStart = deployed.indexOf('<section class="registration-section" id="pendaftaran"');
  const bookStart = deployed.indexOf('<section class="book-section" id="buku-soal"');
  const contactStart = deployed.indexOf('<section class="contact-section" id="kontak"');
  const registration = deployed.slice(registrationStart, bookStart);
  const book = deployed.slice(bookStart, contactStart);

  assert.ok(registrationStart >= 0);
  assert.ok(bookStart > registrationStart);
  assert.ok(contactStart > bookStart);
  assert.match(registration, /id="pendaftaran"[\s\S]*data-registration-link/);
  assert.doesNotMatch(registration, /book-promo|book-covers/);
  assert.match(book, /class="book-promo"[\s\S]*class="book-covers"/);
  assert.equal((book.match(/class="book-store-link/g) || []).length, 4);
});

test("all deployed footers expose only the approved media partners", () => {
  for (const relativePath of [
    "LMNas_Deployed/index.html",
    "LMNas_Deployed/faq/index.html",
    "LMNas_Deployed/peraturan/index.html",
    "LMNas_Deployed/buku-panduan/index.html",
  ]) {
    const deployed = read(relativePath);
    const mediaStart = deployed.indexOf("footer-partner-group--media");
    const mediaEnd = deployed.indexOf('class="footer-socials"', mediaStart);
    const media = deployed.slice(mediaStart, mediaEnd);

    assert.equal((media.match(/class="footer-logo footer-logo--/g) || []).length, 2);
    assert.match(media, /alt="Jogja TV"[\s\S]*alt="Kotaperak 94\.6 FM"/);
    assert.doesNotMatch(media, /Ikut Event|Ikahimatika/);
  }
});

test("subpage deploy bundles cache-bust the refreshed shared stylesheet", () => {
  assert.match(read("LMNas_Deployed/faq/index.html"), /<link rel="stylesheet" href="style\.css\?v=20" \/>/);
  assert.match(read("LMNas_Deployed/peraturan/index.html"), /<link rel="stylesheet" href="style\.css\?v=22" \/>/);
});

test("the WordPress deploy bundle uses the confirmed WordPress route contract", () => {
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
  const routes = {
    "LMNas_Deployed/index.html": [
      "https://lmnas.fmipa.ugm.ac.id/bukupanduanlmnas37/",
      "https://lmnas.fmipa.ugm.ac.id/peraturan-lmnas-37/",
      "https://lmnas.fmipa.ugm.ac.id/faq-lmnas-37/",
    ],
    "LMNas_Deployed/faq/index.html": [
      "https://lmnas.fmipa.ugm.ac.id",
      "https://lmnas.fmipa.ugm.ac.id/bukupanduanlmnas37/",
      "https://lmnas.fmipa.ugm.ac.id/peraturan-lmnas-37/",
      "https://lmnas.fmipa.ugm.ac.id/faq-lmnas-37/",
    ],
    "LMNas_Deployed/peraturan/index.html": [
      "https://lmnas.fmipa.ugm.ac.id",
      "https://lmnas.fmipa.ugm.ac.id/bukupanduanlmnas37/",
      "https://lmnas.fmipa.ugm.ac.id/peraturan-lmnas-37/",
      "https://lmnas.fmipa.ugm.ac.id/faq-lmnas-37/",
    ],
    "LMNas_Deployed/buku-panduan/index.html": [
      "https://lmnas.fmipa.ugm.ac.id",
      "https://lmnas.fmipa.ugm.ac.id/bukupanduanlmnas37/",
      "https://lmnas.fmipa.ugm.ac.id/peraturan-lmnas-37/",
      "https://lmnas.fmipa.ugm.ac.id/faq-lmnas-37/",
    ],
  };

  for (const [file, fileRoutes] of Object.entries(routes)) {
    const page = read(file);
    for (const route of fileRoutes) {
      assert.match(page, new RegExp(`href="${escapeRegExp(route)}`));
    }
  }

  assert.match(
    read("LMNas_Deployed/faq/index.html"),
    /href="https:\/\/lmnas\.fmipa\.ugm\.ac\.id\/peraturan-lmnas-37\/">halaman peraturan Babak Penyisihan/,
  );
});

test("the deployed home page inlines the complete registration state machine", () => {
  const deployed = read("LMNas_Deployed/index.html");

  assert.match(deployed, /const resolveRegistrationPhase = \(now = new Date\(\), config = \{\}\) =>/);
  assert.match(deployed, /key: "BEFORE_WAVE_2"/);
  assert.match(deployed, /key: "REGISTRATION_CLOSED"/);
  assert.match(deployed, /countdown\.resolveRegistrationPhase\(now, config\)/);
  assert.match(deployed, /countdown-copy--active/);
  assert.match(deployed, /display\.style\.visibility = "hidden"/);
});

test("the deployed home page inlines the progressive Linimasa reveal", () => {
  const deployed = read("LMNas_Deployed/index.html");

  assert.match(deployed, /const initTimelineReveal = \(\) =>/);
  assert.match(deployed, /classList\.add\("timeline-motion-ready"\)/);
  assert.match(deployed, /classList\.add\("is-visible"\)/);
  assert.match(deployed, /observer\.unobserve\(entry\.target\)/);
});
