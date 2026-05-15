package com.chepchep2.mybaseballrecord.exception.game;

public class DuplicateMatchVerificationException extends IllegalArgumentException {
    public DuplicateMatchVerificationException(long batterRecordId) {
        super("이미 해당 기록을 인증했습니다. batterRecordId=" + batterRecordId);
    }
}
