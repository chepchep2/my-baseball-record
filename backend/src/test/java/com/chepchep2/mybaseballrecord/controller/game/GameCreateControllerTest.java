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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameCommandController.class)
@AutoConfigureMockMvc(addFilters = false)
class GameCreateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameCommandService gameCommandService;

    @Test
    @DisplayName("POST /api/games - 유효한 요청이면 201과 개별 경기 상세를 반환한다")
    void postGamesReturnsCreatedGameDetail() throws Exception {
        given(gameCommandService.create(any()))
                .willReturn(new GameDetailResponse(
                        101L,
                        new GameInfoResponse(
                                LocalDate.parse("2026-03-18"),
                                2026,
                                GameType.LEAGUE,
                                "블루스톰",
                                "레전드",
                                "비 오는 날 경기"
                        ),
                        ParticipationType.BATTER,
                        new GameBatterResponse(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                        null
                ));

        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "gameInfo": {
                                    "playedAt": "2026-03-18",
                                    "seasonYear": 2026,
                                    "gameType": "LEAGUE",
                                    "teamName": "블루스톰",
                                    "opponentName": "레전드",
                                    "memo": "비 오는 날 경기"
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
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.gameInfo.gameType").value("LEAGUE"))
                .andExpect(jsonPath("$.participationType").value("BATTER"));
    }

    @Test
    @DisplayName("POST /api/games - gameInfo.playedAt 누락이면 400 VALIDATION_ERROR")
    void postGamesValidationErrorWhenPlayedAtMissing() throws Exception {
        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "gameInfo": {
                                    "seasonYear": 2026,
                                    "gameType": "LEAGUE",
                                    "teamName": "블루스톰",
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
    @DisplayName("POST /api/games - teamName 누락도 허용한다")
    void postGamesAllowsMissingTeamName() throws Exception {
        given(gameCommandService.create(any()))
                .willReturn(new GameDetailResponse(
                        102L,
                        new GameInfoResponse(
                                LocalDate.parse("2026-03-18"),
                                2026,
                                GameType.LEAGUE,
                                "",
                                "레전드",
                                null
                        ),
                        ParticipationType.BATTER,
                        new GameBatterResponse(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                        null
                ));

        mockMvc.perform(post("/api/games")
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
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(102))
                .andExpect(jsonPath("$.gameInfo.teamName").value(""));
    }
}
