"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const routes = ["index.html", "buku-panduan/index.html", "peraturan/index.html", "faq/index.html", "soal/36/index.html", "soal/35/index.html", "soal/34/index.html"];
const expected = [
  ["https://lmnas.fmipa.ugm.ac.id/lmnas-36", "LMNas 36"],
  ["https://lmnas.fmipa.ugm.ac.id/lmnas-35", "LMNas 35"],
  ["https://lmnas.fmipa.ugm.ac.id/beranda-lmnas-34", "LMNas 34"],
  ["https://lmnas.fmipa.ugm.ac.id/beranda-lmnas-33", "LMNas 33"],
];
for (const prefix of ["", "LMNas_Deployed/"]) {
  for (const route of routes) {
    test(`${prefix}${route}: Arsip LMNas exposes the exact archive links newest first`, () => {
      const html = fs.readFileSync(path.join(__dirname, "..", prefix + route), "utf8");
      const nav = html.match(/<nav id="primary-navigation"[\s\S]*?<\/nav>/)?.[0];
      assert.ok(nav, "primary navigation exists");
      const archives = [...nav.matchAll(/<details class="nav-papers nav-archive">([\s\S]*?)<\/details>/g)];
      assert.equal(archives.length, 1, "one native archive dropdown per navbar");
      assert.match(archives[0][1], /<summary>Arsip LMNas<\/summary>/);
      const links = [...archives[0][1].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(match => [match[1], match[2]]);
      assert.deepEqual(links, expected);
      assert.match(nav, /<summary>Soal Tahun Lalu<\/summary>/, "past papers remain separate");
    });
  }
}
