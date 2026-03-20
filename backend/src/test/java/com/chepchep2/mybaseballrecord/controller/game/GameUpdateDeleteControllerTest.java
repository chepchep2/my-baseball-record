package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.dto.game.response.GameBatterResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameInfoResponse;
import com.chepchep2.mybaseballrecord.service.game.GameCommandService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameCommandController.class)
@AutoConfigureMockMvc(addFilters = false)
class GameUpdateDeleteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameCommandService gameCommandService;

    @Test
    @DisplayName("PUT /api/games/{id} - 유효한 요청이면 200과 개별 경기 상세를 반환한다")
    void putGameReturnsUpdatedDetail() throws Exception {
        given(gameCommandService.update(any(Long.class), any()))
                .willReturn(new GameDetailResponse(
                        101L,
                        new GameInfoResponse(
                                LocalDate.parse("2026-03-18"),
                                2026,
                                GameType.LEAGUE,
                                "수정된 팀명",
                                "수정된 상대팀",
                                "수정 메모"
                        ),
                        ParticipationType.BATTER,
                        new GameBatterResponse(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                        null
                ));

        mockMvc.perform(put("/api/games/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "gameInfo": {
                                    "playedAt": "2026-03-18",
                                    "seasonYear": 2026,
                                    "gameType": "LEAGUE",
                                    "teamName": "수정된 팀명",
                                    "opponentName": "수정된 상대팀",
                                    "memo": "수정 메모"
                                  },
                                  "batter": {
                                    "plateAppearances": 4,
                                    "atBats": 3,
                                    "singles": 1,
                                    "doubles": 1,
                                    "triples": 0,
                                    "homeRuns": 1,
                                    "walks": 1,
                                    "strikeOuts": 0,
                                    "hitByPitch": 0,
                                    "runsBattedIn": 3,
                                    "runs": 2,
                                    "stolenBases": 0,
                                    "caughtStealing": 0,
                                    "sacrificeHits": 0
                                  },
                                  "pitcher": null
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.gameInfo.teamName").value("수정된 팀명"));
    }

    @Test
    @DisplayName("PUT /api/games/{id} - gameInfo.teamName 누락이면 400 VALIDATION_ERROR")
    void putGameValidationErrorWhenTeamNameMissing() throws Exception {
        mockMvc.perform(put("/api/games/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "gameInfo": {
                                    "playedAt": "2026-03-18",
                                    "seasonYear": 2026,
                                    "gameType": "LEAGUE",
                                    "opponentName": "레전드"
                                  },
                                  "batter": {
                                    "plateAppearances": 4,
                                    "atBats": 3,
                                    "singles": 1,
                                    "doubles": 1,
                                    "triples": 0,
                                    "homeRuns": 1,
                                    "walks": 1,
                                    "strikeOuts": 0,
                                    "hitByPitch": 0,
                                    "runsBattedIn": 3,
                                    "runs": 2,
                                    "stolenBases": 0,
                                    "caughtStealing": 0,
                                    "sacrificeHits": 0
                                  }
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("DELETE /api/games/{id} - 성공 시 204를 반환한다")
    void deleteGameReturnsNoContent() throws Exception {
        doNothing().when(gameCommandService).delete(101L);

        mockMvc.perform(delete("/api/games/101"))
                .andExpect(status().isNoContent());
    }
}
