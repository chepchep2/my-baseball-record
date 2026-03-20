package com.chepchep2.mybaseballrecord.controller.game;

import com.chepchep2.mybaseballrecord.dto.game.request.GameCreateRequest;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.service.game.GameCommandService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
public class GameCommandController {
    private final GameCommandService gameCommandService;

    public GameCommandController(GameCommandService gameCommandService) {
        this.gameCommandService = gameCommandService;
    }

    @PostMapping
    public ResponseEntity<GameDetailResponse> create(@Valid @RequestBody GameCreateRequest request) {
        GameDetailResponse response = gameCommandService.create(request);
        return ResponseEntity.status(201).body(response);
    }
}
