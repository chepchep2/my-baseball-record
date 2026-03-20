package com.chepchep2.mybaseballrecord.dto.stats.response;

public record BatterStatsDetails(
        int plateAppearances,
        int homeRuns,
        int runsBattedIn,
        String onBasePercentage,
        String sluggingPercentage,
        int singles,
        int doubles,
        int triples,
        int walks,
        int hitByPitch,
        int stolenBases,
        int caughtStealing,
        int sacrificeHits,
        int runs
) {
}
