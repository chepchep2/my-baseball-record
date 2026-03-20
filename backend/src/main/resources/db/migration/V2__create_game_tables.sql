CREATE TABLE game_record (
    id BIGSERIAL PRIMARY KEY,
    played_at DATE NOT NULL,
    season_year INTEGER NOT NULL,
    game_type VARCHAR(20) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    opponent_name VARCHAR(100) NOT NULL,
    memo VARCHAR(1000),
    participation_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE batter_record (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL UNIQUE,
    plate_appearances INTEGER NOT NULL,
    at_bats INTEGER NOT NULL,
    singles_count INTEGER NOT NULL,
    doubles_count INTEGER NOT NULL,
    triples_count INTEGER NOT NULL,
    home_runs INTEGER NOT NULL,
    walks INTEGER NOT NULL,
    strike_outs INTEGER NOT NULL,
    hit_by_pitch INTEGER NOT NULL,
    runs_batted_in INTEGER NOT NULL,
    runs INTEGER NOT NULL,
    stolen_bases INTEGER NOT NULL,
    caught_stealing INTEGER NOT NULL,
    sacrifice_hits INTEGER NOT NULL,
    CONSTRAINT fk_batter_record_game_id
        FOREIGN KEY (game_id) REFERENCES game_record(id) ON DELETE CASCADE
);

CREATE TABLE pitcher_record (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL UNIQUE,
    innings INTEGER NOT NULL,
    additional_outs INTEGER NOT NULL,
    runs_allowed INTEGER NOT NULL,
    earned_runs INTEGER NOT NULL,
    hits_allowed INTEGER NOT NULL,
    walks INTEGER NOT NULL,
    hit_by_pitch INTEGER NOT NULL,
    home_runs_allowed INTEGER NOT NULL,
    strike_outs INTEGER NOT NULL,
    batters_faced INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    saves INTEGER NOT NULL,
    holds INTEGER NOT NULL,
    CONSTRAINT fk_pitcher_record_game_id
        FOREIGN KEY (game_id) REFERENCES game_record(id) ON DELETE CASCADE
);
