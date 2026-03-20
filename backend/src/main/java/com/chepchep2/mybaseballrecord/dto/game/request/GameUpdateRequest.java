package com.chepchep2.mybaseballrecord.dto.game.request;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record GameUpdateRequest(
        @Valid @NotNull GameInfoRequest gameInfo,
        @Valid BatterRequest batter,
        @Valid PitcherRequest pitcher
) {
    @AssertTrue(message = "batter 또는 pitcher 중 하나는 입력해야 합니다.")
    public boolean hasAnyRecord() {
        return batter != null || pitcher != null;
    }

    public record GameInfoRequest(
            LocalDate playedAt,
            Integer seasonYear,
            GameType gameType,
            @NotBlank @Size(max = 100) String teamName,
            @NotBlank @Size(max = 100) String opponentName,
            @Size(max = 1000) String memo
    ) {
    }

    public record BatterRequest(
            @Min(0) int plateAppearances,
            @Min(0) int atBats,
            @Min(0) int singles,
            @Min(0) int doubles,
            @Min(0) int triples,
            @Min(0) int homeRuns,
            @Min(0) int walks,
            @Min(0) int strikeOuts,
            @Min(0) int hitByPitch,
            @Min(0) int runsBattedIn,
            @Min(0) int runs,
            @Min(0) int stolenBases,
            @Min(0) int caughtStealing,
            @Min(0) int sacrificeHits
    ) {
        @AssertTrue(message = "타수는 타석보다 클 수 없습니다.")
        public boolean isAtBatsValid() {
            return atBats <= plateAppearances;
        }
    }

    public record PitcherRequest(
            @Min(0) int innings,
            @Min(0) @Max(2) int additionalOuts,
            @Min(0) int runsAllowed,
            @Min(0) int earnedRuns,
            @Min(0) int hitsAllowed,
            @Min(0) int walks,
            @Min(0) int hitByPitch,
            @Min(0) int homeRunsAllowed,
            @Min(0) int strikeOuts,
            @Min(0) int battersFaced,
            @Min(0) int wins,
            @Min(0) int losses,
            @Min(0) int saves,
            @Min(0) int holds
    ) {
        @AssertTrue(message = "자책점은 실점보다 클 수 없습니다.")
        public boolean isEarnedRunsValid() {
            return earnedRuns <= runsAllowed;
        }
    }
}
