package com.chepchep2.mybaseballrecord.dto.game.request;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record GameUpdateInfoRequest(
        LocalDate playedDate,
        @Min(0) @Max(23) Integer playedHour,
        @Min(0) @Max(59) Integer playedMinute,
        Integer seasonYear,
        GameType gameType,
        @Size(max = 100) String teamName,
        @Size(max = 100) String opponentName,
        @Size(max = 1000) String memo
) {
}
