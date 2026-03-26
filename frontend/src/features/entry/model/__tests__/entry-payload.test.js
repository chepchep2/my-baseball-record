import { describe, expect, it } from "vitest";
import { buildMockGameRecord } from "../entry-payload";

describe("entry-payload", () => {
  it("입력 draft를 홈 화면에서 쓸 수 있는 mock record로 변환한다", () => {
    const result = buildMockGameRecord({
      date: "2026-03-26",
      hour: "14",
      minute: "10",
      plateAppearances: "5",
      walksAndHitByPitch: "1",
      singles: "1",
      doubles: "1",
      triples: "0",
      homeRuns: "1",
    });

    expect(result.playedLabel).toBe("3/26 14:10");
    expect(result.atBats).toBe(4);
    expect(result.hits).toBe(3);
    expect(result.battingAverage).toBe(".750");
    expect(result.summaryLabel).toBe("타석 5 · 안타 3 · 타율 .750");
  });
});
