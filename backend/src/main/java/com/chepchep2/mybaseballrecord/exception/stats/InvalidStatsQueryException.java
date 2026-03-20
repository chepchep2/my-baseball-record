package com.chepchep2.mybaseballrecord.exception.stats;

public class InvalidStatsQueryException extends RuntimeException {
    private final String field;

    public InvalidStatsQueryException(String message, String field) {
        super(message);
        this.field = field;
    }

    public String field() {
        return field;
    }
}
