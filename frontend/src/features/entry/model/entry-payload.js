import { calculateAtBats, calculateHits } from "@/features/entry/model/entry-validation";

function toNumber(value) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatAverage(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return ".000";
  }

  return value.toFixed(3).replace(/^0/, "");
}

function calculateOnBasePercentage(draft) {
  const plateAppearances = toNumber(draft.plateAppearances);
  if (plateAppearances === 0) {
    return ".000";
  }

  return formatAverage((calculateHits(draft) + toNumber(draft.walksAndHitByPitch)) / plateAppearances);
}

function calculateSluggingPercentage(draft) {
  const atBats = calculateAtBats(draft);
  if (atBats === 0) {
    return ".000";
  }

  const totalBases = toNumber(draft.singles)
    + (toNumber(draft.doubles) * 2)
    + (toNumber(draft.triples) * 3)
    + (toNumber(draft.homeRuns) * 4);

  return formatAverage(totalBases / atBats);
}

export function buildMockGameRecord(draft) {
  const hits = calculateHits(draft);
  const atBats = calculateAtBats(draft);
  const battingAverage = atBats === 0 ? ".000" : formatAverage(hits / atBats);
  const onBasePercentage = calculateOnBasePercentage(draft);
  const sluggingPercentage = calculateSluggingPercentage(draft);

  return {
    id: `mock-${draft.date}-${draft.hour}${draft.minute}`,
    playedAt: draft.date,
    playedTime: `${draft.hour}:${draft.minute}`,
    plateAppearances: toNumber(draft.plateAppearances),
    walksAndHitByPitch: toNumber(draft.walksAndHitByPitch),
    singles: toNumber(draft.singles),
    doubles: toNumber(draft.doubles),
    triples: toNumber(draft.triples),
    homeRuns: toNumber(draft.homeRuns),
    atBats,
    hits,
    battingAverage,
    onBasePercentage,
    sluggingPercentage,
    ops: formatAverage(Number(onBasePercentage.replace(".", "0.")) + Number(sluggingPercentage.replace(".", "0."))),
    playedLabel: `${Number(draft.date.slice(5, 7))}/${Number(draft.date.slice(8, 10))} ${draft.hour}:${draft.minute}`,
    summaryLabel: `타석 ${draft.plateAppearances} · 안타 ${hits} · 타율 ${battingAverage}`,
  };
}
