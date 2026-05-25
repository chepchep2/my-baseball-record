package com.chepchep2.mybaseballrecord.dto.match.response;

import java.time.LocalDate;
import java.util.List;

public record MatchDetailResponse(
        long gameId,
        LocalDate playedDate,
        int playedHour,
        int playedMinute,
        String playedAtLabel,
        String cityName,
        String districtName,
        String stadiumName,
        boolean createdByCurrentUser,
        boolean myRecordExists,
        List<MatchRecordItemResponse> records
) {
}
