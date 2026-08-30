(() => {
  "use strict";

  const config = window.LMNAS_SITE_CONFIG;
  const countdown = window.LmnasCountdown;

  if (!config) {
    return;
  }

  document.querySelectorAll("[data-registration-link]").forEach((link) => {
    if (config.registration?.url) {
      link.href = config.registration.url;
    }
  });

  const countdownDisplay = document.querySelector("[data-countdown-target]");
  const countdownTitle = document.getElementById("countdown-title");
  if (countdownDisplay && countdownTitle && config.countdown?.target) {
    countdownDisplay.dataset.countdownTarget = config.countdown.target;
    countdownDisplay.dataset.countdownLabel = config.countdown.label;
    countdownTitle.textContent = config.countdown.label;
  }

  document.querySelectorAll("[data-phase-key]").forEach((phase) => {
    const dates = config.phases?.[phase.dataset.phaseKey];
    if (dates?.start && dates?.end) {
      phase.dataset.phaseStart = dates.start;
      phase.dataset.phaseEnd = dates.end;

      const visibleDate = phase.querySelector("time");
      const formattedDate = countdown?.formatPhaseDateRange(
        new Date(dates.start),
        new Date(dates.end),
      );
      if (visibleDate && formattedDate) {
        visibleDate.dateTime = formattedDate.datetime;
        visibleDate.textContent = formattedDate.label;
      }
    }
  });
})();


(() => {
  "use strict";

  const links = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
  const sections = [...new Map(links.map((link) => {
    const id = link.hash.slice(1);
    return [id, document.getElementById(id)];
  })).values()].filter(Boolean);

  if (!links.length || !sections.length) {
    return;
  }

  const setCurrent = (id) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  setCurrent(location.hash.slice(1) || sections[0].id);

  links.forEach((link) => {
    link.addEventListener("click", () => setCurrent(link.hash.slice(1)));
  });

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const current = entries.find((entry) => entry.isIntersecting);
    if (current) {
      setCurrent(current.target.id);
    }
  }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

  sections.forEach((section) => observer.observe(section));
})();

(() => {
  "use strict";

  const countdown = window.LmnasCountdown;
  const phases = document.querySelectorAll("[data-phase-start][data-phase-end]");

  if (!countdown || !phases.length) {
    return;
  }

  const updatePhaseStatuses = () => {
    phases.forEach((phase) => {
      const start = new Date(phase.dataset.phaseStart);
      const end = new Date(phase.dataset.phaseEnd);
      const status = phase.querySelector(".timeline-status");

      if (!status || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return;
      }

      const state = countdown.formatPhaseStatus(start, end);
      status.textContent = state.label;
      status.className = `timeline-status timeline-status--${state.key}`;
    });
  };

  updatePhaseStatuses();
  window.setInterval(updatePhaseStatuses, 60_000);
})();

(() => {
  "use strict";

  const display = document.querySelector("[data-countdown-target]");
  const countdown = window.LmnasCountdown;

  if (!display || !countdown) {
    return;
  }

  const target = new Date(display.dataset.countdownTarget);
  const countdownLabel = display.dataset.countdownLabel || "Registrasi Gelombang I";

  if (Number.isNaN(target.getTime())) {
    return;
  }

  let timerId;
  const countdownParts = ["days", "hours", "minutes", "seconds"].map((part) => (
    typeof display.querySelector === "function"
      ? display.querySelector(`[data-countdown-part="${part}"]`)
      : null
  ));
  const hasStructuredDisplay = countdownParts.every(Boolean);
  const updateCountdown = () => {
    const state = countdown.formatCountdown(target);
    if (hasStructuredDisplay) {
      state.value.split(":").forEach((value, index) => {
        countdownParts[index].textContent = value;
      });
    } else {
      display.textContent = state.value;
    }
    display.setAttribute("aria-label", `${countdownLabel}: ${state.label}`);

    if (state.complete && timerId) {
      window.clearInterval(timerId);
    }
  };

  updateCountdown();

  if (Date.now() < target.getTime()) {
    timerId = window.setInterval(updateCountdown, 1000);
  }
})();

(() => {
  "use strict";

  const root = document.querySelector("[data-testimonial-carousel]");
  if (!root) return;

  const slides = [...root.querySelectorAll("[data-carousel-slide]")];
  const track = root.querySelector("[data-carousel-track]");
  const viewport = root.querySelector("[data-carousel-viewport]");
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const dots = [...root.querySelectorAll("[data-carousel-dot]")];
  const status = root.querySelector("[data-carousel-status]");
  const frame = "Assets/figma/portrait-frame.png";
  const testimonials = [
    {
      name: "Aldan Azahwan Ikhsan",
      placement: "Juara 2 SMA",
      photo: "Assets/figma/testimonial-aldan.jpg?v=2",
      nameSize: 96,
      quote: "Assalamualaikum warahmatullahi wabarakatuh. Perkenalkan, nama saya Aldan Azahwan Ikhsan. Saya sekarang bersekolah di SMA Karisma Bangsa. Saya merupakan peserta LMNas 35 dan LMNas 36, di mana di LMNas 35 saya mendapatkan medali emas di jenjang SMP, dan di LMNas 36 saya mendapatkan medali perunggu di jenjang SMA. Kesan saya untuk LMNas 36 kemarin adalah lomba yang sangat <em>challenging</em> karena soalnya susah dan lawan-lawannya berat. Namun, lombanya tetap seru karena saya bisa bertemu banyak orang yang keren, pintar, dan seru. Pesan saya untuk peserta tahun ini adalah kalian harus mempersiapkan lomba ini secara maksimal. Namun, tetap harus <em>have fun</em> ya. <em>I know you guys can do it.</em> Semangat ya",
    },
    {
      name: "Rama Maheswara Pradnya Kusala",
      placement: "Juara 1 SMP",
      photo: "Assets/figma/testimonial-rama-790d8f.png",
      nameSize: 90,
      quote: "Perkenalkan, nama saya Rama Maheswara Pradnya Kusala dari SMP Negeri 1 Boyolali. Saya sangat bangga bisa menjadi bagian dari LMNas 36, karena LMNas adalah kompetisi yang berkelas, mulai dari soalnya yang berbobot, pesertanya yang kompetitif, dan juga hadiahnya yang fantastis. Harapan saya untuk LMNas 37 adalah dapat berjalan lancar seperti biasanya dan juga soal-soalnya yang lebih bervariasi lagi. Sekian dari saya, terima kasih.",
    },
    {
      name: "Jeremy Manuelle Gading",
      placement: "Juara 2 SMP",
      photo: "Assets/figma/testimonial-jeremy-7f6210.png",
      nameSize: 96,
      quote: "Halo semuanya, nama aku Jeremy Manuelle Gading. Aku merupakan peraih medali perak pada LMNas 36 pada tingkat SMP tahun lalu. Nah kali ini saya ingin memberikan beberapa pesan-pesan saya terkait tentang Lomba Matematika Nasional Universitas Gajah Mada atau bisa dikenal dengan LMNas UGM. Yang pasti yang pertama saya merasakan banyak sekali pertemanan yang terjadi, baik itu pertemanan di luar lomba dan di dalam lomba. Yang kedua, saya ingin terima kasih kepada tim Panitia yang telah berusaha sekeras-kerasnya untuk menindak terkait kecurangan. Karena kita pun tahu bahwa sportivitas dan tindakan kecurangan itu sangat-sangat tidak diizinkan di dalam lomba manapun. Dan yang terakhir, saya ingin mengucapkan terima kasih juga kepada tim Panitia yang telah menyusun secara sebaik-baik dari mereka. Itu saja, terima kasih.",
    },
    {
      name: "Janssen Samuel Halim",
      placement: "Juara 1 SMA",
      photo: "Assets/figma/testimonial-janssen-20f486.png",
      nameSize: 96,
      quote: "Halo semuanya, perkenalkan nama saya Janssen Samuel Halim sebagai juara 1 LMNas UGM yang ke-36. Kesan saya saat mengikuti LMNas UGM adalah setiap soal yang disajikan, baik dari babak penyisihan, semifinal, final, juga grand final, sangat berkualitas, menarik dan menantang untuk saya kerjakan, dan sangat menyenangkan untuk saya diskusikan dengan teman-teman saya. Setiap Panitia LMNas juga sangat berusaha keras dan juga dengan baik memenuhi segala kebutuhan peserta LMNas UGM. Pesan saya untuk setiap peserta LMNas UGM tahun ini adalah persiapkan diri dengan baik, belajar dengan giat, raihlah prestasi yang terbaik, dan jangan lupa berdoa. Terima kasih.",
    },
  ];

  slides.forEach((slide, index) => {
    const item = testimonials[index];
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.style.setProperty("--testimonial-name-size", `${item.nameSize}px`);
    slide.innerHTML = `<figure class="testimonial-card">
      <div class="testimonial-frame">
        <img class="testimonial-photo" src="${item.photo}" alt="Potret ${item.name}" loading="${index ? "lazy" : "eager"}" decoding="async" />
        <img class="testimonial-border" src="${frame}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </div>
      <figcaption>
        <div class="testimonial-name"><h3>${item.name}</h3></div>
        <p class="testimonial-award">${item.placement}</p>
        <blockquote class="testimonial-copy">${item.quote}</blockquote>
      </figcaption>
    </figure>`;
  });

  const BUTTON_DURATION = 520;
  const LONG_JUMP_DURATION = 620;
  const TRACK_EASE = "cubic-bezier(.65, 0, .35, 1)";
  const TOUCH_SETTLE_EASE = "cubic-bezier(.22, 1, .36, 1)";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let transitionToken = 0;
  let entryTimer = 0;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocityX = 0;
  let dragBaseX = 0;
  let dragging = false;
  let horizontalIntent = false;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(value, maximum));

  const clearIncoming = () => {
    window.clearTimeout(entryTimer);
    slides.forEach((slide) => slide.classList.remove("testimonial-slide--entering"));
  };

  const syncHeight = () => {
    const activeSlide = slides[activeIndex];
    if (!activeSlide) return;
    viewport.style.height = "";
    track.style.height = "";
    const height = activeSlide.scrollHeight;
    viewport.style.height = `${height}px`;
    track.style.height = `${height}px`;
  };

  const heightObserver = "ResizeObserver" in window
    ? new ResizeObserver(syncHeight)
    : null;
  slides.forEach((slide) => heightObserver?.observe(slide));

  const updateSemantics = () => {
    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.setAttribute("aria-label", `Testimoni ${index + 1} dari ${slides.length}`);
      slide.toggleAttribute("inert", !active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, index) => index === activeIndex ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current"));
    prev.disabled = activeIndex === 0;
    next.disabled = activeIndex === slides.length - 1;
    status.textContent = `Slide ${activeIndex + 1} dari ${slides.length}: ${testimonials[activeIndex].name}`;
  };

  const startIncoming = (index, token, cleanupDelay) => {
    const destination = slides[index];
    void destination.offsetWidth;
    destination.classList.add("testimonial-slide--entering");
    entryTimer = window.setTimeout(() => {
      if (transitionToken === token) destination.classList.remove("testimonial-slide--entering");
    }, cleanupDelay);
  };

  const update = (index, options = {}) => {
    const previousIndex = activeIndex;
    const destinationIndex = clamp(index, 0, slides.length - 1);
    const changed = destinationIndex !== previousIndex;
    if (!changed && !options.force) return;

    const distance = Math.abs(destinationIndex - previousIndex);
    const duration = options.duration ?? (distance > 1 ? LONG_JUMP_DURATION : BUTTON_DURATION);
    const easing = options.easing ?? TRACK_EASE;
    const animate = options.animate !== false && !reducedMotion.matches;
    const shouldEnter = options.entry !== false && (changed || options.forceEntry);
    const token = ++transitionToken;

    dragging = false;
    horizontalIntent = false;
    clearIncoming();
    if (changed) root.dataset.carouselDirection = destinationIndex > previousIndex ? "next" : "previous";
    root.style.setProperty("--testimonial-track-duration", `${duration}ms`);
    root.style.setProperty("--testimonial-track-ease", easing);
    track.style.transition = animate ? "" : "none";
    activeIndex = destinationIndex;
    syncHeight();
    track.style.transform = `translate3d(${-activeIndex * 100}%, 0, 0)`;
    updateSemantics();

    if (shouldEnter) {
      const cleanupDelay = reducedMotion.matches ? 170 : Math.max(duration, 520) + 80;
      startIncoming(activeIndex, token, cleanupDelay);
    }
  };

  const move = (delta) => update(activeIndex + delta);
  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => update(index)));
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  });

  const getTrackX = () => {
    const transform = window.getComputedStyle(track).transform;
    if (!transform || transform === "none") return -activeIndex * viewport.clientWidth;
    if ("DOMMatrixReadOnly" in window) return new DOMMatrixReadOnly(transform).m41;
    const values = transform.match(/matrix(?:3d)?\(([^)]+)\)/)?.[1].split(",").map(Number) || [];
    return values.length === 16 ? values[12] : values[4] || 0;
  };

  const resetGesture = () => {
    dragging = false;
    horizontalIntent = false;
    velocityX = 0;
  };

  const settleTouch = (commit, direction = 0) => {
    const speed = Math.abs(velocityX);
    const duration = reducedMotion.matches ? 0 : clamp(Math.round(480 - speed * 180), 280, 480);
    if (commit) {
      update(activeIndex + direction, {
        duration,
        easing: TOUCH_SETTLE_EASE,
        entry: true,
        force: true,
      });
    } else {
      update(activeIndex, {
        duration: reducedMotion.matches ? 0 : Math.min(duration, 360),
        easing: TOUCH_SETTLE_EASE,
        entry: false,
        force: true,
      });
    }
    resetGesture();
  };

  viewport.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    lastX = touch.clientX;
    lastTime = event.timeStamp;
    velocityX = 0;
    dragging = true;
    horizontalIntent = false;
  }, { passive: true });

  viewport.addEventListener("touchmove", (event) => {
    if (!dragging || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (!horizontalIntent) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        resetGesture();
        return;
      }
      horizontalIntent = true;
      dragBaseX = getTrackX();
      ++transitionToken;
      clearIncoming();
      track.style.transition = "none";
      track.style.transform = `translate3d(${dragBaseX}px, 0, 0)`;
    }

    event.preventDefault();
    const atStart = activeIndex === 0 && dx > 0;
    const atEnd = activeIndex === slides.length - 1 && dx < 0;
    const dragOffset = atStart || atEnd ? Math.sign(dx) * Math.min(Math.abs(dx) * .22, 28) : dx;
    const elapsed = Math.max(event.timeStamp - lastTime, 1);
    const instantVelocity = (touch.clientX - lastX) / elapsed;
    velocityX = velocityX * .25 + instantVelocity * .75;
    lastX = touch.clientX;
    lastTime = event.timeStamp;
    track.style.transform = `translate3d(${dragBaseX + dragOffset}px, 0, 0)`;
  }, { passive: false });

  viewport.addEventListener("touchend", (event) => {
    if (!dragging) return;
    if (!horizontalIntent || event.changedTouches.length !== 1) {
      resetGesture();
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const direction = dx < 0 ? 1 : -1;
    const atBoundary = (activeIndex === 0 && direction < 0) || (activeIndex === slides.length - 1 && direction > 0);
    const distanceCommit = Math.abs(dx) >= viewport.clientWidth * .15;
    const velocityCommit = Math.abs(dx) >= 12 && Math.abs(velocityX) >= .45;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    settleTouch(horizontal && !atBoundary && (distanceCommit || velocityCommit), direction);
  }, { passive: true });

  viewport.addEventListener("touchcancel", () => {
    if (dragging && horizontalIntent) settleTouch(false);
    else resetGesture();
  }, { passive: true });

  reducedMotion.addEventListener("change", () => update(activeIndex, {
    animate: false,
    entry: false,
    force: true,
  }));

  document.fonts?.ready.then(syncHeight);
  window.addEventListener("resize", syncHeight, { passive: true });

  root.classList.add("testimonial-carousel--ready");
  update(0, { animate: false, entry: false, force: true });
})();
