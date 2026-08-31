(() => {
  "use strict";

  const desktopQuery = window.matchMedia("(min-width: 641px)");

  document.querySelectorAll(".site-header").forEach((header) => {
    const toggle = header.querySelector(".nav-toggle");
    const navigation = header.querySelector("nav");
    const label = toggle?.firstElementChild;
    const contact = header.querySelector(".nav-contact");
    const contactToggle = contact?.querySelector(".nav-contact-toggle");
    const contactMenu = contact?.querySelector(".nav-contact-menu");

    if (!toggle || !navigation || !label) return;

    const setContactOpen = (open, { restoreFocus = false } = {}) => {
      if (!contactToggle || !contactMenu) return;

      contactMenu.hidden = !open;
      contactToggle.setAttribute("aria-expanded", String(open));
      if (!open && restoreFocus) contactToggle.focus();
    };

    const setOpen = (open, { restoreFocus = false } = {}) => {
      const shouldOpen = open && !desktopQuery.matches;
      header.toggleAttribute("data-nav-open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      label.textContent = shouldOpen ? "Tutup" : "Menu";

      if (!shouldOpen) setContactOpen(false);

      if (!shouldOpen && restoreFocus && toggle.offsetParent !== null) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      setOpen(!header.hasAttribute("data-nav-open"));
    });

    contactToggle?.addEventListener("click", () => {
      setContactOpen(contactMenu.hidden);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setContactOpen(false);
        setOpen(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (contactMenu && !contactMenu.hidden && !contact.contains(event.target)) {
        setContactOpen(false);
      }

      if (header.hasAttribute("data-nav-open") && !header.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      if (contactMenu && !contactMenu.hidden) {
        setContactOpen(false, { restoreFocus: true });
      } else if (header.hasAttribute("data-nav-open")) {
        setOpen(false, { restoreFocus: true });
      }
    });

    desktopQuery.addEventListener("change", () => setOpen(false));
    header.setAttribute("data-nav-ready", "");
    setOpen(false);
  });
})();
