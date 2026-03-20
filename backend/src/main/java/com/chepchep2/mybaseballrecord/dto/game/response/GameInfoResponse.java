package com.chepchep2.mybaseballrecord.dto.game.response;

import com.chepchep2.mybaseballrecord.domain.game.GameType;

import java.time.LocalDate;

public record GameInfoResponse(
        LocalDate playedAt,
        int seasonYear,
        GameType gameType,
        String teamName,
        String opponentName,
        String memo
) {
}
