"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const routes = ["index.html", "faq/index.html", "peraturan/index.html", "buku-panduan/index.html", "soal/34/index.html", "soal/35/index.html", "soal/36/index.html"];
test("Yamie Panda appears once under Kemitraan on every source and deployment page", () => {
  assert.ok(fs.statSync(path.join(root, "Assets/sponsors/yamie-panda.png")).size > 0);
  for (const route of [...routes, ...routes.map(r => `LMNas_Deployed/${r}`)]) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    const group = html.match(/<section class="footer-partner-group footer-partner-group--mitra">([\s\S]*?)<\/section>/)[1];
    assert.equal((html.match(/alt="Yamie Panda"/g) || []).length, 1, route);
    const src = group.match(/<img src="([^"]+)" alt="Yamie Panda" loading="lazy" decoding="async"/)[1];
    if (route.startsWith("LMNas_Deployed/")) {
      assert.ok(src.startsWith("data:image/png;base64,"));
      assert.deepEqual(Buffer.from(src.split(",")[1], "base64"), fs.readFileSync(path.join(root, "Assets/sponsors/yamie-panda.png")));
    }
    else assert.ok(fs.existsSync(path.resolve(root, path.dirname(route), src)), route);
    assert.match(group, /alt="Bank BPD DIY"/);
  }
});
