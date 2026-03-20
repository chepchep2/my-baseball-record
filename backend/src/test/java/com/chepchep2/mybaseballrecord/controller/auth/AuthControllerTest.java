package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginUser;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import com.chepchep2.mybaseballrecord.exception.auth.GoogleAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.InvalidGoogleTokenException;
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
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/google - idToken이 유효하면 앱 세션 토큰을 반환한다")
    void postGoogleLoginReturnsTokenResponse() throws Exception {
        given(authService.loginWithGoogle("google-id-token"))
                .willReturn(new AuthLoginResult(
                        "access-token",
                        "refresh-token",
                        Instant.parse("2026-03-18T10:00:00Z"),
                        Instant.parse("2026-04-17T10:00:00Z"),
                        new AuthLoginUser(
                                1L,
                                "조상우",
                                "user@gmail.com",
                                "GOOGLE"
                        )
                ));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idToken": "google-id-token"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.refreshToken").isString())
                .andExpect(jsonPath("$.accessTokenExpiresAt").isString())
                .andExpect(jsonPath("$.refreshTokenExpiresAt").isString())
                .andExpect(jsonPath("$.user.id").isNumber())
                .andExpect(jsonPath("$.user.displayName").isString())
                .andExpect(jsonPath("$.user.email").isString())
                .andExpect(jsonPath("$.user.provider").value("GOOGLE"));

        verify(authService).loginWithGoogle("google-id-token");
    }

    @Test
    @DisplayName("POST /api/auth/google - idToken이 비어있으면 400 validation error를 반환한다")
    void postGoogleLoginValidationErrorWhenIdTokenBlank() throws Exception {
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idToken": "   "
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("idToken"));
    }

    @Test
    @DisplayName("POST /api/auth/google - verifier가 invalid token을 반환하면 400 INVALID_GOOGLE_TOKEN을 반환한다")
    void postGoogleLoginInvalidGoogleToken() throws Exception {
        given(authService.loginWithGoogle("bad-token"))
                .willThrow(new InvalidGoogleTokenException("invalid token"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idToken": "bad-token"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_GOOGLE_TOKEN"));
    }

    @Test
    @DisplayName("POST /api/auth/google - verifier가 auth failed를 반환하면 401 GOOGLE_AUTH_FAILED를 반환한다")
    void postGoogleLoginGoogleAuthFailed() throws Exception {
        given(authService.loginWithGoogle("auth-failed-token"))
                .willThrow(new GoogleAuthFailedException("auth failed"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idToken": "auth-failed-token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("GOOGLE_AUTH_FAILED"));
    }
}
