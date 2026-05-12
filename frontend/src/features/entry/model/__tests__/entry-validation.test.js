import { describe, expect, it } from "vitest";
import { calculateAtBats, validateEntrySubmission, validateStep2, validateStep3, validateStep4 } from "../entry-validation";

function buildDraft(overrides = {}) {
  return {
    plateAppearances: "0",
    walksAndHitByPitch: "0",
    singles: "0",
    doubles: "0",
    triples: "0",
    homeRuns: "0",
    ...overrides,
  };
}

describe("entry-validation", () => {
  it("타석보다 사사구가 많으면 즉시 실패한다", () => {
    expect(validateStep2(buildDraft({ plateAppearances: "10", walksAndHitByPitch: "11" }))).toEqual({
      isValid: false,
      error: "사사구는 타석보다 클 수 없습니다.",
    });
  });

  it("타석과 사사구가 같으면 타수가 0이 된다", () => {
    expect(calculateAtBats(buildDraft({ plateAppearances: "4", walksAndHitByPitch: "4" }))).toBe(0);
  });

  it("1루타와 2루타 합이 타수보다 크면 3단계에서 실패한다", () => {
    expect(
      validateStep3(buildDraft({ plateAppearances: "5", walksAndHitByPitch: "1", singles: "3", doubles: "2" })),
    ).toEqual({
      isValid: false,
      error: "안타의 합은 타수보다 클 수 없습니다.",
    });
  });

  it("전체 안타 합이 타수보다 크면 4단계에서 실패한다", () => {
    expect(
      validateStep4(buildDraft({ plateAppearances: "5", walksAndHitByPitch: "1", singles: "2", doubles: "1", homeRuns: "2" })),
    ).toEqual({
      isValid: false,
      error: "안타의 합은 타수보다 클 수 없습니다.",
    });
  });

  it("정상 조합이면 최종 검증을 통과한다", () => {
    expect(
      validateEntrySubmission(buildDraft({ plateAppearances: "5", walksAndHitByPitch: "1", singles: "1", doubles: "1", homeRuns: "1" })),
    ).toEqual({
      isValid: true,
      error: null,
    });
  });
});
