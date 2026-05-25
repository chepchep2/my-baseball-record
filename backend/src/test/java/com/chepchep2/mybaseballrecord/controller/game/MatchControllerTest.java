package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidateItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidatesResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchDetailResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchStadiumSuggestionItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchStadiumSuggestionsResponse;
import com.chepchep2.mybaseballrecord.service.game.MatchCommandService;
import com.chepchep2.mybaseballrecord.service.game.MatchQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MatchController.class)
@AutoConfigureMockMvc(addFilters = false)
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MatchQueryService matchQueryService;

    @MockBean
    private MatchCommandService matchCommandService;

    @Test
    @DisplayName("GET /api/matches/candidates - 후보 목록을 반환한다")
    void getCandidatesReturnsItems() throws Exception {
        when(matchQueryService.findCandidates(
                eq(LocalDate.parse("2026-05-20")),
                eq(10),
                eq(30),
                eq("부산시"),
                eq("강서구"),
                eq(false)
        )).thenReturn(new MatchCandidatesResponse(
                List.of(new MatchCandidateItemResponse(11L, LocalDate.parse("2026-05-20"), 10, 30, "5/20 10:30", "부산시", "강서구", "맥도A")),
                false
        ));

        mockMvc.perform(get("/api/matches/candidates")
                        .queryParam("playedDate", "2026-05-20")
                        .queryParam("playedHour", "10")
                        .queryParam("playedMinute", "30")
                        .queryParam("cityName", "부산시")
                        .queryParam("districtName", "강서구"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].gameId").value(11L))
                .andExpect(jsonPath("$.items[0].stadiumName").value("맥도A"));
    }

    @Test
    @DisplayName("GET /api/matches/stadiums - 지역별 구장 추천 목록을 반환한다")
    void getStadiumSuggestionsReturnsItems() throws Exception {
        when(matchQueryService.getStadiumSuggestions("부산시", "강서구"))
                .thenReturn(new MatchStadiumSuggestionsResponse(
                        List.of(
                                new MatchStadiumSuggestionItemResponse(71L, "맥도A"),
                                new MatchStadiumSuggestionItemResponse(72L, "맥도B")
                        )
                ));

        mockMvc.perform(get("/api/matches/stadiums")
                        .queryParam("cityName", "부산시")
                        .queryParam("districtName", "강서구"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].stadiumId").value(71L))
                .andExpect(jsonPath("$.items[1].stadiumName").value("맥도B"));
    }

    @Test
    @DisplayName("GET /api/matches/{gameId} - 상세를 반환한다")
    void getDetailReturnsResponse() throws Exception {
        when(matchQueryService.getDetail(21L)).thenReturn(new MatchDetailResponse(
                21L,
                LocalDate.parse("2026-05-20"),
                10,
                30,
                "5/20 10:30",
                "부산시",
                "강서구",
                "맥도A",
                false,
                true,
                List.of()
        ));

        mockMvc.perform(get("/api/matches/21"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(21L))
                .andExpect(jsonPath("$.stadiumName").value("맥도A"));
    }

    @Test
    @DisplayName("POST /api/matches - 새 shared 경기를 생성한다")
    void createMatchReturnsCreated() throws Exception {
        when(matchCommandService.create(org.mockito.ArgumentMatchers.any())).thenReturn(new MatchDetailResponse(
                91L,
                LocalDate.parse("2026-05-20"),
                10,
                30,
                "5/20 10:30",
                "부산시",
                "강서구",
                "맥도A",
                true,
                false,
                List.of()
        ));

        mockMvc.perform(post("/api/matches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "playedDate": "2026-05-20",
                                  "playedHour": 10,
                                  "playedMinute": 30,
                                  "cityName": "부산시",
                                  "districtName": "강서구",
                                  "stadiumName": "맥도A"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.gameId").value(91L))
                .andExpect(jsonPath("$.cityName").value("부산시"));
    }

    @Test
    @DisplayName("POST /api/matches/{gameId}/records - 내 기록을 생성한다")
    void createRecordReturnsCreated() throws Exception {
        mockMvc.perform(post("/api/matches/21/records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plateAppearances": 5,
                                  "walksAndHitByPitch": 1,
                                  "singles": 1,
                                  "doubles": 1,
                                  "triples": 0,
                                  "homeRuns": 0
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/matches/{gameId}/records/{batterRecordId}/verification - 기록을 인증한다")
    void verifyRecordReturnsNoContent() throws Exception {
        mockMvc.perform(post("/api/matches/21/records/31/verification"))
                .andExpect(status().isNoContent());
    }
}
