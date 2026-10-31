/* Homepage announcement: pending until the official URL is configured. */
(function () {
  "use strict";
  const notice = document.querySelector("[data-preliminary-announcement]");
  if (!notice) return;
  notice.querySelector("[data-announcement-close]").addEventListener("click", function () {
    notice.hidden = true;
  });
  const url = window.LMNAS_SITE_CONFIG?.preliminaryAnnouncement?.url;
  if (typeof url !== "string" || !(url.toLowerCase().startsWith("https://") || url.toLowerCase().startsWith("http://"))) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
    const link = document.createElement("a");
    link.href = parsed.href;
    link.textContent = "Lihat pengumuman";
    notice.querySelector("[data-announcement-body]").replaceChildren(link);
  } catch (_) {
    // Invalid or unavailable URL: retain the visible pending copy.
  }
})();
