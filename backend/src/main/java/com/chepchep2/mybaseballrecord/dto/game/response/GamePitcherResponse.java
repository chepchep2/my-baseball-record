package com.chepchep2.mybaseballrecord.dto.game.response;

public record GamePitcherResponse(
        int innings,
        int additionalOuts,
        int runsAllowed,
        int earnedRuns,
        int hitsAllowed,
        int walks,
        int hitByPitch,
        int homeRunsAllowed,
        int strikeOuts,
        int battersFaced,
        int wins,
        int losses,
        int saves,
        int holds
) {
}
