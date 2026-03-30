package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.response.AuthAccessTokenResponse;
import com.chepchep2.mybaseballrecord.dto.auth.response.AuthSessionResponse;
import com.chepchep2.mybaseballrecord.infrastructure.auth.RefreshTokenCookieManager;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenCookieManager refreshTokenCookieManager;

    public AuthController(AuthService authService, RefreshTokenCookieManager refreshTokenCookieManager) {
        this.authService = authService;
        this.refreshTokenCookieManager = refreshTokenCookieManager;
    }

    @GetMapping("/kakao/login")
    public ResponseEntity<Void> redirectToKakaoLogin() {
        return ResponseEntity.status(302)
                .header(HttpHeaders.LOCATION, authService.getKakaoLoginUrl())
                .build();
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<Void> handleKakaoCallback(@RequestParam("code") String code) {
        AuthLoginResult result = authService.loginWithKakaoCode(code);
        ResponseCookie refreshCookie = refreshTokenCookieManager.createRefreshTokenCookie(
                result.refreshToken(),
                result.refreshTokenExpiresAt()
        );

        return ResponseEntity.status(302)
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .header(HttpHeaders.LOCATION, authService.getFrontendRedirectUrl())
                .build();
    }

    @GetMapping("/session")
    public AuthSessionResponse getSession(@CookieValue("refreshToken") String refreshToken) {
        AuthLoginResult result = authService.getSession(refreshToken);
        return toSessionResponse(result);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthAccessTokenResponse> refreshSession(@CookieValue("refreshToken") String refreshToken) {
        AuthLoginResult result = authService.refreshSession(refreshToken);
        ResponseCookie refreshCookie = refreshTokenCookieManager.createRefreshTokenCookie(
                result.refreshToken(),
                result.refreshTokenExpiresAt()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(toAccessTokenResponse(result));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue("refreshToken") String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieManager.clearRefreshTokenCookie().toString())
                .build();
    }

    private AuthSessionResponse toSessionResponse(AuthLoginResult result) {
        long expiresIn = Math.max(0, Duration.between(Instant.now(), result.accessTokenExpiresAt()).toSeconds());
        return new AuthSessionResponse(
                result.accessToken(),
                expiresIn,
                new AuthSessionResponse.AuthSessionUserResponse(
                        result.user().id(),
                        result.user().displayName(),
                        result.user().profileImageUrl()
                )
        );
    }

    private AuthAccessTokenResponse toAccessTokenResponse(AuthLoginResult result) {
        long expiresIn = Math.max(0, Duration.between(Instant.now(), result.accessTokenExpiresAt()).toSeconds());
        return new AuthAccessTokenResponse(
                result.accessToken(),
                expiresIn
        );
    }
}
