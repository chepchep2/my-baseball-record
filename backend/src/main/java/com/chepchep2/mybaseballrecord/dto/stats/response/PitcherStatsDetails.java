package com.chepchep2.mybaseballrecord.dto.stats.response;

public record PitcherStatsDetails(
        int losses,
        int saves,
        int holds,
        int runsAllowed,
        int earnedRuns,
        int hitsAllowed,
        int walks,
        int hitByPitch,
        int homeRunsAllowed,
        int battersFaced,
        String opponentBattingAverage,
        String strikeoutsPerNine
) {
}
