package com.chepchep2.mybaseballrecord.dto.game.response;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;

import java.time.LocalDate;

public record GameDetailResponse(
        long id,
        GameInfoResponse gameInfo,
        ParticipationType participationType,
        BatterResponse batter,
        PitcherResponse pitcher
) {
    public record GameInfoResponse(
            LocalDate playedAt,
            int seasonYear,
            GameType gameType,
            String teamName,
            String opponentName,
            String memo
    ) {
    }

    public record BatterResponse(
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

    public record PitcherResponse(
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
}
