package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginUser;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private RefreshTokenCookieManager refreshTokenCookieManager;

    @Test
    @DisplayName("GET /api/auth/kakao/login - 카카오 로그인 페이지로 리다이렉트한다")
    void getKakaoLoginRedirectsToKakaoAuthorizeUrl() throws Exception {
        given(authService.getKakaoLoginUrl())
                .willReturn("https://kauth.kakao.com/oauth/authorize?client_id=test&redirect_uri=http://localhost:8080/api/auth/kakao/callback");

        mockMvc.perform(get("/api/auth/kakao/login"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("https://kauth.kakao.com/oauth/authorize?client_id=test&redirect_uri=http://localhost:8080/api/auth/kakao/callback"));

        verify(authService).getKakaoLoginUrl();
    }

    @Test
    @DisplayName("GET /api/auth/kakao/callback - code가 유효하면 refresh cookie를 설정하고 프론트 앱으로 리다이렉트한다")
    void getKakaoCallbackSetsRefreshCookieAndRedirectsToFrontend() throws Exception {
        given(authService.loginWithKakaoCode("valid-code"))
                .willReturn(new AuthLoginResult(
                        "access-token",
                        "refresh-token",
                        Instant.parse("2026-03-30T12:00:00Z"),
                        Instant.parse("2026-04-29T12:00:00Z"),
                        new AuthLoginUser(
                                7L,
                                "초상우",
                                null,
                                "KAKAO"
                        )
                ));
        given(refreshTokenCookieManager.createRefreshTokenCookie("refresh-token", Instant.parse("2026-04-29T12:00:00Z")))
                .willReturn(ResponseCookie.from("refreshToken", "refresh-token").path("/api/auth").httpOnly(true).build());
        given(authService.getFrontendRedirectUrl())
                .willReturn("http://localhost:3000/home");

        mockMvc.perform(get("/api/auth/kakao/callback")
                        .queryParam("code", "valid-code"))
                .andExpect(status().is3xxRedirection())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(header().string("Location", "http://localhost:3000/home"));

        verify(authService).loginWithKakaoCode("valid-code");
        verify(refreshTokenCookieManager).createRefreshTokenCookie("refresh-token", Instant.parse("2026-04-29T12:00:00Z"));
        verify(authService).getFrontendRedirectUrl();
    }

    @Test
    @DisplayName("GET /api/auth/session - refresh cookie가 유효하면 access token과 최소 사용자 정보를 반환한다")
    void getAuthSessionReturnsAccessTokenAndUser() throws Exception {
        given(authService.getSession("refresh-token"))
                .willReturn(new AuthLoginResult(
                        "new-access-token",
                        "refresh-token",
                        Instant.parse("2026-03-30T12:00:00Z"),
                        Instant.parse("2026-04-29T12:00:00Z"),
                        new AuthLoginUser(
                                7L,
                                "초상우",
                                null,
                                "KAKAO"
                        )
                ));

        mockMvc.perform(get("/api/auth/session")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.expiresIn").isNumber())
                .andExpect(jsonPath("$.user.id").value(7))
                .andExpect(jsonPath("$.user.nickname").value("초상우"));

        verify(authService).getSession("refresh-token");
    }
}
