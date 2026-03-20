package com.chepchep2.mybaseballrecord.exception.game;

public class GameNotFoundException extends RuntimeException {
    public GameNotFoundException(long gameId) {
        super("해당 경기를 찾을 수 없습니다. gameId=" + gameId);
    }
}
