package com.chepchep2.mybaseballrecord.exception.auth;

public class InvalidGoogleTokenException extends RuntimeException {
    public InvalidGoogleTokenException(String message) {
        super(message);
    }
}
