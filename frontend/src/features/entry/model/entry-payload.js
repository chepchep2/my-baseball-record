function toNumber(value) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildGameCreatePayload(draft) {
  return {
    playedDate: draft.date,
    playedHour: toNumber(draft.hour),
    playedMinute: toNumber(draft.minute),
    plateAppearances: toNumber(draft.plateAppearances),
    walksAndHitByPitch: toNumber(draft.walksAndHitByPitch),
    singles: toNumber(draft.singles),
    doubles: toNumber(draft.doubles),
    triples: toNumber(draft.triples),
    homeRuns: toNumber(draft.homeRuns),
  };
}
