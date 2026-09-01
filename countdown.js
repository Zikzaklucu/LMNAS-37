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

  const getPhaseWindowState = (start, end, now) => {
    if (now < start) {
      return "upcoming";
    }

    if (now <= end) {
      return "active";
    }

    return "complete";
  };

  const formatCountdown = (target, now = new Date()) => {
    const remaining = Math.max(0, target.getTime() - now.getTime());
    const complete = remaining === 0;
    const days = Math.floor(remaining / DAY);
    const hours = Math.floor((remaining % DAY) / HOUR);
    const minutes = Math.floor((remaining % HOUR) / MINUTE);
    const seconds = Math.floor((remaining % MINUTE) / SECOND);

    return {
      value: `${days}:${padTwoDigits(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`,
      label: `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`,
      complete,
    };
  };

  const resolveRegistrationPhase = (now = new Date(), config = {}) => {
    const current = now instanceof Date ? now : new Date(now);
    const phases = config.phases || {};
    const waveOne = phases["registration-one"] || {};
    const waveTwo = phases["registration-two"] || {};
    const waveOneStart = new Date(waveOne.start);
    const waveOneEnd = new Date(waveOne.end);
    const waveTwoStart = new Date(waveTwo.start);
    const waveTwoEnd = new Date(waveTwo.end);
    const waveOneState = getPhaseWindowState(waveOneStart, waveOneEnd, current);
    const waveTwoState = getPhaseWindowState(waveTwoStart, waveTwoEnd, current);

    // End timestamps are inclusive. The next state starts immediately after them.
    if (waveOneState === "upcoming") {
      return {
        key: "BEFORE_WAVE_1",
        kicker: "Menuju",
        title: "Registrasi Gelombang I",
        countdownTarget: waveOne.start,
        countdownLabel: "Registrasi Gelombang I",
        showCountdown: true,
      };
    }

    if (waveOneState === "active") {
      return {
        key: "WAVE_1_OPEN",
        kicker: "Registrasi Gelombang I",
        title: "Berakhir dalam",
        countdownTarget: waveOne.end,
        countdownLabel: "Registrasi Gelombang I — berakhir dalam",
        showCountdown: true,
      };
    }

    if (waveTwoState === "upcoming") {
      return {
        key: "BEFORE_WAVE_2",
        kicker: "Menuju",
        title: "Registrasi Gelombang II",
        countdownTarget: waveTwo.start,
        countdownLabel: "Registrasi Gelombang II",
        showCountdown: true,
      };
    }

    if (waveTwoState === "active") {
      return {
        key: "WAVE_2_OPEN",
        kicker: "Registrasi Gelombang II",
        title: "Berakhir dalam",
        countdownTarget: waveTwo.end,
        countdownLabel: "Registrasi Gelombang II — berakhir dalam",
        showCountdown: true,
      };
    }

    return {
      key: "REGISTRATION_CLOSED",
      kicker: "Registrasi",
      title: "LMNas 37 telah ditutup",
      countdownTarget: null,
      countdownLabel: "Registrasi LMNas 37 telah ditutup",
      showCountdown: false,
    };
  };

  const formatPhaseStatus = (start, end, now = new Date()) => {
    const key = getPhaseWindowState(start, end, now);
    const labels = {
      upcoming: "Akan datang",
      active: "Sedang berlangsung",
      complete: "Sudah selesai",
    };

    return { key, label: labels[key] };
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

  return {
    formatCountdown,
    formatPhaseDateRange,
    formatPhaseStatus,
    resolveRegistrationPhase,
  };
});
