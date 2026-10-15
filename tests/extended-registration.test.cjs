"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
test("the deployment bundle mirrors extension styles and countdown logic", () => {
  const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const deployed = read("LMNas_Deployed/index.html");
  for (const file of ["site-config.js", "countdown.js"]) {
    assert.ok(deployed.includes(read(file).trim()), file);
  }
  assert.ok(read("LMNas_Deployed/style.css").endsWith(read("registration-extension.css")));
});
for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
  test(`${file} preserves historical extension dates and announces the preliminary round`, () => {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    for (const section of ["timeline-section"]) {
      const content = html.match(new RegExp(`<section class="${section}"[\\s\\S]*?<\\/section>`))?.[0];
      assert.ok(content, section);
      assert.match(content, /Perpanjangan Pendaftaran/);
      assert.match(content, /27 September–10 Oktober 2026/);
    }
    assert.match(html, /data-phase-key="registration-extended"/);
    assert.match(html, /data-countdown-target="2026-10-24T00:00:00\+07:00"/);
    for (const section of ["hero", "registration-section"]) {
      const content = html.match(new RegExp(`<section class="${section}"[\\s\\S]*?<\\/section>`))?.[0];
      if (section === "hero") {
        assert.doesNotMatch(content, /Registrasi LMNas 37 telah ditutup|class="hero-cta"|class="hero-flowers"/);
      } else {
        assert.match(content, /Registrasi LMNas 37 telah ditutup/);
      }
      assert.doesNotMatch(content, /Perpanjangan Pendaftaran|data-registration-link/);
    }
    const countdown = html.match(/<section class="countdown-section"[\s\S]*?<\/section>/)?.[0];
    assert.match(countdown, /Babak Penyisihan/);
    assert.match(countdown, /24 Oktober 2026/);
  });
}
