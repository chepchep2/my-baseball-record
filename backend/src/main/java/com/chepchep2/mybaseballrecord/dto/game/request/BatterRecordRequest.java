package com.chepchep2.mybaseballrecord.dto.game.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;

public record BatterRecordRequest(
        @Min(0) int plateAppearances,
        @Min(0) int atBats,
        @Min(0) int singles,
        @Min(0) int doubles,
        @Min(0) int triples,
        @Min(0) int homeRuns,
        @Min(0) int walks,
        @Min(0) int strikeOuts,
        @Min(0) int hitByPitch,
        @Min(0) int runsBattedIn,
        @Min(0) int runs,
        @Min(0) int stolenBases,
        @Min(0) int caughtStealing,
        @Min(0) int sacrificeHits
) {
    @AssertTrue(message = "타수는 타석보다 클 수 없습니다.")
    public boolean isAtBatsValid() {
        return atBats <= plateAppearances;
    }
}
