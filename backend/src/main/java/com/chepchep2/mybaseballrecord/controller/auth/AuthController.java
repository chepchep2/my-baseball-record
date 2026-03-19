package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.request.AuthLogoutRequest;
import com.chepchep2.mybaseballrecord.dto.auth.request.AuthRefreshRequest;
import com.chepchep2.mybaseballrecord.dto.auth.request.GoogleLoginRequest;
import com.chepchep2.mybaseballrecord.dto.auth.response.AuthTokenResponse;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public AuthTokenResponse loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        AuthLoginResult result = authService.loginWithGoogle(request.idToken());
        return toTokenResponse(result);
    }

    @PostMapping("/refresh")
    public AuthTokenResponse refreshSession(@Valid @RequestBody AuthRefreshRequest request) {
        AuthLoginResult result = authService.refreshSession(request.refreshToken());
        return toTokenResponse(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody AuthLogoutRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    private AuthTokenResponse toTokenResponse(AuthLoginResult result) {
        return new AuthTokenResponse(
                result.accessToken(),
                result.refreshToken(),
                result.accessTokenExpiresAt().toString(),
                result.refreshTokenExpiresAt().toString(),
                new AuthTokenResponse.AuthUserResponse(
                        result.user().id(),
                        result.user().displayName(),
                        result.user().email(),
                        result.user().provider()
                )
        );
    }
}
