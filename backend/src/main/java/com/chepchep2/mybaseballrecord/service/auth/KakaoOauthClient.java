package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.dto.auth.KakaoUserInfo;

public interface KakaoOauthClient {
    KakaoUserInfo getUserInfo(String authorizationCode);
}
