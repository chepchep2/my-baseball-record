package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.game.response.RecentGameItemResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGamesResponse;
import com.chepchep2.mybaseballrecord.service.game.GameQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameQueryController.class)
@AutoConfigureMockMvc(addFilters = false)
class GameQueryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameQueryService gameQueryService;

    @Test
    @DisplayName("GET /api/games/recent?limit=3 - 최근 경기 목록을 반환한다")
    void getRecentReturnsRecentGames() throws Exception {
        given(gameQueryService.getRecent(3))
                .willReturn(new RecentGamesResponse(List.of(
                        new RecentGameItemResponse(
                                101L, "2026-03-27", 19, 0, "3/27 19:00",
                                5, 1, 2, 0, 0, 1,
                                4, 3, "0.750", "0.800", "1.500", "2.300"
                        ),
                        new RecentGameItemResponse(
                                100L, "2026-03-20", 14, 10, "3/20 14:10",
                                4, 0, 1, 1, 0, 0,
                                4, 2, "0.500", "0.500", "0.750", "1.250"
                        )
                )));

        mockMvc.perform(get("/api/games/recent").queryParam("limit", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].gameId").value(101))
                .andExpect(jsonPath("$.items[0].playedAtLabel").value("3/27 19:00"))
                .andExpect(jsonPath("$.items[0].ops").value("2.300"));
    }
}
