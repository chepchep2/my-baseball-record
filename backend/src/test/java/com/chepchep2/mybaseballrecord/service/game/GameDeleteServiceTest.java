package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameDeleteServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private PitcherRecordRepository pitcherRecordRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private GameCommandService gameCommandService;

    @Test
    @DisplayName("경기가 존재하면 삭제한다")
    void deleteGameWhenExists() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.existsByIdAndUserId(101L, 1L)).thenReturn(true);

        gameCommandService.delete(101L);

        verify(gameRecordRepository).deleteById(101L);
    }

    @Test
    @DisplayName("경기가 존재하지 않으면 GAME_NOT_FOUND 예외를 던진다")
    void deleteFailsWhenGameNotExists() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.existsByIdAndUserId(999L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> gameCommandService.delete(999L))
                .isInstanceOf(GameNotFoundException.class);
    }
}
