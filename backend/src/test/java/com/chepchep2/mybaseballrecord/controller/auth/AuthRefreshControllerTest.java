package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginUser;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenRevokedException;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthRefreshControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/refresh - refreshToken이 유효하면 앱 세션 토큰을 재발급한다")
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

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "valid-refresh-token"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"))
                .andExpect(jsonPath("$.user.provider").value("GOOGLE"));

        verify(authService).refreshSession("valid-refresh-token");
    }

    @Test
    @DisplayName("POST /api/auth/refresh - refreshToken이 비어있으면 400 validation error를 반환한다")
    void postAuthRefreshValidationErrorWhenRefreshTokenBlank() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "   "
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("refreshToken"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - invalid token이면 401 REFRESH_TOKEN_INVALID를 반환한다")
    void postAuthRefreshInvalidToken() throws Exception {
        given(authService.refreshSession("invalid-refresh-token"))
                .willThrow(new RefreshTokenInvalidException("invalid refresh token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "invalid-refresh-token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_INVALID"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - expired token이면 401 REFRESH_TOKEN_EXPIRED를 반환한다")
    void postAuthRefreshExpiredToken() throws Exception {
        given(authService.refreshSession("expired-refresh-token"))
                .willThrow(new RefreshTokenExpiredException("expired refresh token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "expired-refresh-token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_EXPIRED"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh - revoked token이면 401 REFRESH_TOKEN_REVOKED를 반환한다")
    void postAuthRefreshRevokedToken() throws Exception {
        given(authService.refreshSession("revoked-refresh-token"))
                .willThrow(new RefreshTokenRevokedException("revoked refresh token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "revoked-refresh-token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_REVOKED"));
    }
}
