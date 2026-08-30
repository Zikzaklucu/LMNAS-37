"use strict";

const toggles = document.querySelectorAll(".faq-toggle");

const setPanelState = (toggle, answer, card, shouldOpen) => {
  toggle.setAttribute("aria-expanded", String(shouldOpen));
  card.classList.toggle("is-open", shouldOpen);
  answer.setAttribute("aria-hidden", String(!shouldOpen));
  answer.inert = !shouldOpen;
};

for (const toggle of toggles) {
  toggle.addEventListener("click", () => {
    const answerId = toggle.getAttribute("aria-controls");
    const answer = document.getElementById(answerId);
    const card = toggle.closest(".faq-card");

    if (!answer || !card) return;

    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setPanelState(toggle, answer, card, !isOpen);
  });
}
