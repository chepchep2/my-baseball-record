package com.chepchep2.mybaseballrecord.exception.game;

public class BatterRecordNotFoundException extends RuntimeException {
    public BatterRecordNotFoundException(long batterRecordId) {
        super("해당 타자 기록을 찾을 수 없습니다. batterRecordId=" + batterRecordId);
    }
}
