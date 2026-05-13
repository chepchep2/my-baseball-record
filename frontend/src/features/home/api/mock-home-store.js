const STORAGE_KEY = "milestone-1.mock-games";
const DEFAULT_MOCK_GAMES = [
  {
    id: 301,
    gameId: 301,
    playedAt: "2026-05-11",
    playedTime: "19:00",
    playedAtLabel: "5/11 19:00",
    plateAppearances: 4,
    walksAndHitByPitch: 1,
    singles: 1,
    doubles: 1,
    triples: 0,
    homeRuns: 0,
    hits: 2,
    battingAverage: "0.667",
  },
  {
    id: 302,
    gameId: 302,
    playedAt: "2026-05-04",
    playedTime: "14:10",
    playedAtLabel: "5/4 14:10",
    plateAppearances: 5,
    walksAndHitByPitch: 0,
    singles: 1,
    doubles: 0,
    triples: 0,
    homeRuns: 1,
    hits: 2,
    battingAverage: "0.400",
  },
  {
    id: 303,
    gameId: 303,
    playedAt: "2026-04-27",
    playedTime: "10:30",
    playedAtLabel: "4/27 10:30",
    plateAppearances: 3,
    walksAndHitByPitch: 1,
    singles: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
    hits: 0,
    battingAverage: "0.000",
  },
];

function readRawGames() {
  if (typeof window === "undefined") {
    return DEFAULT_MOCK_GAMES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_MOCK_GAMES;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MOCK_GAMES;
  } catch {
    return DEFAULT_MOCK_GAMES;
  }
}

function writeRawGames(games) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function toNumber(value) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toPlayedAtSortKey(game) {
  const playedDate = String(game.playedAt ?? "");
  const playedTime = String(game.playedTime ?? "00:00");
  return `${playedDate}T${playedTime}`;
}

function sortGamesByPlayedAtDesc(games) {
  return [...games].sort((left, right) => toPlayedAtSortKey(right).localeCompare(toPlayedAtSortKey(left)));
}

function formatAverage(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0.000";
  }

  return value.toFixed(3);
}

function summarizeGames(games) {
  const totals = games.reduce((acc, game) => {
    acc.hits += toNumber(game.hits);
    acc.plateAppearances += toNumber(game.plateAppearances);
    acc.walksAndHitByPitch += toNumber(game.walksAndHitByPitch);
    acc.singles += toNumber(game.singles);
    acc.doubles += toNumber(game.doubles);
    acc.triples += toNumber(game.triples);
    acc.homeRuns += toNumber(game.homeRuns);
    return acc;
  }, {
    hits: 0,
    plateAppearances: 0,
    walksAndHitByPitch: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
  });

  const atBats = Math.max(0, totals.plateAppearances - totals.walksAndHitByPitch);
  const totalBases = totals.singles + (totals.doubles * 2) + (totals.triples * 3) + (totals.homeRuns * 4);
  const battingAverage = formatAverage(atBats === 0 ? 0 : totals.hits / atBats);
  const onBasePercentage = formatAverage(totals.plateAppearances === 0 ? 0 : (totals.hits + totals.walksAndHitByPitch) / totals.plateAppearances);
  const sluggingPercentage = formatAverage(atBats === 0 ? 0 : totalBases / atBats);
  const ops = formatAverage(Number(onBasePercentage) + Number(sluggingPercentage));

  return {
    games: games.length,
    plateAppearances: totals.plateAppearances,
    walksAndHitByPitch: totals.walksAndHitByPitch,
    battingAverage,
    ops,
    hits: totals.hits,
    onBasePercentage,
    sluggingPercentage,
  };
}

export function readMockGames() {
  return readRawGames();
}

export function saveMockGame(record) {
  const next = [record, ...readRawGames()];
  writeRawGames(next);
  return record;
}

export function buildHomeDashboardData(selectedScope = "season") {
  const games = sortGamesByPlayedAtDesc(readRawGames());
  if (games.length === 0) {
    return {
      seasonSummary: {
        games: 0,
        plateAppearances: 0,
        walksAndHitByPitch: 0,
        battingAverage: "0.000",
        ops: "0.000",
        hits: 0,
        onBasePercentage: "0.000",
        sluggingPercentage: "0.000",
      },
      careerSummary: {
        games: 0,
        plateAppearances: 0,
        walksAndHitByPitch: 0,
        battingAverage: "0.000",
        ops: "0.000",
        hits: 0,
        onBasePercentage: "0.000",
        sluggingPercentage: "0.000",
      },
      recentGames: [],
      selectedScope,
      isEmpty: true,
    };
  }

  const currentYear = new Date().getFullYear();
  const seasonGames = games.filter((game) => Number(String(game.playedAt).slice(0, 4)) === currentYear);

  return {
    seasonSummary: summarizeGames(seasonGames),
    careerSummary: summarizeGames(games),
    recentGames: games.slice(0, 3),
    selectedScope,
    isEmpty: false,
  };
}
