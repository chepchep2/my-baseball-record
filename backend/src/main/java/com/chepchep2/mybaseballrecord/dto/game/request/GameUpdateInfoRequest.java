package com.chepchep2.mybaseballrecord.dto.game.request;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record GameUpdateInfoRequest(
        LocalDate playedAt,
        Integer seasonYear,
        GameType gameType,
        @Size(max = 100) String teamName,
        @Size(max = 100) String opponentName,
        @Size(max = 1000) String memo
) {
}
