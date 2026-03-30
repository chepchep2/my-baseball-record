package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.infrastructure.config.KakaoAuthConfig;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceKakaoConfigTest {

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

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
    private KakaoOauthClient kakaoOauthClient;

    @Mock
    private KakaoAuthConfig kakaoAuthConfig;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("카카오 로그인 시작 URL은 authorizeBaseUrl을 사용한다")
    void getKakaoLoginUrlUsesAuthorizeBaseUrl() {
        when(kakaoAuthConfig.getAuthorizeBaseUrl()).thenReturn("https://kauth.kakao.com");
        when(kakaoAuthConfig.getClientId()).thenReturn("test-client-id");
        when(kakaoAuthConfig.getRedirectUri()).thenReturn("http://localhost:8080/api/auth/kakao/callback");

        String loginUrl = authService.getKakaoLoginUrl();

        assertThat(loginUrl).startsWith("https://kauth.kakao.com/oauth/authorize");
    }
}
