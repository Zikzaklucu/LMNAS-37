"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("the hero divider stays attached to the countdown under WordPress section margins", () => {
  for (const file of ["style.css", "LMNas_Deployed/style.css"]) {
    const css = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    assert.match(css, /#main-content\s*>\s*\.hero\s*\{\s*margin-bottom:\s*0;\s*\}/, file);
    assert.match(css, /\.countdown-art\s*\{[^}]*top: -24px;[^}]*width: 1498px;/);
    assert.match(css, /\.countdown-art\s*\{ top: -12px; width: 430px; \}/);
  }
});
