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
    assert.match(countdown, /id="countdown-title">Babak Semifinal/);
    assert.match(countdown, /data-countdown-target="2026-11-14T00:00:00\+07:00"/);
    const registration = html.match(/<section class="registration-section"[\s\S]*?<\/section>/)?.[0];
    assert.match(registration, /id="registration-title">Registrasi LMNas 37 telah ditutup<\/h2>/);
    const refundNotice = "Segala bentuk pembayaran tidak dapat dikembalikan dalam bentuknapapun";
    assert.match(registration, /<\/h2>\s*<p class="registration-extension-note">Segala bentuk pembayaran tidak dapat dikembalikan dalam bentuknapapun<\/p>/);
    assert.equal(html.split(refundNotice).length - 1, 1, "refund notice appears exactly once");
    assert.ok(html.indexOf(refundNotice) < html.indexOf('id="buku-soal"'), "refund notice precedes the book section");
  });
}
