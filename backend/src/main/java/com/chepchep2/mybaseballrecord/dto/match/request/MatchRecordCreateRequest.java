package com.chepchep2.mybaseballrecord.dto.match.request;

import jakarta.validation.constraints.Min;

public record MatchRecordCreateRequest(
        @Min(0) int plateAppearances,
        @Min(0) int walksAndHitByPitch,
        @Min(0) int singles,
        @Min(0) int doubles,
        @Min(0) int triples,
        @Min(0) int homeRuns,
        @Min(0) int sacrificeBunts,
        @Min(0) int sacrificeFlies
) {
}
