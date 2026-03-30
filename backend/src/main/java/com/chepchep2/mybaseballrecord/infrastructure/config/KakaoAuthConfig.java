package com.chepchep2.mybaseballrecord.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth.kakao")
public class KakaoAuthConfig {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String frontendRedirectUri;
    private String authorizeBaseUrl = "https://kauth.kakao.com";
    private String apiBaseUrl = "https://kapi.kakao.com";
    private String tokenPath = "/oauth/token";
    private String userInfoPath = "/v2/user/me";

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getFrontendRedirectUri() {
        return frontendRedirectUri;
    }

    public void setFrontendRedirectUri(String frontendRedirectUri) {
        this.frontendRedirectUri = frontendRedirectUri;
    }

    public String getAuthorizeBaseUrl() {
        return authorizeBaseUrl;
    }

    public void setAuthorizeBaseUrl(String authorizeBaseUrl) {
        this.authorizeBaseUrl = authorizeBaseUrl;
    }

    public String getApiBaseUrl() {
        return apiBaseUrl;
    }

    public void setApiBaseUrl(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    public String getTokenPath() {
        return tokenPath;
    }

    public void setTokenPath(String tokenPath) {
        this.tokenPath = tokenPath;
    }

    public String getUserInfoPath() {
        return userInfoPath;
    }

    public void setUserInfoPath(String userInfoPath) {
        this.userInfoPath = userInfoPath;
    }
}
