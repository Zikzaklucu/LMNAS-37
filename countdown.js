((root, factory) => {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.LmnasCountdown = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const padTwoDigits = (value) => String(value).padStart(2, "0");

  const formatCountdown = (target, now = new Date()) => {
    const remaining = Math.max(0, target.getTime() - now.getTime());
    const complete = remaining === 0;
    const days = Math.floor(remaining / DAY);
    const hours = Math.floor((remaining % DAY) / HOUR);
    const minutes = Math.floor((remaining % HOUR) / MINUTE);
    const seconds = Math.floor((remaining % MINUTE) / SECOND);

    return {
      value: `${days}:${padTwoDigits(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`,
      label: complete
        ? "Registrasi Gelombang I telah dibuka"
        : `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`,
      complete,
    };
  };

  const formatPhaseStatus = (start, end, now = new Date()) => {
    if (now < start) {
      return { key: "upcoming", label: "Akan datang" };
    }

    if (now <= end) {
      return { key: "active", label: "Sedang berlangsung" };
    }

    return { key: "complete", label: "Sudah selesai" };
  };

  const formatPhaseDateRange = (start, end) => {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    const textFormatter = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
    const numericFormatter = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
    const readParts = (formatter, date) => Object.fromEntries(
      formatter.formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    const startText = readParts(textFormatter, start);
    const endText = readParts(textFormatter, end);
    const startNumeric = readParts(numericFormatter, start);
    let label;

    if (startText.year === endText.year && startText.month === endText.month) {
      label = startText.day === endText.day
        ? `${startText.day} ${startText.month} ${startText.year}`
        : `${startText.day}–${endText.day} ${startText.month} ${startText.year}`;
    } else if (startText.year === endText.year) {
      label = `${startText.day} ${startText.month}–${endText.day} ${endText.month} ${startText.year}`;
    } else {
      label = `${startText.day} ${startText.month} ${startText.year}–${endText.day} ${endText.month} ${endText.year}`;
    }

    return {
      datetime: `${startNumeric.year}-${startNumeric.month}-${startNumeric.day}`,
      label,
    };
  };

  return { formatCountdown, formatPhaseDateRange, formatPhaseStatus };
});
