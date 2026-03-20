package com.chepchep2.mybaseballrecord.dto.stats.response;

public record PitcherStatsSummary(
        int games,
        String inningsPitchedDisplay,
        String era,
        String whip,
        int strikeOuts,
        int wins
) {
}
