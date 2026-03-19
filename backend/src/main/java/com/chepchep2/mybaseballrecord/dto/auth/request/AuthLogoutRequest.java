package com.chepchep2.mybaseballrecord.dto.auth.request;

import jakarta.validation.constraints.NotBlank;

public record AuthLogoutRequest(
        @NotBlank(message = "refreshToken은 필수입니다.")
        String refreshToken
) {
}
