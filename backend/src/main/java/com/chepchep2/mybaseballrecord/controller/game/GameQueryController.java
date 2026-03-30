package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGamesResponse;
import com.chepchep2.mybaseballrecord.service.game.GameQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
public class GameQueryController {

    private final GameQueryService gameQueryService;

    public GameQueryController(GameQueryService gameQueryService) {
        this.gameQueryService = gameQueryService;
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameDetailResponse> getDetail(@PathVariable long gameId) {
        return ResponseEntity.ok(gameQueryService.getDetail(gameId));
    }

    @GetMapping("/recent")
    public ResponseEntity<RecentGamesResponse> getRecent(@RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(gameQueryService.getRecent(limit));
    }
}
