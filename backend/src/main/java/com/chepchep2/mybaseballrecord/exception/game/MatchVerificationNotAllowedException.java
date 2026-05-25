package com.chepchep2.mybaseballrecord.exception.game;

public class MatchVerificationNotAllowedException extends RuntimeException {
    public MatchVerificationNotAllowedException() {
        super("이 기록을 인증할 권한이 없습니다.");
    }
}
