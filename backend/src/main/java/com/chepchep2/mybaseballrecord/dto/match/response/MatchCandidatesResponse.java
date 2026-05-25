package com.chepchep2.mybaseballrecord.dto.match.response;

import java.util.List;

public record MatchCandidatesResponse(
        List<MatchCandidateItemResponse> items,
        boolean expandedScope
) {
}
