"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const socialImage = "https://zikzaklucu.github.io/LMNAS-37/Assets/figma/header-logo-bar.png";
const pageCases = [
  {
    source: "faq/index.html",
    deployed: "LMNas_Deployed/faq/index.html",
    title: "FAQ | LMNas 37",
    description: "Pertanyaan yang sering diajukan tentang LMNAS 37.",
    canonical: "https://lmnas.fmipa.ugm.ac.id/faq-lmnas-37/",
  },
  {
    source: "peraturan/index.html",
    deployed: "LMNas_Deployed/peraturan/index.html",
    title: "Peraturan Babak Penyisihan | LMNas 37",
    description: "Peraturan Babak Penyisihan LMNAS 37.",
    canonical: "https://lmnas.fmipa.ugm.ac.id/peraturan-lmnas-37/",
  },
  {
    source: "buku-panduan/index.html",
    deployed: "LMNas_Deployed/buku-panduan/index.html",
    title: "Buku Panduan LMNas 37",
    description: "Buku Panduan LMNas 37 — ketentuan, jadwal, mekanisme, materi, penghargaan, dan narahubung lomba.",
    canonical: "https://lmnas.fmipa.ugm.ac.id/bukupanduanlmnas37/",
  },
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function metaContent(html, attribute, value) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(
    `<meta\\s+${escapedAttribute}="${escapedValue}"\\s+content="([^"]*)"\\s*/?>`,
  ));
  return match && match[1];
}

function canonicalCount(html) {
  return (html.match(/<link\s+rel="canonical"/g) || []).length;
}

test("current static subpages publish production canonicals and social metadata", () => {
  for (const page of pageCases) {
    const html = read(page.source);
    assert.equal(canonicalCount(html), 1, `${page.source} should have one canonical`);
    assert.match(html, new RegExp(`<link\\s+rel="canonical"\\s+href="${page.canonical}"`));

    assert.equal(metaContent(html, "property", "og:type"), "website");
    assert.equal(metaContent(html, "property", "og:title"), page.title);
    assert.equal(metaContent(html, "property", "og:description"), page.description);
    assert.equal(metaContent(html, "property", "og:url"), page.canonical);
    assert.equal(metaContent(html, "property", "og:image"), socialImage);
    assert.ok(metaContent(html, "property", "og:image:alt"));

    assert.equal(metaContent(html, "name", "twitter:card"), "summary_large_image");
    assert.equal(metaContent(html, "name", "twitter:title"), page.title);
    assert.equal(metaContent(html, "name", "twitter:description"), page.description);
    assert.equal(metaContent(html, "name", "twitter:image"), socialImage);
  }
});

test("GitHub Pages source HTML is noindex while production bundle remains indexable", () => {
  for (const relativePath of [
    "index.html",
    ...pageCases.map((page) => page.source),
  ]) {
    assert.match(read(relativePath), /<meta name="robots" content="noindex,follow"\s*\/>/);
  }

  for (const relativePath of [
    "LMNas_Deployed/index.html",
    ...pageCases.map((page) => page.deployed),
  ]) {
    assert.doesNotMatch(read(relativePath), /<meta name="robots"[^>]*noindex/i);
  }
});

test("deployed subpages carry the same social metadata without owning WordPress canonicals", () => {
  for (const page of pageCases) {
    const html = read(page.deployed);
    assert.equal(canonicalCount(html), 0, `${page.deployed} must not add a competing WordPress canonical`);
    assert.equal(metaContent(html, "property", "og:type"), "website");
    assert.equal(metaContent(html, "property", "og:title"), page.title);
    assert.equal(metaContent(html, "property", "og:description"), page.description);
    assert.equal(metaContent(html, "property", "og:url"), page.canonical);
    assert.equal(metaContent(html, "property", "og:image"), socialImage);
    assert.equal(metaContent(html, "name", "twitter:card"), "summary_large_image");
    assert.equal(metaContent(html, "name", "twitter:title"), page.title);
    assert.equal(metaContent(html, "name", "twitter:description"), page.description);
    assert.equal(metaContent(html, "name", "twitter:image"), socialImage);
  }
});

test("current routed Peraturan references use HTTPS directly", () => {
  for (const relativePath of [
    "peraturan/index.html",
    "LMNas_Deployed/peraturan/index.html",
  ]) {
    const html = read(relativePath);
    assert.doesNotMatch(html, /http:\/\/lmnas\.fmipa\.ugm\.ac\.id\/?/);
    assert.match(html, /href="https:\/\/lmnas\.fmipa\.ugm\.ac\.id\/"[^>]*>situs web LMNas UGM<\/a>/);
  }
});
