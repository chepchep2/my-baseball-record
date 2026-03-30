package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.dto.auth.KakaoUserInfo;
import com.chepchep2.mybaseballrecord.exception.auth.KakaoAuthFailedException;
import com.chepchep2.mybaseballrecord.infrastructure.config.KakaoAuthConfig;
import com.chepchep2.mybaseballrecord.service.auth.KakaoOauthClient;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

public class KakaoOauthHttpClient implements KakaoOauthClient {
    private final RestClient restClient;
    private final KakaoAuthConfig kakaoAuthConfig;

    public KakaoOauthHttpClient(RestClient restClient, KakaoAuthConfig kakaoAuthConfig) {
        this.restClient = restClient;
        this.kakaoAuthConfig = kakaoAuthConfig;
    }

    @Override
    public KakaoUserInfo getUserInfo(String authorizationCode) {
        KakaoTokenResponse tokenResponse = exchangeAuthorizationCode(authorizationCode);
        KakaoUserInfoResponse userInfoResponse = fetchUserInfo(tokenResponse.accessToken());

        if (userInfoResponse == null || userInfoResponse.id() == null) {
            throw new KakaoAuthFailedException("kakao user info response is empty.");
        }

        String nickname = userInfoResponse.properties() == null ? null : userInfoResponse.properties().nickname();
        String profileImageUrl = userInfoResponse.properties() == null ? null : userInfoResponse.properties().profileImage();
        String email = userInfoResponse.kakaoAccount() == null ? null : userInfoResponse.kakaoAccount().email();

        return new KakaoUserInfo(
                Long.toString(userInfoResponse.id()),
                nickname,
                profileImageUrl,
                email
        );
    }

    private KakaoTokenResponse exchangeAuthorizationCode(String authorizationCode) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", kakaoAuthConfig.getClientId());
        formData.add("redirect_uri", kakaoAuthConfig.getRedirectUri());
        formData.add("code", authorizationCode);

        if (kakaoAuthConfig.getClientSecret() != null && !kakaoAuthConfig.getClientSecret().isBlank()) {
            formData.add("client_secret", kakaoAuthConfig.getClientSecret());
        }

        try {
            KakaoTokenResponse response = restClient.post()
                    .uri(UriComponentsBuilder.fromHttpUrl(kakaoAuthConfig.getAuthorizeBaseUrl())
                            .path(kakaoAuthConfig.getTokenPath())
                            .build(true)
                            .toUri())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new KakaoAuthFailedException("kakao authorization code is invalid.");
                    })
                    .body(KakaoTokenResponse.class);

            if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
                throw new KakaoAuthFailedException("kakao token response is empty.");
            }

            return response;
        } catch (KakaoAuthFailedException e) {
            throw e;
        } catch (Exception e) {
            throw new KakaoAuthFailedException("failed to exchange kakao authorization code.");
        }
    }

    private KakaoUserInfoResponse fetchUserInfo(String accessToken) {
        try {
            return restClient.get()
                    .uri(UriComponentsBuilder.fromHttpUrl(kakaoAuthConfig.getApiBaseUrl())
                            .path(kakaoAuthConfig.getUserInfoPath())
                            .build(true)
                            .toUri())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new KakaoAuthFailedException("failed to fetch kakao user info.");
                    })
                    .body(KakaoUserInfoResponse.class);
        } catch (KakaoAuthFailedException e) {
            throw e;
        } catch (Exception e) {
            throw new KakaoAuthFailedException("failed to call kakao user info endpoint.");
        }
    }

    private record KakaoTokenResponse(
            @JsonProperty("token_type")
            String tokenType,
            @JsonProperty("access_token")
            String accessToken
    ) {
    }

    private record KakaoUserInfoResponse(
            Long id,
            KakaoProperties properties,
            KakaoAccount kakaoAccount
    ) {
    }

    private record KakaoProperties(
            String nickname,
            @JsonProperty("profile_image")
            String profileImage
    ) {
    }

    private record KakaoAccount(
            String email
    ) {
    }
}
