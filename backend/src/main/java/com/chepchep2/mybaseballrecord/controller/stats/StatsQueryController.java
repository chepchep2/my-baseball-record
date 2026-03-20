package com.chepchep2.mybaseballrecord.controller.stats;

import com.chepchep2.mybaseballrecord.domain.stats.StatsGameFilter;
import com.chepchep2.mybaseballrecord.domain.stats.StatsRecordType;
import com.chepchep2.mybaseballrecord.domain.stats.StatsScope;
import com.chepchep2.mybaseballrecord.service.stats.StatsQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsQueryController {

    private final StatsQueryService statsQueryService;

    public StatsQueryController(StatsQueryService statsQueryService) {
        this.statsQueryService = statsQueryService;
    }

    @GetMapping
    public ResponseEntity<?> getStats(
            @RequestParam StatsScope scope,
            @RequestParam(required = false) Integer seasonYear,
            @RequestParam StatsRecordType recordType,
            @RequestParam StatsGameFilter gameFilter
    ) {
        return ResponseEntity.ok(
                statsQueryService.query(scope, seasonYear, recordType, gameFilter)
        );
    }
}
