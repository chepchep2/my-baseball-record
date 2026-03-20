package com.chepchep2.mybaseballrecord.dto.game.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PitcherRecordRequest(
        @Min(0) int innings,
        @Min(0) @Max(2) int additionalOuts,
        @Min(0) int runsAllowed,
        @Min(0) int earnedRuns,
        @Min(0) int hitsAllowed,
        @Min(0) int walks,
        @Min(0) int hitByPitch,
        @Min(0) int homeRunsAllowed,
        @Min(0) int strikeOuts,
        @Min(0) int battersFaced,
        @Min(0) int wins,
        @Min(0) int losses,
        @Min(0) int saves,
        @Min(0) int holds
) {
    @AssertTrue(message = "자책점은 실점보다 클 수 없습니다.")
    public boolean isEarnedRunsValid() {
        return earnedRuns <= runsAllowed;
    }
}
