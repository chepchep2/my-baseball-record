package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.domain.auth.RefreshToken;
import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.dto.auth.KakaoUserInfo;
import com.chepchep2.mybaseballrecord.exception.auth.KakaoAuthFailedException;
import com.chepchep2.mybaseballrecord.infrastructure.config.KakaoAuthConfig;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private KakaoOauthClient kakaoOauthClient;

    @Mock
    private JwtTokenIssuer jwtTokenIssuer;

    @Mock
    private RefreshTokenValidator refreshTokenValidator;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private Clock clock;

    @Mock
    private KakaoAuthConfig kakaoAuthConfig;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("카카오 로그인 시작 URL은 authorize base, client_id, redirect_uri, response_type=code를 포함한다")
    void getKakaoLoginUrlBuildsAuthorizeUrl() {
        when(kakaoAuthConfig.getAuthorizeBaseUrl()).thenReturn("https://kauth.kakao.com");
        when(kakaoAuthConfig.getClientId()).thenReturn("test-client-id");
        when(kakaoAuthConfig.getRedirectUri()).thenReturn("http://localhost:8080/api/auth/kakao/callback");

        String loginUrl = authService.getKakaoLoginUrl();

        assertThat(loginUrl).contains("https://kauth.kakao.com/oauth/authorize");
        assertThat(loginUrl).contains("client_id=test-client-id");
        assertThat(loginUrl).contains("redirect_uri=http://localhost:8080/api/auth/kakao/callback");
        assertThat(loginUrl).contains("response_type=code");
    }

    @Test
    @DisplayName("프론트 리다이렉트 URL은 Kakao auth 설정값을 그대로 사용한다")
    void getFrontendRedirectUrlReturnsConfiguredValue() {
        when(kakaoAuthConfig.getFrontendRedirectUri()).thenReturn("http://localhost:3000/home");

        String frontendRedirectUrl = authService.getFrontendRedirectUrl();

        assertThat(frontendRedirectUrl).isEqualTo("http://localhost:3000/home");
    }

    @Test
    @DisplayName("신규 카카오 사용자면 user를 생성하고 access/refresh token을 발급한다")
    void loginWithKakaoCodeCreatesUserAndIssuesTokens() {
        var kakaoUser = new KakaoUserInfo(
                "kakao-sub-1",
                "초상우",
                "https://k.kakaocdn.net/profile.png",
                null
        );

        when(kakaoOauthClient.getUserInfo("valid-code")).thenReturn(kakaoUser);
        when(userRepository.findByEmail("kakao-kakao-sub-1@no-email.local")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.assignId(7L);
            return user;
        });
        when(jwtTokenIssuer.issueAccessToken(7L)).thenReturn(new JwtTokenIssuer.IssuedToken("access-token", Instant.parse("2026-03-30T12:00:00Z")));
        when(jwtTokenIssuer.issueRefreshToken(7L)).thenReturn(new JwtTokenIssuer.IssuedToken("refresh-token", Instant.parse("2026-04-29T12:00:00Z")));

        var result = authService.loginWithKakaoCode("valid-code");

        assertThat(result.accessToken()).isEqualTo("access-token");
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
        assertThat(result.user().id()).isEqualTo(7L);
        assertThat(result.user().displayName()).isEqualTo("초상우");
        assertThat(result.user().provider()).isEqualTo("KAKAO");

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        assertThat(captor.getValue().token()).isEqualTo("refresh-token");
        assertThat(captor.getValue().userId()).isEqualTo(7L);
    }

    @Test
    @DisplayName("기존 카카오 사용자면 user를 재사용하고 refresh token을 갱신 저장한다")
    void loginWithKakaoCodeReusesExistingUser() {
        User existing = User.existing(9L, "kakao-sub-9", "kakao-kakao-sub-9@no-email.local", "기존유저", "KAKAO");
        var kakaoUser = new KakaoUserInfo(
                "kakao-sub-9",
                "기존유저",
                null,
                null
        );

        when(kakaoOauthClient.getUserInfo("existing-code")).thenReturn(kakaoUser);
        when(userRepository.findByEmail("kakao-kakao-sub-9@no-email.local")).thenReturn(Optional.of(existing));
        when(jwtTokenIssuer.issueAccessToken(9L)).thenReturn(new JwtTokenIssuer.IssuedToken("access-9", Instant.parse("2026-03-30T12:00:00Z")));
        when(jwtTokenIssuer.issueRefreshToken(9L)).thenReturn(new JwtTokenIssuer.IssuedToken("refresh-9", Instant.parse("2026-04-29T12:00:00Z")));

        var result = authService.loginWithKakaoCode("existing-code");

        assertThat(result.user().id()).isEqualTo(9L);
        assertThat(result.user().provider()).isEqualTo("KAKAO");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("카카오 사용자 정보 조회가 실패하면 KakaoAuthFailedException을 던진다")
    void loginWithKakaoCodeThrowsWhenKakaoUserInfoInvalid() {
        when(kakaoOauthClient.getUserInfo("bad-code"))
                .thenThrow(new KakaoAuthFailedException("kakao auth failed"));

        assertThatThrownBy(() -> authService.loginWithKakaoCode("bad-code"))
                .isInstanceOf(KakaoAuthFailedException.class);
    }
}
