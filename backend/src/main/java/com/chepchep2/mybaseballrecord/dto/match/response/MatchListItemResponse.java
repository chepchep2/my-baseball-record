package com.chepchep2.mybaseballrecord.dto.match.response;

public record MatchListItemResponse(
        long gameId,
        long myBatterRecordId,
        boolean verified,
        String playedDate,
        String playedAtLabel,
        String summaryLabel
) {
}
