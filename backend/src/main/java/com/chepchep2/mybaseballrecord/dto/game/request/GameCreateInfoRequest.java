package com.chepchep2.mybaseballrecord.dto.game.request;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record GameCreateInfoRequest(
        @NotNull LocalDate playedAt,
        Integer seasonYear,
        @NotNull GameType gameType,
        @Size(max = 100) String teamName,
        @NotBlank @Size(max = 100) String opponentName,
        @Size(max = 1000) String memo
) {
}
