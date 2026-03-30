package com.chepchep2.mybaseballrecord.exception.auth;

public class KakaoAuthFailedException extends RuntimeException {
    public KakaoAuthFailedException(String message) {
        super(message);
    }
}
