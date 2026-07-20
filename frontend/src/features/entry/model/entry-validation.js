function toNumber(value) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildResult(message = null) {
  return {
    isValid: message === null,
    error: message,
  };
}

const HITS_OVER_AT_BATS_MESSAGE = "안타의 합은 타수보다 클 수 없습니다.";
const PLATE_APPEARANCE_BREAKDOWN_MESSAGE = "사사구, 희생번트, 희생플라이는 타석보다 클 수 없습니다.";

export function calculateAtBats(draft) {
  return Math.max(
    0,
    toNumber(draft.plateAppearances)
      - toNumber(draft.walksAndHitByPitch)
      - toNumber(draft.sacrificeBunts)
      - toNumber(draft.sacrificeFlies),
  );
}

export function calculateHits(draft) {
  return toNumber(draft.singles) + toNumber(draft.doubles) + toNumber(draft.triples) + toNumber(draft.homeRuns);
}

export function validateStep2(draft) {
  const excludedPlateAppearances = toNumber(draft.walksAndHitByPitch)
    + toNumber(draft.sacrificeBunts)
    + toNumber(draft.sacrificeFlies);

  if (excludedPlateAppearances > toNumber(draft.plateAppearances)) {
    return buildResult(PLATE_APPEARANCE_BREAKDOWN_MESSAGE);
  }

  return buildResult();
}

export function validateStep3(draft) {
  if (!validateStep2(draft).isValid) {
    return validateStep2(draft);
  }

  const hits = toNumber(draft.singles) + toNumber(draft.doubles);
  if (hits > calculateAtBats(draft)) {
    return buildResult(HITS_OVER_AT_BATS_MESSAGE);
  }

  return buildResult();
}

export function validateStep4(draft) {
  if (!validateStep3(draft).isValid) {
    return validateStep3(draft);
  }

  if (calculateHits(draft) > calculateAtBats(draft)) {
    return buildResult(HITS_OVER_AT_BATS_MESSAGE);
  }

  return buildResult();
}

export function validateEntrySubmission(draft) {
  return validateStep4(draft);
}
