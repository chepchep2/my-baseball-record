package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.match.request.MatchCreateRequest;
import com.chepchep2.mybaseballrecord.dto.match.request.MatchRecordCreateRequest;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidatesResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchDetailResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchStadiumSuggestionsResponse;
import com.chepchep2.mybaseballrecord.service.game.MatchCommandService;
import com.chepchep2.mybaseballrecord.service.game.MatchQueryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    private final MatchQueryService matchQueryService;
    private final MatchCommandService matchCommandService;

    public MatchController(MatchQueryService matchQueryService, MatchCommandService matchCommandService) {
        this.matchQueryService = matchQueryService;
        this.matchCommandService = matchCommandService;
    }

    @GetMapping("/candidates")
    public ResponseEntity<MatchCandidatesResponse> getCandidates(
            @RequestParam LocalDate playedDate,
            @RequestParam int playedHour,
            @RequestParam int playedMinute,
            @RequestParam String cityName,
            @RequestParam String districtName,
            @RequestParam(defaultValue = "false") boolean expandScope
    ) {
        return ResponseEntity.ok(matchQueryService.findCandidates(
                playedDate,
                playedHour,
                playedMinute,
                cityName,
                districtName,
                expandScope
        ));
    }

    @GetMapping("/stadiums")
    public ResponseEntity<MatchStadiumSuggestionsResponse> getStadiumSuggestions(
            @RequestParam String cityName,
            @RequestParam String districtName
    ) {
        return ResponseEntity.ok(matchQueryService.getStadiumSuggestions(cityName, districtName));
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<MatchDetailResponse> getDetail(@PathVariable long gameId) {
        return ResponseEntity.ok(matchQueryService.getDetail(gameId));
    }

    @PostMapping
    public ResponseEntity<MatchDetailResponse> create(@Valid @RequestBody MatchCreateRequest request) {
        return ResponseEntity.status(201).body(matchCommandService.create(request));
    }

    @PostMapping("/{gameId}/records")
    public ResponseEntity<Void> createRecord(
            @PathVariable long gameId,
            @Valid @RequestBody MatchRecordCreateRequest request
    ) {
        matchCommandService.createRecord(gameId, request);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/{gameId}/records/{batterRecordId}/verification")
    public ResponseEntity<Void> verifyRecord(
            @PathVariable long gameId,
            @PathVariable long batterRecordId
    ) {
        matchCommandService.verifyRecord(gameId, batterRecordId);
        return ResponseEntity.noContent().build();
    }
}
