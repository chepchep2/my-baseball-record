package com.chepchep2.mybaseballrecord.dto.stats.response;

public record BatterStatsSummaryResponse(
        String scope,
        int games,
        int plateAppearances,
        int walksAndHitByPitch,
        String battingAverage,
        String ops,
        int hits,
        String onBasePercentage,
        String sluggingPercentage
) {
}
