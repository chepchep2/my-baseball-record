package com.chepchep2.mybaseballrecord.dto.match.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MatchCreateRequest(
        @NotNull LocalDate playedDate,
        @NotNull @Min(0) @Max(23) Integer playedHour,
        @NotNull @Min(0) @Max(59) Integer playedMinute,
        @NotBlank String cityName,
        @NotBlank String districtName,
        Long stadiumId,
        @NotBlank String stadiumName
) {
}
