package com.chepchep2.mybaseballrecord.dto.game.response;

import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;

public record GameDetailResponse(
        long id,
        GameInfoResponse gameInfo,
        ParticipationType participationType,
        GameBatterResponse batter,
        GamePitcherResponse pitcher
) {
}
