import { describe, expect, it } from "vitest";
import { buildEntryDraft, getEntrySteps, roundUpToNextTenMinutes } from "../entry-form";

describe("entry-form", () => {
  it("현재 시각을 현재 10분 단위로 내린 기본 draft를 만든다", () => {
    const result = buildEntryDraft(new Date("2026-03-26T14:04:00"));

    expect(result.date).toBe("2026-03-26");
    expect(result.hour).toBe("14");
    expect(result.minute).toBe("00");
    expect(result.plateAppearances).toBe("0");
  });

  it("시간 helper는 14:08을 14:00으로 내린다", () => {
    const result = roundUpToNextTenMinutes(new Date("2026-03-26T14:08:00"));

    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(0);
  });

  it("23:58은 같은 날짜의 23:50으로 유지한다", () => {
    const result = buildEntryDraft(new Date("2026-03-26T23:58:00"));

    expect(result.date).toBe("2026-03-26");
    expect(result.hour).toBe("23");
    expect(result.minute).toBe("50");
  });

  it("4단계 입력 metadata를 반환한다", () => {
    expect(getEntrySteps()).toEqual([
      { step: 1, title: "날짜 + 시간" },
      { step: 2, title: "타석 + 사사구" },
      { step: 3, title: "1루타 + 2루타" },
      { step: 4, title: "3루타 + 홈런" },
    ]);
  });
});
