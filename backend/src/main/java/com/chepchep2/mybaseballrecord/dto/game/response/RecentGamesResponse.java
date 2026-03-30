package com.chepchep2.mybaseballrecord.dto.game.response;

import java.util.List;

public record RecentGamesResponse(
        List<RecentGameItemResponse> items
) {
}
