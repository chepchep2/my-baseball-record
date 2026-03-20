const TIME_ZONE = "Asia/Seoul";

function pad(value) {
  return String(value).padStart(2, "0");
}

function getZonedDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = {};

  for (const part of formatter.formatToParts(date)) {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      parts[part.type] = part.value;
    }
  }

  return parts;
}

export function getTodayValue(date = new Date()) {
  const { year, month, day } = getZonedDateParts(date);
  return `${year}-${month}-${day}`;
}

export function formatDateValue(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseDateValue(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return { year, month, day };
}

export function shiftMonthValue(monthValue, offset) {
  const { year, month } = parseDateValue(monthValue);
  const nextMonth = new Date(Date.UTC(year, month - 1 + offset, 1));

  return formatDateValue(
    nextMonth.getUTCFullYear(),
    nextMonth.getUTCMonth() + 1,
    1,
  );
}

export function clampDateValueToMonth(dateValue, monthValue) {
  const { day } = parseDateValue(dateValue);
  const monthParts = parseDateValue(monthValue);
  const daysInMonth = getDaysInMonth(monthParts.year, monthParts.month);

  return formatDateValue(
    monthParts.year,
    monthParts.month,
    Math.min(day, daysInMonth),
  );
}

export function getDaysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function buildMonthGrid(monthValue) {
  const { year, month } = parseDateValue(monthValue);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = getDaysInMonth(year, month);
  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatDateValue(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function formatMonthTitle(monthValue) {
  const { year, month } = parseDateValue(monthValue);
  return `${year}년 ${month}월`;
}

export function formatCalendarDate(dateValue) {
  const { year, month, day } = parseDateValue(dateValue);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const weekdayLabel = ["일", "월", "화", "수", "목", "금", "토"][weekday];

  return `${year}.${pad(month)}.${pad(day)} (${weekdayLabel})`;
}

export function formatCardDate(dateValue) {
  const { year, month, day } = parseDateValue(dateValue);
  return `${year}.${pad(month)}.${pad(day)}`;
}

export function formatGameTypeLabel(gameType) {
  return gameType === "NON_OFFICIAL" ? "비공식 경기" : "리그 경기";
}

export function formatParticipationLabel(participationType) {
  if (participationType === "PITCHER") {
    return "투수";
  }

  if (participationType === "BOTH") {
    return "타자+투수";
  }

  return "타자";
}

export function formatPitchingInnings(innings, additionalOuts) {
  return `${innings}.${additionalOuts}`;
}

export function getGameCountBadge(count) {
  if (count <= 0) {
    return "";
  }

  if (count === 1) {
    return "1";
  }

  if (count === 2) {
    return "2";
  }

  return "+3";
}

export function buildGameCountMap(games) {
  return games.reduce((accumulator, game) => {
    accumulator[game.playedAt] = (accumulator[game.playedAt] || 0) + 1;
    return accumulator;
  }, {});
}

export function sortGamesForDate(games) {
  return [...games].sort((left, right) => {
    const playedAtDiff = right.playedAt.localeCompare(left.playedAt);

    if (playedAtDiff !== 0) {
      return playedAtDiff;
    }

    const updatedAtDiff = right.updatedAt.localeCompare(left.updatedAt);

    if (updatedAtDiff !== 0) {
      return updatedAtDiff;
    }

    return right.id - left.id;
  });
}

export function getGamesForDate(games, dateValue) {
  return sortGamesForDate(games.filter((game) => game.playedAt === dateValue));
}
