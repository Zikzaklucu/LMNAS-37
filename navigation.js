(() => {
  "use strict";

  const desktopQuery = window.matchMedia("(min-width: 641px)");

  document.querySelectorAll(".site-header").forEach((header) => {
    const toggle = header.querySelector(".nav-toggle");
    const navigation = header.querySelector("nav");
    const label = toggle?.firstElementChild;

    if (!toggle || !navigation || !label) return;

    const setOpen = (open, { restoreFocus = false } = {}) => {
      const shouldOpen = open && !desktopQuery.matches;
      header.toggleAttribute("data-nav-open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      label.textContent = shouldOpen ? "Tutup" : "Menu";

      if (!shouldOpen && restoreFocus && toggle.offsetParent !== null) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      setOpen(!header.hasAttribute("data-nav-open"));
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (header.hasAttribute("data-nav-open") && !header.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.hasAttribute("data-nav-open")) {
        setOpen(false, { restoreFocus: true });
      }
    });

    desktopQuery.addEventListener("change", () => setOpen(false));
    header.setAttribute("data-nav-ready", "");
    setOpen(false);
  });
})();
