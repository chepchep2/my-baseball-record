package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthLogoutServiceTest {

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

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("refresh token이 있으면 deleteByToken을 호출한다")
    void logoutDeletesRefreshToken() {
        authService.logout("valid.refresh.token");

        verify(refreshTokenRepository).deleteByToken("valid.refresh.token");
    }

    @Test
    @DisplayName("refresh token이 비어있으면 RefreshTokenInvalidException")
    void logoutFailsWhenRefreshTokenBlank() {
        assertThatThrownBy(() -> authService.logout("   "))
                .isInstanceOf(RefreshTokenInvalidException.class);
    }
}
