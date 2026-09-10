"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
test("each paper replaces its PDF icon with the matching level cover and keeps its PDF target", () => {
  for (const edition of [36,35,34]) {
    const html = read(`soal/${edition}/index.html`);
    assert.doesNotMatch(html, /class="paper-layout"|class="paper-covers"|class="paper-icon"/);
    assert.equal((html.match(/class="paper-cover-link"/g) || []).length,4);
    assert.ok(html.includes('href="../covers.css?v=3"'));
    const list = html.match(/<ul class="paper-list"[\s\S]*?<\/ul>/)[0];
    for (const item of list.matchAll(/<li>[\s\S]*?<\/li>/g)) {
      const level = item[0].includes('Penyisihan SMP') || item[0].includes('Semifinal SMP') ? 'smp' : 'sma';
      assert.ok(item[0].includes(`lmnas-${edition}-${level}.webp`));
      const coverTarget = item[0].match(/class="paper-cover-link" href="([^"]+)"/)[1];
      const textTarget = item[0].match(/class="paper-file-link" href="([^"]+)"/)[1];
      assert.equal(coverTarget,textTarget);
    }
    const coverData = JSON.parse(read('soal/covers.json')).filter(c => c.edition === edition);
    assert.equal(coverData.length, 2);
    for (const cover of coverData) {
      assert.ok(html.includes(`width="${cover.width}" height="${cover.height}"`));
      assert.equal(fs.readFileSync(path.join(__dirname,"..",cover.file)).subarray(8,12).toString(), "WEBP");
    }
    assert.ok(read(`LMNas_Deployed/soal/${edition}/style.css`).endsWith(read('soal/covers.css')));
    for (const level of ["smp", "sma"]) {
      const file = `Assets/covers/lmnas-${edition}-${level}.webp`;
      assert.ok(html.includes(`src="../../${file}"`));
      assert.ok(html.includes(`alt="Sampul buku soal dan pembahasan LMNas ${edition} — ${level.toUpperCase()}"`));
      assert.ok(fs.statSync(path.join(__dirname,"..",file)).size < 200000);
    }
    assert.equal((html.match(/class="paper-file-link"/g) || []).length,4);
    assert.doesNotMatch(html, /paper-breadcrumb|class="paper-intro"|class="paper-note"/);
  }
});
test("the archive navigation enhancement is loaded on every canonical route", () => {
  for (const file of ["index.html", "faq/index.html", "buku-panduan/index.html", "peraturan/index.html", "soal/36/index.html", "soal/35/index.html", "soal/34/index.html"]) {
    assert.ok(read(file).includes('archive-navigation.js?v=1'), file);
  }
});
test("SMMC archive uses a navbar edition submenu and separate document pages, not homepage tabs", () => {
  for (const file of ["index.html", "faq/index.html", "buku-panduan/index.html", "peraturan/index.html"]) {
    const html = read(file);
    assert.match(html, /<details class="nav-papers">/);
    assert.match(html, /<summary>Soal Tahun Lalu<\/summary>/);
    for (const edition of [36,35,34]) assert.match(html, new RegExp(`soal/${edition}/index.html`));
    assert.match(html, />Silabus<\/a>/);
    assert.doesNotMatch(html, /past-papers-selector|past-papers-section|past-papers-edition/);
  }
});
test("all twelve verified papers are real PDFs on edition pages with readable labels and download links", () => {
  const data = JSON.parse(read("soal/papers.json"));
  assert.equal(data.length, 12);
  assert.equal(new Set(data.map(p=>p.driveId)).size, 12);
  for (const edition of [36,35,34]) {
    const html = read(`soal/${edition}/index.html`);
    assert.match(html, new RegExp(`<h1>Soal LMNas ${edition}<\/h1>`));
    const papers = data.filter(p=>p.edition===edition);
    assert.equal(papers.length,4);
    assert.deepEqual(papers.map(p=>p.label),["Penyisihan SMP","Penyisihan SMA","Semifinal SMP","Semifinal SMA"]);
    for(const paper of papers) {
      const bytes = fs.readFileSync(path.join(__dirname,"..",paper.file));
      assert.equal(bytes.subarray(0,5).toString(),"%PDF-");
      assert.ok(html.includes(paper.label));
      assert.ok(html.includes(`href="../../${paper.file}"`));
      assert.ok(html.includes(`download="${path.basename(paper.file)}"`));
    }
    assert.doesNotMatch(html, /paper-breadcrumb|Soal babak Penyisihan dan Semifinal untuk tingkat SMP dan SMA\.|Tautan PDF dibuka di tab baru/);
    assert.equal(html.includes("PLUEsKMMSHeq3UybBrbR-HpzFU2e6DOp-d"),edition===35);
  }
});
test("archive controls have visible focus and native keyboard disclosure, and no hover-only CSS menu", () => {
  const css=read("style.css");
  assert.match(css,/\.nav-papers:not\(\[open\]\) > \.nav-papers-menu/);
  assert.match(css,/\.nav-papers summary:focus-visible/);
  assert.match(css,/\.paper-file-link/);
  assert.doesNotMatch(css,/past-papers-radio|past-papers-selector/);
});
test("deployment archive mirrors the source content, menu behavior, and shared styles", () => {
  const script = read("archive-navigation.js");
  for (const edition of [36,35,34]) {
    const source=read(`soal/${edition}/index.html`);
    const deployed=read(`LMNas_Deployed/soal/${edition}/index.html`);
    const main=html=>html.match(/<main class="paper-page"[\s\S]*?<\/main>/)[0];
    const normalized=main(source).replaceAll("../../Assets/", "https://zikzaklucu.github.io/LMNAS-37/Assets/").replaceAll('href="../../index.html"','href="https://lmnas.fmipa.ugm.ac.id"');
    assert.equal(main(deployed),normalized);
    assert.ok(deployed.includes(script));
    assert.ok(read(`LMNas_Deployed/soal/${edition}/style.css`).includes('.nav-papers:not([open])'));
    assert.doesNotMatch(deployed,/src="\.\.\/|href="\.\.\/|past-papers-radio/);
  }
  for(const file of ["index.html","faq/index.html","peraturan/index.html","buku-panduan/index.html"]){
    const deployed=read("LMNas_Deployed/"+file);
    assert.ok(deployed.includes(script));
    for(const edition of [36,35,34]) assert.ok(deployed.includes(`https://zikzaklucu.github.io/LMNAS-37/soal/${edition}/index.html`));
  }
});