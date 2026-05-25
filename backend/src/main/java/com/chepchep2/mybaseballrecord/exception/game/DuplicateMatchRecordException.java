package com.chepchep2.mybaseballrecord.exception.game;

public class DuplicateMatchRecordException extends IllegalArgumentException {
    public DuplicateMatchRecordException(long gameId) {
        super("이미 해당 경기의 기록이 존재합니다. gameId=" + gameId);
    }
}
