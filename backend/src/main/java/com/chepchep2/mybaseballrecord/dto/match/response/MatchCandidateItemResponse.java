package com.chepchep2.mybaseballrecord.dto.match.response;

import java.time.LocalDate;

public record MatchCandidateItemResponse(
        long gameId,
        LocalDate playedDate,
        int playedHour,
        int playedMinute,
        String playedAtLabel,
        String cityName,
        String districtName,
        String stadiumName
) {
}
