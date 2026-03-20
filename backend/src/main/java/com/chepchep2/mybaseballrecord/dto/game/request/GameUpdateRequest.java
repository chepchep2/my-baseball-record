package com.chepchep2.mybaseballrecord.dto.game.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public record GameUpdateRequest(
        @Valid @NotNull GameUpdateInfoRequest gameInfo,
        @Valid BatterRecordRequest batter,
        @Valid PitcherRecordRequest pitcher
) {
    @AssertTrue(message = "batter 또는 pitcher 중 하나는 입력해야 합니다.")
    public boolean hasAnyRecord() {
        return batter != null || pitcher != null;
    }
}
