"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const pages = ["index.html", "buku-panduan/index.html", "faq/index.html", "peraturan/index.html", "soal/34/index.html", "soal/35/index.html", "soal/36/index.html"];

test("all source and deployment footers load tiers and identify Fumalife correctly", () => {
  for (const file of [...pages, ...pages.map(file => `LMNas_Deployed/${file}`)]) {
    const html = read(file);
    const href = html.match(/href="([^"]*sponsor-tiers\.css\?v=1)"/);
    assert.ok(href, file);
    assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), href[1].split("?")[0])), file);
    const sponsors = html.split('aria-label="Mitra LMNAS 37">')[1].split("</ul>")[0];
    assert.equal((sponsors.match(/<li /g) || []).length, 11, file);
    for (const name of ["standard", "bsm", "mic", "taman-batik", "raden", "wisma", "imperial", "takaful", "fumalife", "bpd-diy", "yamie-panda"]) {
      assert.ok(sponsors.includes(`footer-logo--${name}\"`), `${file}: ${name}`);
    }
    assert.match(sponsors, /alt="Fumalife"/);
    assert.doesNotMatch(sponsors, /alt="Manulife"/);
  }
});

test("Bank BPD DIY is present once in every footer with an available local asset", () => {
  for (const file of [...pages, ...pages.map(file => `LMNas_Deployed/${file}`)]) {
    const html = read(file);
    const matches = [...html.matchAll(/<li class="footer-logo footer-logo--bpd-diy"><img src="([^"]+)" alt="Bank BPD DIY" loading="lazy" decoding="async" \/><\/li>/g)];
    assert.equal(matches.length, 1, file);
    if (file.startsWith("LMNas_Deployed/")) {
      assert.ok(matches[0][1].startsWith("data:image/png;base64,"), file);
      const embedded = Buffer.from(matches[0][1].split(",")[1], "base64");
      assert.deepEqual(embedded, fs.readFileSync(path.join(root, "Assets/sponsors/bank-bpd-diy.png")), file);
      continue;
    }
    const asset = matches[0][1].replace("https://zikzaklucu.github.io/LMNAS-37/", "");
    const local = asset.startsWith("Assets/") ? path.join(root, asset) : path.resolve(root, path.dirname(file), asset);
    assert.ok(fs.existsSync(local), `${file}: ${asset}`);
    assert.equal(fs.readFileSync(local).subarray(1, 4).toString(), "PNG");
  }
});

test("tier stylesheet is mirrored exactly and preserves intrinsic logo proportions", () => {
  const css = read("sponsor-tiers.css");
  assert.equal(read("LMNas_Deployed/sponsor-tiers.css"), css);
  for (const [width, height] of [[120,60], [180,90], [320,120], [80,40], [220,80]]) {
    assert.match(css, new RegExp(`width: ${width}px;\\s*height: ${height}px;`));
  }
  assert.match(css, /transform: none; object-fit: contain/);
});
