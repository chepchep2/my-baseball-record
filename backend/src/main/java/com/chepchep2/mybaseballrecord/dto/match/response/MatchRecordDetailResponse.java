package com.chepchep2.mybaseballrecord.dto.match.response;

public record MatchRecordDetailResponse(
        long batterRecordId,
        long gameId,
        long userId,
        String displayName,
        boolean verified,
        String playedDate,
        int playedHour,
        int playedMinute,
        int plateAppearances,
        int atBats,
        int singles,
        int doubles,
        int triples,
        int homeRuns,
        int walks,
        int strikeOuts,
        int hitByPitch,
        int runsBattedIn,
        int runs,
        int stolenBases,
        int caughtStealing,
        int sacrificeHits,
        int hits,
        int walksAndHitByPitch,
        String battingAverage,
        String onBasePercentage,
        String sluggingPercentage,
        String ops
) {
}
