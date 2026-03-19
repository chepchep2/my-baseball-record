const DELETED_GAMES_KEY = "deleted:games";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readDeletedGameIds() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(DELETED_GAMES_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((value) => String(value));
  } catch {
    return [];
  }
}

function writeDeletedGameIds(ids) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(DELETED_GAMES_KEY, JSON.stringify(ids));
}

export function isGameDeleted(gameId) {
  return readDeletedGameIds().includes(String(gameId));
}

export function markGameDeleted(gameId) {
  const nextIds = Array.from(new Set([...readDeletedGameIds(), String(gameId)]));
  writeDeletedGameIds(nextIds);
  return nextIds;
}

export function filterDeletedGames(games) {
  const deletedIds = new Set(readDeletedGameIds());
  return games.filter((game) => !deletedIds.has(String(game.id)));
}
