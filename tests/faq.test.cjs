"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "faq");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "faq.css"), "utf8");
const script = fs.readFileSync(path.join(root, "faq.js"), "utf8");
const mainHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const navLabels = (source) => {
  const nav = source.match(/<nav\b[^>]*aria-label="Navigasi utama"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || "";
  return [...nav.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((match) => match[1].trim());
};

const footerMarkup = (source) => source.match(/<footer\b[\s\S]*?<\/footer>/)[0]
  .replace(/\.\.\/Assets/g, "Assets")
  .replace(/\s+/g, " ")
  .trim();

test("the FAQ keeps the measured Figma geometry in a reflowing card stack", () => {
  assert.match(css, /\.faq-main h1 \{[^}]*top: 168px;[^}]*left: calc\(50% - 596px\);[^}]*font-size: 150px;/s);
  assert.match(css, /\.faq-list \{[^}]*display: grid;[^}]*width: 1174px;[^}]*padding-top: 405px;[^}]*gap: 32px;/s);
  assert.match(css, /\.faq-card \{[^}]*position: relative;[^}]*width: 100%;[^}]*min-height: 81px;/s);
  assert.match(css, /\.faq-answer-panel \{[^}]*top: -40px;[^}]*left: 50%;[^}]*width: 1059px;[^}]*min-height: 279px;[^}]*margin-bottom: -40px;/s);
  assert.doesNotMatch(css, /\.faq-card:nth-child\([123]\) \{ top:/);
});

test("the accordion animates unknown answer heights with a CSS grid track", () => {
  assert.match(css, /\.faq-answer \{[^}]*display: grid;[^}]*grid-template-rows: 0fr;[^}]*transition:\s*grid-template-rows 280ms cubic-bezier\(\.22, 1, \.36, 1\);/s);
  assert.match(css, /\.faq-card\.is-open \.faq-answer \{[^}]*grid-template-rows: 1fr;[^}]*transition-duration: 450ms;/s);
  assert.match(css, /\.faq-answer-inner \{[^}]*min-height: 0;[^}]*overflow: hidden;/s);
  assert.doesNotMatch(css, /max-height\s*:/);
});

test("all three FAQ items are semantic, closed by default, and controllable", () => {
  assert.equal((html.match(/class="faq-card"/g) || []).length, 3);
  assert.equal((html.match(/class="faq-toggle"/g) || []).length, 3);
  assert.equal((html.match(/<button class="faq-toggle"[^>]*aria-expanded="false"/g) || []).length, 3);
  assert.equal((html.match(/class="faq-answer"/g) || []).length, 3);
  assert.equal((html.match(/aria-hidden="true" inert/g) || []).length, 3);
  assert.equal((html.match(/class="faq-answer-inner"/g) || []).length, 3);
  assert.equal((html.match(/class="faq-answer-panel"/g) || []).length, 3);
  assert.equal((html.match(/class="faq-answer-content"/g) || []).length, 3);
  assert.match(script, /addEventListener\("click"/);
  assert.match(script, /setAttribute\("aria-expanded", String\(shouldOpen\)\)/);
  assert.match(script, /answer\.setAttribute\("aria-hidden", String\(!shouldOpen\)\)/);
  assert.match(script, /answer\.inert = !shouldOpen/);
  assert.doesNotMatch(script, /answer\.animate|getBoundingClientRect|activeAnimations|WeakMap/);
  assert.doesNotMatch(script, /innerHTML|eval\(|setInterval/);
});

test("the FAQ motion is tactile, staggered, and reduced-motion safe", () => {
  assert.match(css, /@keyframes faq-title-enter/);
  assert.match(css, /@keyframes faq-card-enter/);
  assert.match(css, /\.faq-page\.motion-ready \.faq-card:nth-child\(3\) \{ animation-delay: 480ms; \}/);
  assert.match(css, /\.faq-toggle:active \{[^}]*scaleY\(\.98\)/s);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("the accordion preserves state through repeated open and close toggles", () => {
  let clickHandler;
  const attributes = new Map([
    ["aria-controls", "faq-answer-1"],
    ["aria-expanded", "false"],
  ]);
  const answerAttributes = new Map([["aria-hidden", "true"]]);
  const answer = {
    inert: true,
    setAttribute(name, value) { answerAttributes.set(name, value); },
  };
  const card = {
    classList: {
      isOpen: false,
      toggle(name, force) {
        assert.equal(name, "is-open");
        this.isOpen = force;
      },
    },
  };
  const toggle = {
    addEventListener(type, handler) {
      assert.equal(type, "click");
      clickHandler = handler;
    },
    getAttribute(name) { return attributes.get(name); },
    setAttribute(name, value) { attributes.set(name, value); },
    closest(selector) {
      assert.equal(selector, ".faq-card");
      return card;
    },
  };

  vm.runInNewContext(script, {
    document: {
      querySelectorAll(selector) {
        assert.equal(selector, ".faq-toggle");
        return [toggle];
      },
      getElementById(id) {
        assert.equal(id, "faq-answer-1");
        return answer;
      },
    },
  });

  clickHandler();
  assert.equal(attributes.get("aria-expanded"), "true");
  assert.equal(answerAttributes.get("aria-hidden"), "false");
  assert.equal(answer.inert, false);
  assert.equal(card.classList.isOpen, true);

  clickHandler();
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(answerAttributes.get("aria-hidden"), "true");
  assert.equal(answer.inert, true);
  assert.equal(card.classList.isOpen, false);

  for (let index = 0; index < 6; index += 1) clickHandler();
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(answerAttributes.get("aria-hidden"), "true");
  assert.equal(answer.inert, true);
  assert.equal(card.classList.isOpen, false);
});

test("the FAQ navbar matches the approved main-page destinations", () => {
  assert.deepEqual(navLabels(mainHtml), ["Home", "Buku Panduan", "Peraturan", "FAQ"]);
  assert.deepEqual(navLabels(html), ["Home", "Buku Panduan", "Peraturan", "FAQ"]);
  assert.match(html, /<a href="\.\/" aria-current="page">FAQ<\/a>/);
});

test("the FAQ reuses the main-page footer markup exactly", () => {
  assert.equal(footerMarkup(html), footerMarkup(mainHtml));
});

test("the FAQ loads the shared site styles before its page-specific styles", () => {
  assert.match(html, /href="\.\.\/style\.css\?v=\d+"/);
  assert.match(html, /href="faq\.css\?v=\d+"/);
  assert.ok(html.indexOf('href="../style.css') < html.indexOf('href="faq.css'));
  assert.doesNotMatch(html, /href="site\.css/);
});

test("the responsive FAQ keeps the desktop fidelity contract and a deliberate mobile flow", () => {
  assert.match(css, /@media \(max-width: 1200px\) \{[\s\S]*?\.faq-main \{[^}]*height: auto;[^}]*padding: 80px 0 150px;/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.faq-card,[\s\S]*?width: calc\(100% - 24px\);/);
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.faq-answer-content \{[^}]*font-size: 15px;[^}]*text-align: left;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
