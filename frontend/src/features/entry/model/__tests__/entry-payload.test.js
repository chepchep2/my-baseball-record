import { describe, expect, it } from "vitest";
import { buildGameCreatePayload } from "../entry-payload";

describe("entry-payload", () => {
  it("입력 draft를 game create 요청 payload로 변환한다", () => {
    const result = buildGameCreatePayload({
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

    expect(result).toEqual({
      playedDate: "2026-03-26",
      playedHour: 14,
      playedMinute: 10,
      plateAppearances: 5,
      walksAndHitByPitch: 1,
      singles: 1,
      doubles: 1,
      triples: 0,
      homeRuns: 1,
    });
  });
});
