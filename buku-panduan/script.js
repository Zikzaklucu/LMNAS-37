"use strict";

(function initializeModule(globalScope, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.LMNAS_GUIDE = api;
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", api.init, { once: true });
    } else {
      api.init();
    }
  }
})(typeof window !== "undefined" ? window : null, function createGuideModule() {
  const definePage = (number, label) => Object.freeze({
    src: `assets/pages/page-${String(number).padStart(2, "0")}.webp`,
    label,
    width: 1190,
    height: 1684,
  });

  const PAGES = Object.freeze([
    definePage(1, "Sampul Buku Panduan LMNas 37"),
    definePage(2, "A. Pendahuluan"),
    definePage(3, "B. Persyaratan Peserta"),
    definePage(4, "C. Jadwal Pelaksanaan Lomba"),
    definePage(5, "D. Mekanisme Lomba — Babak Penyisihan, bagian 1"),
    definePage(6, "D. Mekanisme Lomba — Babak Penyisihan, bagian 2"),
    definePage(7, "D. Mekanisme Lomba — Babak Semifinal"),
    definePage(8, "D. Mekanisme Lomba — Babak Final"),
    definePage(9, "D. Mekanisme Lomba — Babak Grand Final"),
    definePage(10, "E. Materi Lomba"),
    definePage(11, "F. Penghargaan"),
    definePage(12, "G. Narahubung"),
    definePage(13, "Sampul belakang LMNas 37"),
  ]);

  function clampPage(page) {
    const parsed = Number.parseInt(page, 10);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(PAGES.length, Math.max(1, parsed));
  }

  function getSpreadIndex(page) {
    const current = clampPage(page);
    return current === 1 ? 0 : Math.ceil((current - 1) / 2);
  }

  function getVisibleRange(page, mode = "spread") {
    const current = clampPage(page);
    const spread = getSpreadIndex(current);

    if (mode === "single") {
      return { start: current, end: current, spread };
    }

    if (spread === 0) {
      return { start: 1, end: 1, spread: 0 };
    }

    const start = spread * 2;
    return { start, end: Math.min(PAGES.length, start + 1), spread };
  }

  function getAdjacentPage(page, direction, mode = "spread") {
    const current = clampPage(page);

    if (mode === "single") {
      const delta = direction === "previous" ? -1 : 1;
      return clampPage(current + delta);
    }

    const currentSpread = getSpreadIndex(current);
    const lastSpread = getSpreadIndex(PAGES.length);

    if (direction === "previous") {
      if (currentSpread === 0) return current;
      const targetSpread = currentSpread - 1;
      return targetSpread === 0 ? 1 : targetSpread * 2;
    }

    if (currentSpread === lastSpread) return current;
    return (currentSpread + 1) * 2;
  }

  function buildSheets() {
    const sheets = [];
    for (let index = 0; index < PAGES.length; index += 2) {
      sheets.push({
        front: PAGES[index],
        back: PAGES[index + 1] || null,
      });
    }
    return sheets;
  }

  function createPageFace(page, side) {
    const face = document.createElement("div");
    face.className = `page-face page-face--${side}`;

    if (!page) {
      face.classList.add("page-face--blank");
      face.setAttribute("aria-hidden", "true");
      return face;
    }

    const pageNumber = PAGES.indexOf(page) + 1;
    face.dataset.page = String(pageNumber);
    face.setAttribute("aria-hidden", "true");
    face.style.backgroundImage = `url("${page.src}")`;

    const image = document.createElement("img");
    image.src = page.src;
    image.alt = `${page.label}, halaman ${pageNumber} dari ${PAGES.length}`;
    image.width = page.width;
    image.height = page.height;
    image.loading = pageNumber <= 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;
    face.append(image);

    return face;
  }

  function renderBook(book) {
    const sheets = buildSheets();
    const fragment = document.createDocumentFragment();

    sheets.forEach((sheet, index) => {
      const paper = document.createElement("article");
      paper.className = "paper";
      paper.dataset.sheet = String(index);
      paper.style.zIndex = String(sheets.length - index);
      paper.append(createPageFace(sheet.front, "front"), createPageFace(sheet.back, "back"));
      fragment.append(paper);
    });

    book.replaceChildren(fragment);
    return Array.from(book.querySelectorAll(".paper"));
  }

  function init() {
    const reader = document.querySelector(".reader");
    const book = document.querySelector("[data-book]");
    const mobileImage = document.querySelector(".mobile-page");
    const status = document.querySelector(".reader-status");
    const zoomLink = document.querySelector(".reader-zoom");
    const previousButton = document.querySelector('[data-direction="previous"]');
    const nextButton = document.querySelector('[data-direction="next"]');
    const bookAnchor = document.querySelector(".book-anchor");

    if (!reader || !book || !mobileImage || !status || !zoomLink || !previousButton || !nextButton || !bookAnchor) {
      return;
    }

    const papers = renderBook(book);
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let currentPage = 1;
    let touchStartX = 0;
    let touchStartY = 0;
    let navigationVersion = 0;
    const preparedImages = new Map();
    let zoomAnimationFrame = 0;

    const getMode = () => (mobileQuery.matches ? "single" : "spread");

    function prepareImage(src) {
      if (preparedImages.has(src)) return preparedImages.get(src);

      const ready = new Promise((resolve) => {
        const image = new Image();
        let settled = false;

        const finish = (loaded) => {
          if (settled) return;
          settled = true;
          resolve(loaded);
        };

        const decodeIfReady = () => {
          if (typeof image.decode !== "function") {
            finish(image.naturalWidth > 0);
            return;
          }

          image.decode()
            .then(() => finish(image.naturalWidth > 0))
            .catch(() => finish(image.naturalWidth > 0));
        };

        image.addEventListener("load", decodeIfReady, { once: true });
        image.addEventListener("error", () => finish(false), { once: true });
        image.decoding = "async";
        image.src = src;

        if (image.complete) decodeIfReady();
      });

      preparedImages.set(src, ready);
      return ready;
    }

    function commitMobilePage(page, version) {
      if (mobileImage.getAttribute("src") === page.src) return;

      void prepareImage(page.src).then((loaded) => {
        if (!loaded || version !== navigationVersion) return;
        mobileImage.src = page.src;
      });
    }

    function preloadAdjacentPages(page, mode) {
      const adjacent = new Set([
        getAdjacentPage(page, "previous", mode),
        getAdjacentPage(page, "next", mode),
      ]);

      adjacent.forEach((number) => {
        if (number !== page) prepareImage(PAGES[number - 1].src);
      });
    }

    function setActiveFaces(root, range, mode) {
      root.querySelectorAll("[data-page]").forEach((face) => {
        const number = Number.parseInt(face.dataset.page, 10);
        const visible = mode === "single"
          ? false
          : number >= range.start && number <= range.end;
        face.setAttribute("aria-hidden", visible ? "false" : "true");
      });
    }

    function applyBookState(root, bookPapers, range, mode) {
      bookPapers.forEach((paper, index) => {
        const flipped = index < range.spread;
        paper.style.zIndex = String(flipped ? index + 1 : papers.length - index);
        paper.classList.toggle("is-flipped", flipped);
      });

      root.classList.toggle("is-closed-front", range.spread === 0);
      setActiveFaces(root, range, mode);
    }

    function getBounds(elements) {
      const rects = elements
        .map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      if (!rects.length) return null;

      return {
        top: Math.min(...rects.map((rect) => rect.top)),
        right: Math.max(...rects.map((rect) => rect.right)),
        bottom: Math.max(...rects.map((rect) => rect.bottom)),
        left: Math.min(...rects.map((rect) => rect.left)),
      };
    }

    function getVisibleBookBounds(mode, root = book) {
      if (mode === "single") return getBounds([mobileImage]);
      return getBounds([...root.querySelectorAll('.page-face[aria-hidden="false"]')]);
    }

    function getZoomPosition(bounds, mode) {
      if (!bounds) return null;
      const anchorRect = bookAnchor.getBoundingClientRect();
      const inset = mode === "single" ? 10 : 24;
      return {
        left: bounds.right - anchorRect.left - zoomLink.offsetWidth - inset,
        top: bounds.top - anchorRect.top + inset,
      };
    }

    function setZoomPosition(position) {
      if (!position) return;
      zoomLink.style.left = `${position.left}px`;
      zoomLink.style.right = "auto";
      zoomLink.style.top = `${position.top}px`;
    }

    function stopZoomAnimation() {
      if (zoomAnimationFrame) {
        cancelAnimationFrame(zoomAnimationFrame);
        zoomAnimationFrame = 0;
      }
      zoomLink.style.transition = "none";
      zoomLink.style.transform = "none";
    }

    function animateZoomButton(previousRect, position, mode) {
      stopZoomAnimation();
      if (!position) {
        setZoomPosition(getZoomPosition(getVisibleBookBounds(mode), mode));
        return;
      }

      setZoomPosition(position);
      const targetRect = zoomLink.getBoundingClientRect();
      const deltaX = previousRect.left - targetRect.left;
      const deltaY = previousRect.top - targetRect.top;

      if (reducedMotionQuery.matches) return;

      zoomLink.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      void zoomLink.offsetWidth;
      zoomAnimationFrame = requestAnimationFrame(() => {
        zoomLink.style.transition = "transform 400ms cubic-bezier(.22, 1, .36, 1)";
        zoomLink.style.transform = "none";
        zoomAnimationFrame = 0;
      });
    }

    function measureBookBounds(range, mode) {
      if (mode === "single") return getVisibleBookBounds(mode);

      const measurementBook = book.cloneNode(true);
      measurementBook.style.visibility = "hidden";
      measurementBook.style.pointerEvents = "none";
      measurementBook.style.transition = "none";
      const measurementPapers = [...measurementBook.querySelectorAll(".paper")];
      measurementPapers.forEach((paper) => {
        paper.style.transition = "none";
      });
      applyBookState(measurementBook, measurementPapers, range, mode);
      book.parentElement.append(measurementBook);
      const bounds = getVisibleBookBounds(mode, measurementBook);
      measurementBook.remove();
      return bounds;
    }

    function update({ positionZoom = true } = {}) {
      const mode = getMode();
      const range = getVisibleRange(currentPage, mode);

      applyBookState(book, papers, range, mode);

      const current = PAGES[currentPage - 1];
      mobileImage.alt = `${current.label}, halaman ${currentPage} dari ${PAGES.length}`;
      commitMobilePage(current, navigationVersion);
      preloadAdjacentPages(currentPage, mode);
      status.textContent = `Halaman ${currentPage} dari ${PAGES.length}`;

      previousButton.disabled = range.start === 1;
      nextButton.disabled = range.end === PAGES.length;

      if (positionZoom) {
        setZoomPosition(getZoomPosition(getVisibleBookBounds(mode), mode));
      }
    }

    function navigate(direction) {
      const mode = getMode();
      const nextPage = getAdjacentPage(currentPage, direction, mode);
      if (nextPage === currentPage) return;

      const nextRange = getVisibleRange(nextPage, mode);
      const previousButtonRect = zoomLink.getBoundingClientRect();
      const targetPosition = getZoomPosition(measureBookBounds(nextRange, mode), mode);

      navigationVersion += 1;
      currentPage = nextPage;
      update({ positionZoom: false });
      animateZoomButton(previousButtonRect, targetPosition, mode);
    }

    previousButton.addEventListener("click", () => navigate("previous"));
    nextButton.addEventListener("click", () => navigate("next"));

    reader.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate("previous");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate("next");
      }
    });

    reader.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    reader.addEventListener("touchend", (event) => {
      if (event.changedTouches.length !== 1) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
      navigate(deltaX < 0 ? "next" : "previous");
    }, { passive: true });

    mobileQuery.addEventListener("change", () => {
      stopZoomAnimation();
      update();
    });
    window.addEventListener("resize", () => {
      stopZoomAnimation();
      const mode = getMode();
      setZoomPosition(getZoomPosition(getVisibleBookBounds(mode), mode));
    }, { passive: true });
    reducedMotionQuery.addEventListener("change", () => {
      stopZoomAnimation();
      update();
    });
    update();
  }

  return Object.freeze({
    PAGES,
    buildSheets,
    getAdjacentPage,
    getSpreadIndex,
    getVisibleRange,
    init,
  });
});
