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
  test(`${file} announces extended registration throughout the homepage`, () => {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    for (const section of ["hero", "countdown-section", "timeline-section", "registration-section"]) {
      const content = html.match(new RegExp(`<section class="${section}"[\\s\\S]*?<\\/section>`))?.[0];
      assert.ok(content, section);
      assert.match(content, /Perpanjangan Pendaftaran/);
      assert.match(content, /27 September–10 Oktober 2026/);
    }
    assert.match(html, /data-phase-key="registration-extended"/);
    assert.match(html, /data-countdown-target="2026-10-10T23:59:59\+07:00"/);
  });
}
