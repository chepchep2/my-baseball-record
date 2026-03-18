import { getGameById, getTodayValue, mockGames } from "@/lib/mock-games";

export const DRAFT_USER_ID = "demo-user";
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const batterGroups = [
  {
    key: "basic",
    label: "기본 구성",
    fields: [
      ["plateAppearances", "타석"],
      ["atBats", "타수"],
      ["singles", "1루타"],
      ["doubles", "2루타"],
      ["triples", "3루타"],
      ["homeRuns", "홈런"],
    ],
  },
  {
    key: "extra",
    label: "추가 구성",
    fields: [
      ["walks", "볼넷"],
      ["strikeOuts", "삼진"],
      ["hitByPitch", "사구"],
      ["runsBattedIn", "타점"],
      ["runs", "득점"],
      ["stolenBases", "도루"],
      ["caughtStealing", "도루자"],
      ["sacrificeHits", "희생타"],
    ],
  },
];

export const pitcherGroups = [
  {
    key: "innings",
    label: "기본 구성",
    fields: [
      ["innings", "이닝", "number"],
      ["additionalOuts", "추가 아웃 수", "select"],
      ["runsAllowed", "실점", "number"],
      ["earnedRuns", "자책", "number"],
      ["hitsAllowed", "피안타", "number"],
      ["walks", "볼넷", "number"],
    ],
  },
  {
    key: "extra",
    label: "추가 구성",
    fields: [
      ["strikeOuts", "삼진", "number"],
      ["hitByPitch", "사구", "number"],
      ["homeRunsAllowed", "피홈런", "number"],
      ["battersFaced", "상대한 타자 수", "number"],
      ["wins", "승", "number"],
      ["losses", "패", "number"],
      ["saves", "세이브", "number"],
      ["holds", "홀드", "number"],
    ],
  },
];

function createEmptyBatter() {
  return {
    plateAppearances: "",
    atBats: "",
    singles: "",
    doubles: "",
    triples: "",
    homeRuns: "",
    walks: "",
    strikeOuts: "",
    hitByPitch: "",
    runsBattedIn: "",
    runs: "",
    stolenBases: "",
    caughtStealing: "",
    sacrificeHits: "",
  };
}

function createEmptyPitcher() {
  return {
    innings: "",
    additionalOuts: "",
    runsAllowed: "",
    earnedRuns: "",
    hitsAllowed: "",
    walks: "",
    strikeOuts: "",
    hitByPitch: "",
    homeRunsAllowed: "",
    battersFaced: "",
    wins: "",
    losses: "",
    saves: "",
    holds: "",
  };
}

export function buildEmptyGameForm() {
  const today = getTodayValue();
  return {
    gameDate: today,
    gameType: "LEAGUE",
    seasonYear: today.slice(0, 4),
    teamName: "",
    opponentName: "",
    memo: "",
    showOptionalInfo: false,
    step: "info",
    recordTab: "batter",
    batterGroupIndex: 0,
    pitcherGroupIndex: 0,
    batter: createEmptyBatter(),
    pitcher: createEmptyPitcher(),
  };
}

export function buildFormFromGame(game) {
  const base = buildEmptyGameForm();
  return {
    ...base,
    gameDate: game.playedAt,
    gameType: game.gameType,
    seasonYear: String(game.seasonYear),
    teamName: game.teamName ?? "",
    opponentName: game.opponentName ?? "",
    memo: game.memo ?? "",
    showOptionalInfo: Boolean(game.teamName || game.opponentName || game.memo),
    recordTab: game.participationType === "PITCHER" ? "pitcher" : "batter",
    batter: {
      ...base.batter,
      ...(game.batter ?? {}),
    },
    pitcher: {
      ...base.pitcher,
      ...(game.pitcher ?? {}),
    },
  };
}

export function getInitialFormValues(mode, gameId) {
  if (mode === "edit" && gameId) {
    const game = getGameById(mockGames, gameId);
    if (game) {
      return buildFormFromGame(game);
    }
  }

  return buildEmptyGameForm();
}

export function buildDraftKey(mode, userId, gameId) {
  if (mode === "edit" && gameId) {
    return `draft:edit:${userId}:${gameId}`;
  }

  return `draft:create:${userId}`;
}
