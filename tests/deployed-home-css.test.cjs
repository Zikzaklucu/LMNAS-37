"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("deployed homepage loads the published bundle without assuming a WordPress root stylesheet", () => {
  const html = read("LMNas_Deployed/index.html");
  const css = read("LMNas_Deployed/style.css");
  const links = [...html.matchAll(/<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"[^>]*>/g)].map(match => match[1]);
  assert.deepEqual(links, ["https://zikzaklucu.github.io/LMNAS-37/LMNas_Deployed/style.css?v=182"]);
  assert.equal(new URL(links[0], "https://lmnas.fmipa.ugm.ac.id/").hostname, "zikzaklucu.github.io");
  let previous = -1;
  for (const file of ["hero-leaves.css", "hero-owl.css", "sponsor-tiers.css"]) {
    const marker = `/* Bundled from ${file} — preserve cascade order. */`;
    const index = css.indexOf(marker);
    assert.ok(index > previous, `${file} retains its cascade position`);
    assert.ok(css.slice(index + marker.length).startsWith("\n" + read(`LMNas_Deployed/${file}`)));
    previous = index;
  }
});
