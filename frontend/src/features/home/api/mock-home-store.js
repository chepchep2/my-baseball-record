const STORAGE_KEY = "milestone-1.mock-games";

function readRawGames() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
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
  const games = readRawGames();
  if (games.length === 0) {
    return {
      seasonSummary: {
        battingAverage: "0.000",
        ops: "0.000",
        hits: 0,
        onBasePercentage: "0.000",
        sluggingPercentage: "0.000",
      },
      careerSummary: {
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
