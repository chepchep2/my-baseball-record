package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginUser;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenRevokedException;
import com.chepchep2.mybaseballrecord.infrastructure.auth.RefreshTokenCookieManager;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthRefreshControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private RefreshTokenCookieManager refreshTokenCookieManager;

    @Test
    @DisplayName("POST /api/auth/refresh - refreshToken cookie가 유효하면 앱 세션 토큰을 재발급한다")
    void postAuthRefreshReturnsTokenResponse() throws Exception {
        given(authService.refreshSession("valid-refresh-token"))
                .willReturn(new AuthLoginResult(
                        "new-access-token",
                        "new-refresh-token",
                        Instant.parse("2026-03-18T11:00:00Z"),
                        Instant.parse("2026-04-17T11:00:00Z"),
                        new AuthLoginUser(
                                1L,
                                "조상우",
                                "user@gmail.com",
                                "GOOGLE"
                        )
                ));
        given(refreshTokenCookieManager.createRefreshTokenCookie("new-refresh-token", Instant.parse("2026-04-17T11:00:00Z")))
                .willReturn(ResponseCookie.from("refreshToken", "new-refresh-token").path("/api/auth").httpOnly(true).build());

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "valid-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.expiresIn").isNumber());

        verify(authService).refreshSession("valid-refresh-token");
        verify(refreshTokenCookieManager).createRefreshTokenCookie("new-refresh-token", Instant.parse("2026-04-17T11:00:00Z"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - refreshToken cookie가 없으면 400 또는 401 에러를 반환한다")
    void postAuthRefreshFailsWhenRefreshTokenCookieMissing() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("POST /api/auth/refresh - invalid refreshToken cookie면 401 REFRESH_TOKEN_INVALID를 반환한다")
    void postAuthRefreshInvalidToken() throws Exception {
        given(authService.refreshSession("invalid-refresh-token"))
                .willThrow(new RefreshTokenInvalidException("invalid refresh token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "invalid-refresh-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_INVALID"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - expired token이면 401 REFRESH_TOKEN_EXPIRED를 반환한다")
    void postAuthRefreshExpiredToken() throws Exception {
        given(authService.refreshSession("expired-refresh-token"))
                .willThrow(new RefreshTokenExpiredException("expired refresh token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "expired-refresh-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_EXPIRED"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - revoked token이면 401 REFRESH_TOKEN_REVOKED를 반환한다")
    void postAuthRefreshRevokedToken() throws Exception {
        given(authService.refreshSession("revoked-refresh-token"))
                .willThrow(new RefreshTokenRevokedException("revoked refresh token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "revoked-refresh-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_REVOKED"));
    }
}
