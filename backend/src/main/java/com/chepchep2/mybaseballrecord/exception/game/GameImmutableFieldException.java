package com.chepchep2.mybaseballrecord.exception.game;

public class GameImmutableFieldException extends RuntimeException {
    public GameImmutableFieldException(String fieldName) {
        super(fieldName + " 필드는 수정할 수 없습니다.");
    }
}
