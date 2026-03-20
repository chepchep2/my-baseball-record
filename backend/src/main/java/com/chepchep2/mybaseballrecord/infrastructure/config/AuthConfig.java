package com.chepchep2.mybaseballrecord.infrastructure.config;

import com.chepchep2.mybaseballrecord.infrastructure.auth.GoogleTokenInfoHttpClient;
import com.chepchep2.mybaseballrecord.infrastructure.auth.GoogleTokenVerifierImpl;
import com.chepchep2.mybaseballrecord.infrastructure.auth.JwtRefreshTokenValidator;
import com.chepchep2.mybaseballrecord.infrastructure.auth.JwtTokenIssuerImpl;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenInfoClient;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenVerifier;
import com.chepchep2.mybaseballrecord.service.auth.JwtTokenIssuer;
import com.chepchep2.mybaseballrecord.service.auth.RefreshTokenValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Clock;

@Configuration
public class AuthConfig {

    @Bean
    public AuthService authService(
            GoogleTokenVerifier googleTokenVerifier,
            JwtTokenIssuer jwtTokenIssuer,
            RefreshTokenValidator refreshTokenValidator,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            Clock clock
    ) {
        return new AuthService(
                googleTokenVerifier,
                jwtTokenIssuer,
                refreshTokenValidator,
                userRepository,
                refreshTokenRepository,
                clock
        );
    }

    @Bean
    @Profile("!local-fake-google")
    public RestClient googleRestClient(
            @Value("${auth.google.base-url:https://oauth2.googleapis.com}") String baseUrl
    ) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Bean
    @Profile("!local-fake-google")
    public GoogleTokenInfoClient googleTokenInfoClient(
            RestClient googleRestClient,
            @Value("${auth.google.token-info-path:/tokeninfo}") String tokenInfoPath
    ) {
        return new GoogleTokenInfoHttpClient(googleRestClient, tokenInfoPath);
    }

    @Bean
    @Profile("!local-fake-google")
    public GoogleTokenVerifier googleTokenVerifier(
            GoogleTokenInfoClient googleTokenInfoClient,
            @Value("${auth.google.client-id}") String googleClientId,
            Clock clock
    ) {
        return new GoogleTokenVerifierImpl(
                googleTokenInfoClient,
                googleClientId,
                clock
        );
    }

    @Bean
    public JwtTokenIssuer jwtTokenIssuer(
            @Value("${auth.jwt.secret}") String secret,
            @Value("${auth.jwt.access-token-ttl-seconds}") long accessTokenTtlSeconds,
            @Value("${auth.jwt.refresh-token-ttl-seconds}") long refreshTokenTtlSeconds,
            Clock clock
    ) {
        return new JwtTokenIssuerImpl(
                secret,
                accessTokenTtlSeconds,
                refreshTokenTtlSeconds,
                clock
        );
    }

    @Bean
    public RefreshTokenValidator refreshTokenValidator(
            @Value("${auth.jwt.secret}") String secret,
            Clock clock
    ) {
        return new JwtRefreshTokenValidator(secret, clock);
    }
}
