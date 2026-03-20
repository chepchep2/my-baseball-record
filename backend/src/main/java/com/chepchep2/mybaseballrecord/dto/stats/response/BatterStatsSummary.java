package com.chepchep2.mybaseballrecord.dto.stats.response;

public record BatterStatsSummary(
        int games,
        int atBats,
        int hits,
        String battingAverage,
        String ops
) {
}
