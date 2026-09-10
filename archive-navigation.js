(() => {
  "use strict";

  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 641px)");
  document.querySelectorAll(".nav-papers").forEach((archive) => {
    const summary = archive.querySelector("summary");
    const header = archive.closest(".site-header");
    const close = () => { archive.open = false; };

    // Change the native open state, not merely visual visibility.
    archive.addEventListener("pointerenter", (event) => {
      if (hoverQuery.matches && event.pointerType === "mouse") archive.open = true;
    });
    archive.addEventListener("pointerleave", () => {
      if (hoverQuery.matches && !archive.contains(document.activeElement)) close();
    });
    archive.addEventListener("focusout", (event) => {
      if (!archive.contains(event.relatedTarget) && !archive.matches(":hover")) close();
    });
    document.addEventListener("click", (event) => {
      if (!archive.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && archive.open) {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        summary.focus();
      }
    }, { capture: true });
    archive.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    header?.querySelector(".nav-toggle")?.addEventListener("click", close);
    hoverQuery.addEventListener("change", close);
  });
})();
