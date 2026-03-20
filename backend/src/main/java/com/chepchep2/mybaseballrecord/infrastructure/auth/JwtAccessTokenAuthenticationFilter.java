package com.chepchep2.mybaseballrecord.infrastructure.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Date;
import java.util.List;

public class JwtAccessTokenAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    public static final String AUTH_ERROR_ATTRIBUTE = "AUTH_ERROR";
    public static final String AUTH_ERROR_INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN";
    private final SecretKey secretKey;
    private final Clock clock;

    public JwtAccessTokenAuthenticationFilter(String secret, Clock clock) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.clock = clock;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader(AUTHORIZATION);
        if (authorization != null && authorization.startsWith(BEARER_PREFIX)) {
            String token = authorization.substring(BEARER_PREFIX.length());
            authenticateIfValidAccessToken(request, token);
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateIfValidAccessToken(HttpServletRequest request, String token) {
        try {
            Claims claims = Jwts.parser()
                    .clock(() -> Date.from(clock.instant()))
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!"access".equals(claims.get("tokenType", String.class))) {
                requestAuthError(request, AUTH_ERROR_INVALID_ACCESS_TOKEN);
                return;
            }

            String subject = claims.getSubject();
            if (subject == null || subject.isBlank()) {
                requestAuthError(request, AUTH_ERROR_INVALID_ACCESS_TOKEN);
                return;
            }

            long userId = Long.parseLong(subject);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    List.of()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException ignored) {
            requestAuthError(request, AUTH_ERROR_INVALID_ACCESS_TOKEN);
            SecurityContextHolder.clearContext();
        }
    }

    private void requestAuthError(HttpServletRequest request, String error) {
        request.setAttribute(AUTH_ERROR_ATTRIBUTE, error);
    }
}
