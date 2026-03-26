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

export function calculateAtBats(draft) {
  return Math.max(0, toNumber(draft.plateAppearances) - toNumber(draft.walksAndHitByPitch));
}

export function calculateHits(draft) {
  return toNumber(draft.singles) + toNumber(draft.doubles) + toNumber(draft.triples) + toNumber(draft.homeRuns);
}

export function validateStep2(draft) {
  if (toNumber(draft.walksAndHitByPitch) > toNumber(draft.plateAppearances)) {
    return buildResult("사사구는 타석보다 클 수 없습니다.");
  }

  return buildResult();
}

export function validateStep3(draft) {
  if (!validateStep2(draft).isValid) {
    return validateStep2(draft);
  }

  const hits = toNumber(draft.singles) + toNumber(draft.doubles);
  if (hits > calculateAtBats(draft)) {
    return buildResult("1루타와 2루타 합은 타수보다 클 수 없습니다.");
  }

  return buildResult();
}

export function validateStep4(draft) {
  if (!validateStep3(draft).isValid) {
    return validateStep3(draft);
  }

  if (calculateHits(draft) > calculateAtBats(draft)) {
    return buildResult("안타 종류의 합은 타수보다 클 수 없습니다.");
  }

  return buildResult();
}

export function validateEntrySubmission(draft) {
  return validateStep4(draft);
}
