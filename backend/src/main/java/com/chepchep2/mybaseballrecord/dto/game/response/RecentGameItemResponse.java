package com.chepchep2.mybaseballrecord.dto.game.response;

public record RecentGameItemResponse(
        long gameId,
        String playedDate,
        int playedHour,
        int playedMinute,
        String playedAtLabel,
        int plateAppearances,
        int walksAndHitByPitch,
        int singles,
        int doubles,
        int triples,
        int homeRuns,
        int atBats,
        int hits,
        String battingAverage,
        String onBasePercentage,
        String sluggingPercentage,
        String ops
) {
}
