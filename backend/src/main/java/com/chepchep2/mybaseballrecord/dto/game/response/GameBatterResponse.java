package com.chepchep2.mybaseballrecord.dto.game.response;

public record GameBatterResponse(
        int plateAppearances,
        int atBats,
        int singles,
        int doubles,
        int triples,
        int homeRuns,
        int walks,
        int strikeOuts,
        int hitByPitch,
        int runsBattedIn,
        int runs,
        int stolenBases,
        int caughtStealing,
        int sacrificeHits
) {
}
