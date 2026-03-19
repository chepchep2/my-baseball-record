package com.chepchep2.mybaseballrecord.exception.auth;

public class GoogleAuthFailedException extends RuntimeException {
    public GoogleAuthFailedException(String message) {
        super(message);
    }
}
