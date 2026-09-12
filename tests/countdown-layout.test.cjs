"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("countdown grows with wrapped phase headings instead of overlapping the why section", () => {
  for (const file of ["style.css", "LMNas_Deployed/style.css", "LMNas_Deployed/faq/style.css", "LMNas_Deployed/peraturan/style.css"]) {
    const css = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    const rules = [...css.matchAll(/\.countdown-section\s*\{([^}]+)\}/g)].map(match => match[1]);
    assert.match(rules[0], /(?:^|;)\s*height:\s*auto;/, file);
    assert.match(rules[0], /padding-bottom:\s*24px;/, file);
    for (const rule of rules) assert.doesNotMatch(rule, /(?:^|;)\s*height:\s*\d/, file);
    for (const height of [647, 500, 430]) assert.ok(rules.some(rule => rule.includes(`min-height: ${height}px;`)), `${file}: preserves ${height}px minimum`);
  }
});
