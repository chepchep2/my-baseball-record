package com.chepchep2.mybaseballrecord.controller.stats;

import com.chepchep2.mybaseballrecord.domain.stats.StatsGameFilter;
import com.chepchep2.mybaseballrecord.domain.stats.StatsRecordType;
import com.chepchep2.mybaseballrecord.domain.stats.StatsScope;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsDetails;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsResponse;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsSummary;
import com.chepchep2.mybaseballrecord.exception.stats.InvalidStatsQueryException;
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
    @DisplayName("GET /api/stats - batter 조회 성공 시 200과 계약 응답을 반환한다")
    void getStatsReturnsBatterResponse() throws Exception {
        given(statsQueryService.query(
                StatsScope.current_season,
                null,
                StatsRecordType.batter,
                StatsGameFilter.all
        )).willReturn(
                new BatterStatsResponse(
                        StatsScope.current_season,
                        2026,
                        StatsRecordType.batter,
                        StatsGameFilter.all,
                        new BatterStatsSummary(24, 88, 31, "0.352", "0.898"),
                        new BatterStatsDetails(88, 3, 18, "0.410", "0.488", 22, 5, 1, 9, 2, 4, 1, 2, 14),
                        false
                )
        );

        mockMvc.perform(get("/api/stats")
                        .queryParam("scope", "current_season")
                        .queryParam("recordType", "batter")
                        .queryParam("gameFilter", "all")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scope").value("current_season"))
                .andExpect(jsonPath("$.recordType").value("batter"))
                .andExpect(jsonPath("$.summary.games").value(24))
                .andExpect(jsonPath("$.details.onBasePercentage").value("0.410"))
                .andExpect(jsonPath("$.isEmpty").value(false));
    }

    @Test
    @DisplayName("GET /api/stats - season scope에서 seasonYear 누락이면 400 VALIDATION_ERROR")
    void getStatsReturnsValidationErrorWhenSeasonYearMissing() throws Exception {
        given(statsQueryService.query(
                StatsScope.season,
                null,
                StatsRecordType.batter,
                StatsGameFilter.all
        )).willThrow(new InvalidStatsQueryException("seasonYear는 scope=season일 때 필수입니다.", "seasonYear"));

        mockMvc.perform(get("/api/stats")
                        .queryParam("scope", "season")
                        .queryParam("recordType", "batter")
                        .queryParam("gameFilter", "all")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("seasonYear"));
    }
}
