package com.chepchep2.mybaseballrecord.dto.game.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record GameCreateRequest(
        @NotNull LocalDate playedDate,
        @NotNull @Min(0) @Max(23) Integer playedHour,
        @NotNull @Min(0) @Max(59) Integer playedMinute,
        @Min(0) int plateAppearances,
        @Min(0) int walksAndHitByPitch,
        @Min(0) int singles,
        @Min(0) int doubles,
        @Min(0) int triples,
        @Min(0) int homeRuns
) {
}
