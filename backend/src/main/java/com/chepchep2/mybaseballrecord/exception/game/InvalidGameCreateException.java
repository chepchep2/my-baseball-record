package com.chepchep2.mybaseballrecord.exception.game;

public class InvalidGameCreateException extends IllegalArgumentException {
    private final String field;

    public InvalidGameCreateException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String field() {
        return field;
    }
}
