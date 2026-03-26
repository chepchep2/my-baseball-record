function pad(value) {
  return String(value).padStart(2, "0");
}

export function roundUpToNextTenMinutes(date) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  next.setMinutes(Math.floor(next.getMinutes() / 10) * 10);
  return next;
}

export function formatEntryDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildEntryDraft(now = new Date()) {
  const rounded = roundUpToNextTenMinutes(now);

  return {
    date: formatEntryDate(rounded),
    hour: pad(rounded.getHours()),
    minute: pad(rounded.getMinutes()),
    plateAppearances: "0",
    walksAndHitByPitch: "0",
    singles: "0",
    doubles: "0",
    triples: "0",
    homeRuns: "0",
  };
}

export function getEntrySteps() {
  return [
    { step: 1, title: "날짜 + 시간" },
    { step: 2, title: "타석 + 사사구" },
    { step: 3, title: "1루타 + 2루타" },
    { step: 4, title: "3루타 + 홈런" },
  ];
}
