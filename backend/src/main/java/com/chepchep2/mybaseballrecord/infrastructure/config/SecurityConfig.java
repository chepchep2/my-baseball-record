package com.chepchep2.mybaseballrecord.infrastructure.config;

import com.chepchep2.mybaseballrecord.infrastructure.auth.JwtAccessTokenAuthenticationFilter;
import com.chepchep2.mybaseballrecord.infrastructure.auth.LocalMockUserAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Clock;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${auth.jwt.secret}") String jwtSecret,
            @Value("${spring.profiles.active:}") String activeProfiles,
            Clock clock
    ) throws Exception {
        boolean localProfileActive = Arrays.stream(activeProfiles.split(","))
                .map(String::trim)
                .anyMatch("local"::equals);

        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/kakao/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/kakao/callback").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/session").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            String authError = (String) request.getAttribute(JwtAccessTokenAuthenticationFilter.AUTH_ERROR_ATTRIBUTE);
                            boolean invalidToken = JwtAccessTokenAuthenticationFilter.AUTH_ERROR_INVALID_ACCESS_TOKEN.equals(authError);
                            String code = invalidToken ? "ACCESS_TOKEN_INVALID" : "ACCESS_TOKEN_REQUIRED";
                            String message = invalidToken
                                    ? "access token is invalid."
                                    : "access token is required.";

                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("""
                                    {
                                      "code": "%s",
                                      "message": "%s",
                                      "fieldErrors": [],
                                      "retryable": false
                                    }
                                    """.formatted(code, message).trim());
                        })
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(
                        new JwtAccessTokenAuthenticationFilter(jwtSecret, clock),
                        UsernamePasswordAuthenticationFilter.class
                );

        if (localProfileActive) {
            http.addFilterBefore(
                    new LocalMockUserAuthenticationFilter(),
                    JwtAccessTokenAuthenticationFilter.class
            );
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://my-baseball-record.vercel.app",
                "https://app.plannr.cloud",
                "https://app.mybaseball.cloud"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
