"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const lastRule = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(escaped + "\\s*\\{([^}]+)\\}", "g"))].at(-1)?.[1] || "";
};
for (const file of ["registration-extension.css", "LMNas_Deployed/style.css"]) {
  test(`${file} allows the complete registration-closed heading to wrap and grow`, () => {
    const rule = lastRule(read(file), "#main-content .registration-title");
    assert.match(rule, /white-space:\s*normal\s*;/);
    assert.match(rule, /height:\s*auto\s*;/);
    assert.match(rule, /width:\s*min\(900px,\s*100%\)\s*;/);
    assert.match(rule, /line-height:\s*1\.15\s*;/);
  });
  test(`${file} uses bounded responsive type instead of the old oversized CTA`, () => {
    const rule = lastRule(read(file), "#main-content .registration-title");
    assert.match(rule, /font-size:\s*clamp\(32px,\s*5vw,\s*72px\)\s*;/);
    assert.match(rule, /letter-spacing:\s*\.035em\s*;/);
    assert.doesNotMatch(rule, /font-size:\s*120px|white-space:\s*nowrap/);
  });
  test(`${file} sizes the closed-registration section to content at desktop widths`, () => {
    const rule = lastRule(read(file), "#main-content .registration-section");
    assert.match(rule, /min-height:\s*0\s*;/);
    assert.match(rule, /padding:\s*clamp\(40px,\s*5vw,\s*72px\)\s+0\s*;/);
  });
}
test("the deployment bundle ends with the canonical registration layout overrides", () => {
  assert.ok(read("LMNas_Deployed/style.css").endsWith(read("registration-extension.css")));
});
test("the source page cache-busts the corrected registration layout stylesheet", () => {
  assert.match(read("index.html"), /href="registration-extension\.css\?v=3"/);
});
