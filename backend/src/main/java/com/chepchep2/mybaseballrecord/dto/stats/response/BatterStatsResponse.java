package com.chepchep2.mybaseballrecord.dto.stats.response;

import com.chepchep2.mybaseballrecord.domain.stats.StatsGameFilter;
import com.chepchep2.mybaseballrecord.domain.stats.StatsRecordType;
import com.chepchep2.mybaseballrecord.domain.stats.StatsScope;

public record BatterStatsResponse(
        StatsScope scope,
        Integer seasonYear,
        StatsRecordType recordType,
        StatsGameFilter gameFilter,
        BatterStatsSummary summary,
        BatterStatsDetails details,
        boolean isEmpty
) {
}
