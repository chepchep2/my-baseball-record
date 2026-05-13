package com.chepchep2.mybaseballrecord.controller.stats;

import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsSummaryResponse;
import com.chepchep2.mybaseballrecord.service.stats.StatsQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsQueryController.class)
@AutoConfigureMockMvc(addFilters = false)
class StatsQueryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatsQueryService statsQueryService;

    @Test
    @DisplayName("GET /api/stats?scope=season - 200과 1차 홈 요약 응답을 반환한다")
    void getStatsSeasonReturnsMilestoneSummary() throws Exception {
        given(statsQueryService.query("season"))
                .willReturn(new BatterStatsSummaryResponse(
                        "season",
                        8,
                        31,
                        4,
                        "0.321",
                        "0.912",
                        18,
                        "0.402",
                        "0.510"
                ));

        mockMvc.perform(get("/api/stats")
                        .queryParam("scope", "season")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scope").value("season"))
                .andExpect(jsonPath("$.games").value(8))
                .andExpect(jsonPath("$.plateAppearances").value(31))
                .andExpect(jsonPath("$.walksAndHitByPitch").value(4))
                .andExpect(jsonPath("$.battingAverage").value("0.321"))
                .andExpect(jsonPath("$.ops").value("0.912"))
                .andExpect(jsonPath("$.hits").value(18))
                .andExpect(jsonPath("$.onBasePercentage").value("0.402"))
                .andExpect(jsonPath("$.sluggingPercentage").value("0.510"));
    }

    @Test
    @DisplayName("GET /api/stats?scope=career - 200과 통산 요약 응답을 반환한다")
    void getStatsCareerReturnsMilestoneSummary() throws Exception {
        given(statsQueryService.query("career"))
                .willReturn(new BatterStatsSummaryResponse(
                        "career",
                        24,
                        93,
                        12,
                        "0.287",
                        "0.801",
                        84,
                        "0.361",
                        "0.440"
                ));

        mockMvc.perform(get("/api/stats")
                        .queryParam("scope", "career")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scope").value("career"))
                .andExpect(jsonPath("$.games").value(24))
                .andExpect(jsonPath("$.plateAppearances").value(93))
                .andExpect(jsonPath("$.walksAndHitByPitch").value(12))
                .andExpect(jsonPath("$.hits").value(84));
    }
}
