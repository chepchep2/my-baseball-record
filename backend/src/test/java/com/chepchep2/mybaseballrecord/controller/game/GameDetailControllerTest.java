package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.service.game.GameQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameQueryController.class)
@AutoConfigureMockMvc(addFilters = false)
class GameDetailControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameQueryService gameQueryService;

    @Test
    @DisplayName("GET /api/games/{id} - 성공 시 200과 개별 경기 상세를 반환한다")
    void getGameDetailReturnsDetail() throws Exception {
        given(gameQueryService.getDetail(101L))
                .willReturn(new GameDetailResponse(
                        101L,
                        LocalDate.parse("2026-03-18"),
                        0,
                        0,
                        "3/18 00:00",
                        4,
                        1,
                        1,
                        1,
                        0,
                        1,
                        3,
                        3,
                        1.0,
                        1.0,
                        1.667,
                        2.667
                ));

        mockMvc.perform(get("/api/games/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(101))
                .andExpect(jsonPath("$.playedDate").value("2026-03-18"))
                .andExpect(jsonPath("$.plateAppearances").value(4))
                .andExpect(jsonPath("$.atBats").value(3))
                .andExpect(jsonPath("$.hits").value(3))
                .andExpect(jsonPath("$.battingAverage").value(1.0));
    }

    @Test
    @DisplayName("GET /api/games/{id} - 없는 경기면 404 GAME_NOT_FOUND")
    void getGameDetailReturnsNotFound() throws Exception {
        given(gameQueryService.getDetail(999L))
                .willThrow(new GameNotFoundException(999L));

        mockMvc.perform(get("/api/games/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("GAME_NOT_FOUND"));
    }
}
