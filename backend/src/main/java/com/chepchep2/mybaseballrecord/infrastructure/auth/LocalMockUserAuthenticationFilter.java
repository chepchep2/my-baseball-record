package com.chepchep2.mybaseballrecord.infrastructure.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class LocalMockUserAuthenticationFilter extends OncePerRequestFilter {
    public static final String DEV_USER_ID_HEADER = "X-Dev-User-Id";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(DEV_USER_ID_HEADER);
        if (header != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                long userId = Long.parseLong(header);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of()
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (NumberFormatException ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
