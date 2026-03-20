package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.dto.game.response.GameBatterResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameInfoResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GamePitcherResponse;
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
                        new GameInfoResponse(
                                LocalDate.parse("2026-03-18"),
                                2026,
                                GameType.LEAGUE,
                                "블루스톰",
                                "레전드",
                                "비 오는 날 경기"
                        ),
                        ParticipationType.BOTH,
                        new GameBatterResponse(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                        new GamePitcherResponse(1, 0, 0, 0, 1, 0, 0, 0, 2, 4, 0, 0, 0, 0)
                ));

        mockMvc.perform(get("/api/games/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.gameInfo.gameType").value("LEAGUE"))
                .andExpect(jsonPath("$.participationType").value("BOTH"))
                .andExpect(jsonPath("$.batter.atBats").value(3))
                .andExpect(jsonPath("$.pitcher.innings").value(1));
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
