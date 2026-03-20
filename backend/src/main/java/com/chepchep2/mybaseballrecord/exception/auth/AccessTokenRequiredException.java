package com.chepchep2.mybaseballrecord.exception.auth;

public class AccessTokenRequiredException extends RuntimeException {
    public AccessTokenRequiredException(String message) {
        super(message);
    }
}
