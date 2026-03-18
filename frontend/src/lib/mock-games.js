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

export function getGameById(games, gameId) {
  return games.find((game) => String(game.id) === String(gameId)) || null;
}

export const mockGames = [
  {
    id: 101,
    playedAt: "2026-03-05",
    updatedAt: "2026-03-05T20:20:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "BATTER",
    teamName: "블루스톰",
    opponentName: "레전드",
    memo: "초반 추격전이 있었던 경기",
    batter: {
      plateAppearances: 4,
      atBats: 3,
      singles: 2,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 1,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 1,
      runs: 1,
      stolenBases: 1,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: null,
  },
  {
    id: 102,
    playedAt: "2026-03-12",
    updatedAt: "2026-03-12T21:05:00+09:00",
    seasonYear: 2026,
    gameType: "NON_OFFICIAL",
    participationType: "PITCHER",
    teamName: "블루스톰",
    opponentName: "스카이워커스",
    memo: "짧게 던진 불펜 등판",
    batter: null,
    pitcher: {
      innings: 2,
      additionalOuts: 0,
      runsAllowed: 1,
      earnedRuns: 1,
      hitsAllowed: 2,
      walks: 1,
      strikeOuts: 2,
      hitByPitch: 0,
      homeRunsAllowed: 0,
      battersFaced: 9,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 0,
    },
  },
  {
    id: 103,
    playedAt: "2026-03-18",
    updatedAt: "2026-03-18T21:10:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "BOTH",
    teamName: "블루스톰",
    opponentName: "레전드",
    memo: "비 오는 날 경기",
    batter: {
      plateAppearances: 4,
      atBats: 3,
      singles: 1,
      doubles: 1,
      triples: 0,
      homeRuns: 1,
      walks: 1,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 3,
      runs: 2,
      stolenBases: 0,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: {
      innings: 1,
      additionalOuts: 0,
      runsAllowed: 0,
      earnedRuns: 0,
      hitsAllowed: 1,
      walks: 0,
      strikeOuts: 2,
      hitByPitch: 0,
      homeRunsAllowed: 0,
      battersFaced: 4,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 0,
    },
  },
  {
    id: 104,
    playedAt: "2026-03-18",
    updatedAt: "2026-03-18T19:40:00+09:00",
    seasonYear: 2026,
    gameType: "NON_OFFICIAL",
    participationType: "BATTER",
    teamName: "블루스톰",
    opponentName: "오로라",
    memo: "저녁 연습 경기",
    batter: {
      plateAppearances: 5,
      atBats: 4,
      singles: 1,
      doubles: 2,
      triples: 0,
      homeRuns: 0,
      walks: 1,
      strikeOuts: 1,
      hitByPitch: 0,
      runsBattedIn: 2,
      runs: 2,
      stolenBases: 0,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: null,
  },
  {
    id: 105,
    playedAt: "2026-03-22",
    updatedAt: "2026-03-22T19:30:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "PITCHER",
    teamName: "블루스톰",
    opponentName: "파이어버즈",
    memo: "마지막 이닝을 책임진 경기",
    batter: null,
    pitcher: {
      innings: 3,
      additionalOuts: 1,
      runsAllowed: 2,
      earnedRuns: 2,
      hitsAllowed: 4,
      walks: 1,
      strikeOuts: 3,
      hitByPitch: 0,
      homeRunsAllowed: 1,
      battersFaced: 14,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 1,
    },
  },
  {
    id: 106,
    playedAt: "2026-03-22",
    updatedAt: "2026-03-22T18:15:00+09:00",
    seasonYear: 2026,
    gameType: "NON_OFFICIAL",
    participationType: "BATTER",
    teamName: "블루스톰",
    opponentName: "스톰브레이커스",
    memo: "컨디션 점검용 연습 경기",
    batter: {
      plateAppearances: 4,
      atBats: 4,
      singles: 1,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      strikeOuts: 1,
      hitByPitch: 0,
      runsBattedIn: 1,
      runs: 1,
      stolenBases: 1,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: null,
  },
  {
    id: 107,
    playedAt: "2026-03-22",
    updatedAt: "2026-03-22T20:55:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "BOTH",
    teamName: "블루스톰",
    opponentName: "타이거즈",
    memo: "양쪽 기록이 모두 남은 경기",
    batter: {
      plateAppearances: 3,
      atBats: 2,
      singles: 1,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 1,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 1,
      runs: 1,
      stolenBases: 0,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: {
      innings: 2,
      additionalOuts: 2,
      runsAllowed: 1,
      earnedRuns: 1,
      hitsAllowed: 3,
      walks: 0,
      strikeOuts: 1,
      hitByPitch: 0,
      homeRunsAllowed: 0,
      battersFaced: 11,
      wins: 1,
      losses: 0,
      saves: 0,
      holds: 0,
    },
  },
  {
    id: 108,
    playedAt: "2026-03-25",
    updatedAt: "2026-03-25T21:20:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "BATTER",
    teamName: "블루스톰",
    opponentName: "드래곤즈",
    memo: "장타가 많이 나온 경기",
    batter: {
      plateAppearances: 5,
      atBats: 4,
      singles: 1,
      doubles: 1,
      triples: 0,
      homeRuns: 1,
      walks: 1,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 4,
      runs: 3,
      stolenBases: 0,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: null,
  },
  {
    id: 109,
    playedAt: "2026-03-25",
    updatedAt: "2026-03-25T19:05:00+09:00",
    seasonYear: 2026,
    gameType: "NON_OFFICIAL",
    participationType: "PITCHER",
    teamName: "블루스톰",
    opponentName: "썬더스",
    memo: "중간 계투로 세이브 상황 유지",
    batter: null,
    pitcher: {
      innings: 1,
      additionalOuts: 2,
      runsAllowed: 0,
      earnedRuns: 0,
      hitsAllowed: 1,
      walks: 0,
      strikeOuts: 1,
      hitByPitch: 0,
      homeRunsAllowed: 0,
      battersFaced: 5,
      wins: 0,
      losses: 0,
      saves: 1,
      holds: 0,
    },
  },
  {
    id: 110,
    playedAt: "2026-03-25",
    updatedAt: "2026-03-25T22:10:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "BOTH",
    teamName: "블루스톰",
    opponentName: "아스트로즈",
    memo: "공수 모두 기록이 남은 경기",
    batter: {
      plateAppearances: 4,
      atBats: 4,
      singles: 2,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 2,
      runs: 2,
      stolenBases: 1,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: {
      innings: 4,
      additionalOuts: 0,
      runsAllowed: 1,
      earnedRuns: 1,
      hitsAllowed: 3,
      walks: 1,
      strikeOuts: 4,
      hitByPitch: 0,
      homeRunsAllowed: 0,
      battersFaced: 16,
      wins: 1,
      losses: 0,
      saves: 0,
      holds: 0,
    },
  },
  {
    id: 111,
    playedAt: "2026-03-25",
    updatedAt: "2026-03-25T17:45:00+09:00",
    seasonYear: 2026,
    gameType: "NON_OFFICIAL",
    participationType: "BATTER",
    teamName: "블루스톰",
    opponentName: "매그넘",
    memo: "짧은 이닝만 소화한 경기",
    batter: {
      plateAppearances: 2,
      atBats: 2,
      singles: 0,
      doubles: 1,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 1,
      runs: 0,
      stolenBases: 0,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: null,
  },
  {
    id: 112,
    playedAt: "2026-04-02",
    updatedAt: "2026-04-02T20:25:00+09:00",
    seasonYear: 2026,
    gameType: "LEAGUE",
    participationType: "BATTER",
    teamName: "블루스톰",
    opponentName: "이글스",
    memo: "다음 달 경기 예시",
    batter: {
      plateAppearances: 4,
      atBats: 3,
      singles: 1,
      doubles: 1,
      triples: 0,
      homeRuns: 0,
      walks: 1,
      strikeOuts: 0,
      hitByPitch: 0,
      runsBattedIn: 2,
      runs: 1,
      stolenBases: 0,
      caughtStealing: 0,
      sacrificeHits: 0,
    },
    pitcher: null,
  },
];
