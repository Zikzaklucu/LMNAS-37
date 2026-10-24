(() => {
  "use strict";

  const trigger = document.querySelector("[data-answer-key-open]");
  const dialog = document.getElementById("answer-key-dialog");
  if (!trigger || !dialog || typeof dialog.showModal !== "function") return;

  const config = window.LMNAS_SITE_CONFIG || {};
  const renderLinks = (selector, levelKey, documents, label) => {
    dialog.querySelectorAll(selector).forEach((slot) => {
      const level = slot.dataset[levelKey];
      const value = documents?.[level];
      if (typeof value !== "string" || !value.trim()) return;

      let url;
      try {
        url = new URL(value, document.baseURI);
      } catch {
        return;
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") return;

      const link = document.createElement("a");
      link.className = "answer-key-link";
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `Lihat ${label} ${level.toUpperCase()}`;
      slot.replaceChildren(link);
    });
  };
  renderLinks("[data-answer-key-level]", "answerKeyLevel", config.answerKeys, "Kunci Jawaban");
  renderLinks("[data-preliminary-paper-level]", "preliminaryPaperLevel", config.preliminaryPapers, "Soal");

  trigger.addEventListener("click", () => {
    if (dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add("answer-key-modal-open");
  });
  const restorePage = () => {
    // A queued close event from an earlier opening must not unlock a new modal.
    if (dialog.open) return;
    document.documentElement.classList.remove("answer-key-modal-open");
    trigger.focus({ preventScroll: true });
  };
  const closeDialog = () => {
    dialog.close();
    restorePage();
  };
  dialog.querySelector("[data-answer-key-close]").addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("close", restorePage);

  const isBackdrop = (event) => {
    if (event.target !== dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  let startedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    startedOnBackdrop = isBackdrop(event);
  });
  dialog.addEventListener("click", (event) => {
    if (startedOnBackdrop && isBackdrop(event)) closeDialog();
    startedOnBackdrop = false;
  });
  trigger.hidden = false;
})();
