"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
for (const file of ["index.html", "LMNas_Deployed/index.html"]) {
  test(`${file} removes the hero closure notice and its flowers without changing the lower sections`, () => {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0];
    assert.ok(hero, "hero remains present");
    assert.doesNotMatch(hero, /Registrasi LMNas 37 telah ditutup|class="hero-cta"|class="hero-flowers"|hero-flowers\.svg|registration-extension-note/);
    assert.match(hero, /id="hero-title">LMNAS 37<\/h1>/);
    assert.match(hero, /class="hero-welcome">Selamat Datang di laman/);
    assert.match(hero, /Mathematics as the Gateway/);
    assert.match(hero, /class="hero-owl-stage"/);
    const countdown = html.match(/<section class="countdown-section"[\s\S]*?<\/section>/)?.[0];
    assert.match(countdown, /id="countdown-title">Babak Penyisihan/);
    assert.match(countdown, /data-countdown-target="2026-10-24T00:00:00\+07:00"/);
    const registration = html.match(/<section class="registration-section"[\s\S]*?<\/section>/)?.[0];
    assert.match(registration, /id="registration-title">Registrasi LMNas 37 telah ditutup<\/h2>/);
  });
}
