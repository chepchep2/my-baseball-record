package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
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
    @DisplayName("POST /api/games - 새 타자 전용 요청이면 201과 flat 경기 상세를 반환한다")
    void postGamesReturnsFlatCreatedDetail() throws Exception {
        given(gameCommandService.create(any()))
                .willReturn(new GameDetailResponse(
                        101L,
                        LocalDate.parse("2026-03-27"),
                        19,
                        0,
                        "3/27 19:00",
                        5,
                        1,
                        2,
                        0,
                        0,
                        1,
                        4,
                        3,
                        0.750,
                        0.800,
                        1.500,
                        2.300
                ));

        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "playedDate": "2026-03-27",
                                  "playedHour": 19,
                                  "playedMinute": 0,
                                  "plateAppearances": 5,
                                  "walksAndHitByPitch": 1,
                                  "singles": 2,
                                  "doubles": 0,
                                  "triples": 0,
                                  "homeRuns": 1
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.gameId").value(101))
                .andExpect(jsonPath("$.playedDate").value("2026-03-27"))
                .andExpect(jsonPath("$.playedHour").value(19))
                .andExpect(jsonPath("$.playedAtLabel").value("3/27 19:00"))
                .andExpect(jsonPath("$.plateAppearances").value(5))
                .andExpect(jsonPath("$.walksAndHitByPitch").value(1))
                .andExpect(jsonPath("$.atBats").value(4))
                .andExpect(jsonPath("$.hits").value(3))
                .andExpect(jsonPath("$.ops").value(2.300));
    }

    @Test
    @DisplayName("POST /api/games - playedDate 누락이면 400 VALIDATION_ERROR")
    void postGamesValidationErrorWhenPlayedDateMissing() throws Exception {
        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "playedHour": 19,
                                  "playedMinute": 0,
                                  "plateAppearances": 5,
                                  "walksAndHitByPitch": 1,
                                  "singles": 2,
                                  "doubles": 0,
                                  "triples": 0,
                                  "homeRuns": 1
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("POST /api/games - 기존 nested 요청 shape면 400 VALIDATION_ERROR")
    void postGamesRejectsOldNestedRequestShape() throws Exception {
        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "gameInfo": {
                                    "playedAt": "2026-03-27",
                                    "seasonYear": 2026,
                                    "gameType": "LEAGUE"
                                  },
                                  "batter": {
                                    "plateAppearances": 5,
                                    "atBats": 4,
                                    "singles": 2,
                                    "doubles": 0,
                                    "triples": 0,
                                    "homeRuns": 1,
                                    "walks": 1,
                                    "hitByPitch": 0
                                  }
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
