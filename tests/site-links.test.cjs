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

test("the registration CTA preserves the approved mixed-case copy", () => {
  assert.match(html, /<p class="registration-kicker">Tunggu Apa Lagi\?<\/p>/);
  assert.doesNotMatch(css, /\.registration-kicker[^}]*text-transform:\s*uppercase/);
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

test("the countdown kicker preserves the approved sentence case", () => {
  assert.match(html, /<p class="section-kicker">Menuju<\/p>/);
  assert.doesNotMatch(html, /<p class="section-kicker">MENUJU<\/p>/);
  assert.doesNotMatch(css, /\.countdown-copy \.section-kicker \{[^}]*text-transform:\s*uppercase/);
});

test("the countdown exposes four paired lowercase unit labels", () => {
  const countdown = html.slice(html.indexOf('<section class="countdown-section"'), html.indexOf('<section class="why-section"'));
  assert.deepEqual([...countdown.matchAll(/data-countdown-part="([^"]+)"[^>]*>[^<]*<\/span><span class="countdown-unit-label" aria-hidden="true">([^<]+)<\/span>/g)].map(([, part, label]) => [part, label]), [
    ["days", "hari"],
    ["hours", "jam"],
    ["minutes", "menit"],
    ["seconds", "detik"],
  ]);
  assert.match(css, /\.countdown-value \{ display: grid; grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.countdown-value \{ width: calc\(100% - 24px\); gap: 4px;/);
  assert.match(css, /\.countdown-unit-label \{[^}]*font-family: var\(--body\);[^}]*font-size: 18px;/);
  assert.doesNotMatch(css, /\.countdown-unit-label \{[^}]*text-transform:\s*uppercase/);
});

test("the navigation exposes the five approved page destinations", () => {
  const desktopNavigation = html.match(/<nav\b[^>]*aria-label="Navigasi utama"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || "";

  assert.equal((desktopNavigation.match(/<a\b/g) || []).length, 5);
  assert.match(desktopNavigation, /<a href="#home">Home<\/a>/);
  assert.match(desktopNavigation, /<a href="buku-panduan\/">Buku Panduan<\/a>/);
  assert.match(desktopNavigation, /<a href="https:\/\/drive\.google\.com\/drive\/folders\/1imqxenO6Xh_K6TGj5i14sCKNBGKQ0Jho\?usp=sharing" target="_blank" rel="noopener noreferrer">Silabus<\/a>/);
  assert.match(desktopNavigation, /<a href="peraturan\/">Peraturan<\/a>/);
  assert.match(desktopNavigation, /<a href="faq\/">FAQ<\/a>/);
});

test("contact links match the verified WhatsApp destinations and visible numbers", () => {
  const contactIndex = html.indexOf('<section class="contact-section"');
  const footerIndex = html.indexOf('<footer class="footer"');
  const contact = html.slice(contactIndex, footerIndex);
  const contacts = [...contact.matchAll(/<a class="contact-whatsapp" href="([^"]+)"[^>]*aria-label="([^"]+)">[\s\S]*?<span>([^<]+)<\/span>/g)];

  assert.equal(contacts.length, 2);
  assert.deepEqual(contacts.map(([, destination]) => destination), [
    "https://wa.me/6285113291516",
    "https://wa.me/6285173085643",
  ]);
  assert.deepEqual(contacts.map(([, , label]) => label), [
    "WhatsApp SMP — Flavia",
    "WhatsApp SMA — Fatiya",
  ]);
  assert.deepEqual(contacts.map(([, , , visible]) => visible), [
    "0851 1329 1516",
    "0851 7308 5643",
  ]);
  assert.equal((contact.match(/class="contact-whatsapp-icon"/g) || []).length, 2);
  assert.equal((contact.match(/src="Assets\/figma\/contact-whatsapp-figma\.svg"/g) || []).length, 2);
  assert.doesNotMatch(contact, /<svg\b/);
  assert.match(css, /\.contact-whatsapp img \{[^}]*width: 32px; height: 32px; flex: 0 0 32px;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.contact-whatsapp img \{ width: 32px; height: 32px; flex-basis: 32px; \}/);
});

test("long countdown and tablet timeline have responsive containment rules", () => {
  assert.match(css, /\.countdown-copy h2 \{[^}]*width: 1120px;[^}]*font-size: 100px;[^}]*line-height: 1\.15;/s);
  assert.match(css, /@media \(min-width: 561px\) and \(max-width: 1200px\) \{[^}]*\.timeline-list \.timeline-entry div \{ width: calc\(100% - 57px\); \}/s);
  assert.match(css, /@media \(min-width: 561px\) and \(max-width: 640px\) \{[^}]*\.timeline-board h2 \{[^}]*left: 50%;[^}]*width: calc\(100% - 32px\);[^}]*transform: translateX\(-50%\);/s);
});

test("the About LMNas copy uses the approved historical and education wording", () => {
  const aboutSection = html.slice(html.indexOf('aria-labelledby="why-title"'), html.indexOf('id="peta-waktu"'));
  const aboutCopy = aboutSection.match(/<p>([^<]+)<\/p>/)?.[1];
  assert.equal(aboutCopy, "Lomba Matematika Nasional Universitas Gadjah Mada (LMNas UGM) adalah salah satu kompetisi matematika tingkat nasional paling bergengsi di Indonesia yang diinisiasi oleh (Alm) Prof. Dr. rer. nat. Widodo, M.S. pada tahun 1989. Diselenggarakan oleh Himpunan Mahasiswa Matematika (Himatika) UGM, LMNas menjadi ajang kompetisi bernilai tinggi yang diikuti oleh lebih dari 2000 peserta setiap tahunnya dari seluruh penjuru Indonesia. LMNas memberikan kesempatan emas bagi seluruh siswa jenjang SD, SMP, dan SMA atau sederajat untuk menguji kemampuan, mengukir prestasi, dan mengasah potensi matematika mereka di skala nasional.");
  assert.match(html, /og:description[^>]*SMA\/sederajat/);
  assert.match(html, /twitter:description[^>]*SMA\/sederajat/);
});

test("the timeline heading preserves the approved sentence case", () => {
  assert.match(html, /<h2 id="timeline-title">Linimasa<\/h2>/);
  assert.doesNotMatch(html, /<h2 id="timeline-title">LINIMASA<\/h2>/);
  assert.match(css, /\.timeline-board h2 \{[^}]*font-family: var\(--display\);/);
  assert.doesNotMatch(css, /\.timeline-board h2 \{[^}]*text-transform:\s*uppercase/);
});

test("timeline dates use Montserrat while event headings and badges stay unchanged", () => {
  const timeline = html.slice(html.indexOf('<section class="timeline-section"'), html.indexOf('<section class="prize-section"'));
  assert.deepEqual([...timeline.matchAll(/<time datetime="[^"]+">([^<]+)<\/time>/g)].map(([, date]) => date), [
    "1–12 September 2026",
    "13–26 September 2026",
    "24 Oktober 2026",
    "14–15 November 2026",
  ]);
  assert.match(css, /\.timeline-entry time \{[^}]*color: #000;[^}]*font-family: "Montserrat", sans-serif;[^}]*font-size: 17px;[^}]*font-weight: 400;[^}]*letter-spacing: \.05em;[^}]*line-height: 32px;[^}]*text-align: center;[^}]*white-space: nowrap;/);
  assert.match(css, /\.timeline-entry h3 \{[^}]*color: var\(--green\);[^}]*font-family: var\(--display\);/);
  assert.match(css, /\.timeline-status \{[^}]*width: 176px;[^}]*height: 27px;[^}]*background: #8a5a17;/);
});

test("the timeline monkey uses a clean vector edge and stays anchored across intermediate widths", () => {
  const timeline = html.match(/<section class="timeline-section"[\s\S]*?<\/section>/)?.[0] || "";
  const board = html.match(/<div class="timeline-board">([\s\S]*?)<\/div>/)?.[1] || "";

  assert.match(timeline, /<img class="timeline-monkey"[^>]+timeline-monkey\.svg\?v=2" width="187" height="281"/);
  assert.doesNotMatch(timeline, /timeline-monkey-figma\.svg/);
  assert.doesNotMatch(board, /timeline-monkey/);
  assert.match(css, /\.timeline-monkey \{[^}]*top: 186px;[^}]*left: calc\(50% - 488\.7px\);[^}]*width: 187px;[^}]*height: auto;[^}]*filter: drop-shadow\(0 4px 6\.35px rgba\(0,0,0,\.71\)\);/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.timeline-monkey \{[^}]*top: calc\(11\.48vw \+ 48\.18px\);[^}]*left: calc\(31\.78vw - 249\.51px\);[^}]*width: clamp\(110px, calc\(20\.26vw - 56\.13px\), 187px\);[^}]*height: auto;/);
  assert.match(css, /@media \(max-width: 820px\) \{\s*\.timeline-monkey \{ display: none; \}\s*\}/);
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
  assert.match(css, /\.site-header nav a \{[^}]*display: inline-flex;[^}]*min-height: 44px;[^}]*align-items: center;/s);
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

test("the prize total flows into the two-line promotion and benefits", () => {
  assert.match(html, /<p class="prize-promo-line">dan dapatkan<br \/>promo pendaftaran<\/p>/);
  assert.doesNotMatch(html, /Beserta/);
  assert.doesNotMatch(html, /class="prize-promo-title"/);
  assert.match(css, /\.prize-amount, \.prize-promo-line \{[^}]*font-family: "Rumble Brave", Georgia, serif;[^}]*font-size: 90px;[^}]*font-weight: 500;[^}]*line-height: \.95;/);
  assert.match(css, /\.prize-promo-line \{[^}]*top: 326px;[^}]*padding-inline: 40px;[^}]*letter-spacing: -\.025em;[^}]*text-align: center;[^}]*white-space: nowrap;/);
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.prize-promo-line \{[^}]*padding-inline: 28px;[^}]*white-space: nowrap;/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*?\.prize-promo-line \{[^}]*padding-inline: 16px;[^}]*white-space: nowrap;/);
  assert.match(css, /\.prize-benefits \{[^}]*top: 520px;/);
});

test("the mobile prize heading keeps its centering transform anchored at 50 percent", () => {
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*?\.prize-section \.section-title \{[^}]*left: 50%;[^}]*width: calc\(100% - 24px\);/,
  );
});

test("tablet hero and prize geometry remain inside their clipping sections", () => {
  assert.match(
    css,
    /@media \(max-width: 1200px\) \{[\s\S]*?\.hero-copy \.hero-subhead \{[^}]*width: min\(620px, calc\(100vw - 40px\)\);[^}]*max-width: none;/,
  );
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.prize-section \{ height: 1280px;/);
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
  assert.match(css, /\.testimonial-copy \{[^}]*width: min\(1085px, calc\(100% - 48px\)\);[^}]*height: 514px;[^}]*font-size: 27px;/);
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
  const bookPromo = html.slice(bookIndex, contactIndex);
  assert.match(bookPromo, /<span class="visually-hidden">Buku Soal dan Pembahasan LMNas<\/span>/);
  assert.doesNotMatch(bookPromo, /Buku Pembahasan Soal LMNas 36/);
  assert.match(bookPromo, /<p class="book-purchase-cta"><span class="visually-hidden">Beli sekarang<\/span><span aria-hidden="true">Beli sekarang<\/span><\/p>/);
  assert.doesNotMatch(bookPromo, /Beli Disini/);
  assert.doesNotMatch(bookPromo, /book-store-label\.svg/);
  assert.match(html, /Gratis Buku Soal dan Pembahasan LMNas 36/);
});

test("the footer fills the updated Home3 Figma partner regions", () => {
  const footer = html.slice(html.indexOf('<footer class="footer"'));

  assert.match(html, /class="footer-visual" src="Assets\/figma\/footer-panel-divider-home3\.png"/);
  assert.match(html, /class="footer-heading footer-heading--media">Media Partner<\/h2>/);
  assert.match(html, /class="footer-heading footer-heading--partner">Mitra<\/h2>/);
  assert.equal((footer.match(/class="footer-logo footer-logo--/g) || []).length, 11);
  assert.deepEqual([...footer.matchAll(/class="footer-logo[^>]*><img[^>]+alt="([^"]+)"/g)].map(([, alt]) => alt), [
    "Standard",
    "BSM Rental",
    "MIC Hotel",
    "Taman Batik Terang Bulan",
    "Raden HT",
    "Wisma Kagama",
    "Imperial Digital Printing",
    "Jogja TV",
    "Ikut Event",
    "Ikahimatika",
    "Kotaperak 94.6 FM",
  ]);
  assert.match(css, /\.footer \{[^}]*background: #f3d275;[^}]*overflow: hidden;/);
  assert.match(css, /\.footer-stage \{[^}]*aspect-ratio: 2914 \/ 1125;/);
  assert.match(css, /\.footer-visual \{[^}]*object-fit: fill;/);
  assert.match(css, /\.footer-heading--media \{ right: 0; \}/);
  assert.match(css, /\.footer-heading--partner \{ left: 0; \}/);
  assert.match(css, /\.footer-logo--standard \{ top: 28\.86%; left: 3\.19%; width: 17\.15%; height: 14\.25%; \}/);
  assert.match(css, /\.footer-logo--jogja-tv \{ top: 26\.69%; left: 58\.19%; width: 32\.29%; height: 9\.74%; \}/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.footer-partners \{[^}]*grid-template-columns: 1fr 1fr;[^}]*min-height: 410px;/);
  assert.match(css, /@media \(min-width: 641px\) and \(max-width: 1332px\) \{[\s\S]*?\.footer-socials \{[^}]*display: grid;[^}]*width: 100%;[^}]*margin-top: auto;/);
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
  const bookIndex = html.indexOf('<div class="book-promo"');
  const contactIndex = html.indexOf('<section class="contact-section"');
  const bookPromo = html.slice(bookIndex, contactIndex);

  assert.match(bookPromo, /<a class="book-store-link book-store-link--shopee" href="https:\/\/shopee\.co\.id\/lmnasstore" target="_blank" rel="noopener noreferrer" aria-label="Beli melalui Shopee">[\s\S]*?book-store-shopee\.svg[\s\S]*?<\/a>/);
  assert.match(bookPromo, /<a class="book-store-link book-store-link--tokopedia" href="https:\/\/www\.tokopedia\.com\/lmnas-semnas" target="_blank" rel="noopener noreferrer" aria-label="Beli melalui Tokopedia">[\s\S]*?book-store-tokopedia\.svg[\s\S]*?<\/a>/);
  assert.equal((bookPromo.match(/<a class="book-store-link/g) || []).length, 2);
  assert.doesNotMatch(bookPromo, /book-store-link--whatsapp|book-store-link--tiktok|wa\.me|tiktok\.com/);
  assert.match(css, /\.book-stores \{ display: flex; gap: 16px; \}/);
  assert.match(css, /\.book-stores a \{[^}]*display: flex;[^}]*width: 170px;[^}]*height: 62px;[^}]*align-items: center;[^}]*justify-content: center;[^}]*border: 5px solid var\(--green\);[^}]*border-radius: 12px;/);
  assert.match(css, /\.book-stores img \{ width: auto; height: 30px; max-width: calc\(100% - 24px\); \}/);
  assert.match(css, /\.book-store-link--tokopedia img \{ height: 32px; \}/);
  assert.match(css, /\.book-stores a \{[^}]*transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;/);
  assert.match(css, /\.book-stores a:focus-visible \{ outline: 3px solid var\(--gold\); outline-offset: 4px; \}/);
  assert.match(css, /\.book-stores a:active \{ transform: translateY\(0\); box-shadow: 0 2px 4px rgba\(0,0,0,\.18\); \}/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.book-stores a:hover \{ transform: translateY\(-2px\); box-shadow: 0 5px 9px rgba\(0,0,0,\.22\); border-color: var\(--green-dark\); \}\s*\}/);
  assert.doesNotMatch(css, /\.book-stores \{ flex-direction: column/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*?\.book-stores \{ justify-content: center; gap: 12px; \}[\s\S]*?\.book-stores a \{ display: flex; width: 145px; height: 58px; max-width: calc\(50% - 6px\); align-items: center; \}/);
  assert.match(fs.readFileSync(path.join(__dirname, "..", "Assets", "figma", "book-store-shopee.svg"), "utf8"), /<svg width="958" height="307" viewBox="0 0 958 307"/);
  assert.match(fs.readFileSync(path.join(__dirname, "..", "Assets", "figma", "book-store-tokopedia.svg"), "utf8"), /<svg width="845" height="277" viewBox="0 0 845 277"/);
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

  for (const handle of [
    "LMNas dan Semnastika UGM",
    "@lmnas_semnas",
    "@lmnas &amp; Semnastika UGM",
  ]) {
    assert.match(html, new RegExp(`<span>${handle}<\\/span>`));
  }
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.footer-social \{[^}]*font-family: var\(--body\);/);
  assert.match(css, /\.footer-social \{[^}]*font-family: "Montserrat", sans-serif;[^}]*font-size: 18px;[^}]*font-weight: 600;/);
  assert.match(css, /\.footer-socials-art \{ display: none; \}/);
  assert.match(css, /\.footer-social::before \{ display: grid; width: 38px; height: 38px; flex: 0 0 38px;/);
  assert.match(css, /\.footer-social span \{ position: static; overflow: visible;/);
  assert.match(css, /\.footer-heading \{[^}]*font-family: var\(--display\);/);
  assert.doesNotMatch(css, /\.footer-social \{[^}]*text-transform:\s*uppercase/);
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

test("first-load decorative and partner assets use right-sized files", () => {
  const optimizedAssets = [
    ["Assets/figma/paper-texture.webp", 2 * 1024 * 1024],
    ["Assets/figma/nav-mark-216.png", 250 * 1024],
    ["Assets/sponsors/standard.png", 250 * 1024],
    ["Assets/sponsors/bsm-rental-figma.png", 250 * 1024],
    ["Assets/sponsors/mic-hotel.png", 250 * 1024],
    ["Assets/sponsors/taman-batik-terang-bulan.png", 250 * 1024],
    ["Assets/sponsors/raden-ht.png", 500 * 1024],
    ["Assets/sponsors/wisma-kagama.png", 250 * 1024],
    ["Assets/sponsors/imperial-digital-printing-figma.png", 250 * 1024],
    ["Assets/partners/jogja-tv.png", 250 * 1024],
    ["Assets/partners/ikut-event-figma.png", 250 * 1024],
    ["Assets/partners/ikahimatika-56586a.png", 250 * 1024],
    ["Assets/partners/kotaperak-figma.png", 250 * 1024],
  ];

  for (const [asset, maximumBytes] of optimizedAssets) {
    const absolutePath = path.join(__dirname, "..", asset);
    assert.equal(fs.existsSync(absolutePath), true, `${asset} should exist`);
    assert.ok(fs.statSync(absolutePath).size <= maximumBytes, `${asset} should be right-sized`);
  }

  assert.match(css, /--texture: url\("Assets\/figma\/paper-texture\.webp"\)/);
  assert.equal((html.match(/Assets\/figma\/nav-mark-216\.png/g) || []).length, 2);
  assert.doesNotMatch(html, /Assets\/partners\/kotaperak\.png/);
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
    /@media \(max-width: 560px\) \{[\s\S]*?\.testimonial-copy \{[^}]*font-size: 16px;[^}]*line-height: 1\.48;[^}]*text-align: left;/,
  );
  assert.match(html, /Anda dapat menghubungi contact person di bawah ini:/);
  assert.match(html, /<em>Flavia<\/em>/);
  assert.match(html, /<em>Fatiya<\/em>/);
  assert.doesNotMatch(html, /<span class="faq-label">Narahubung<\/span>/);
  assert.doesNotMatch(css, /\.faq-label/);
  assert.match(css, /\.contact-list \{ display: grid; gap: 14px; \}/);
  assert.match(css, /\.contact-person \{ display: grid; grid-template-columns: 64px 32px max-content max-content; column-gap: 14px;/);
  assert.match(css, /\.contact-intro \{[^}]*font-family: var\(--body\);[^}]*font-size: 19px;[^}]*font-weight: 600;/);
  assert.match(css, /\.contact-person \{[^}]*font-family: var\(--body\);[^}]*font-size: 28px;[^}]*font-weight: 500;/);
  assert.match(css, /\.contact-whatsapp > span \{ font-weight: 600; \}/);
  assert.match(css, /\.contact-person em \{[^}]*font-size: \.82em;[^}]*font-style: italic;[^}]*font-weight: 500;/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.contact-person \{ grid-template-columns: 42px 28px minmax\(0, max-content\) max-content; column-gap: 8px; justify-content: center; font-size: clamp\(14px, 4\.4vw, 18px\);/);
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
  assert.match(css, /\.footer-heading--media \{ right: 0; \}/);
  assert.match(css, /\.footer-heading--partner \{ left: 0; \}/);
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

test("the updated footer keeps Mitra and Media Partner as separate semantic groups", () => {
  const footer = html.slice(html.indexOf('<footer class="footer"'));
  const mitra = footer.slice(footer.indexOf('footer-partner-group--mitra'), footer.indexOf('footer-partner-group--media'));
  const media = footer.slice(footer.indexOf('footer-partner-group--media'), footer.indexOf('class="footer-socials"'));

  assert.equal((mitra.match(/class="footer-logo footer-logo--/g) || []).length, 7);
  assert.equal((media.match(/class="footer-logo footer-logo--/g) || []).length, 4);
  assert.match(mitra, /Standard[\s\S]*BSM Rental[\s\S]*MIC Hotel[\s\S]*Taman Batik Terang Bulan[\s\S]*Raden HT[\s\S]*Wisma Kagama[\s\S]*Imperial Digital Printing/);
  assert.match(media, /Jogja TV[\s\S]*Ikut Event[\s\S]*Ikahimatika[\s\S]*Kotaperak 94\.6 FM/);
  assert.doesNotMatch(mitra, /Jogja TV|Ikut Event|Ikahimatika|Kotaperak/);
  assert.doesNotMatch(media, /Standard|BSM Rental|MIC Hotel|Taman Batik|Raden HT|Wisma Kagama|Imperial/);
});
