package com.chepchep2.mybaseballrecord.dto.match.response;

public record MatchRecordItemResponse(
        long batterRecordId,
        long userId,
        String displayName,
        int plateAppearances,
        int hits,
        String battingAverage,
        boolean verified
) {
}
