CREATE TABLE stadium (
    id BIGSERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    stadium_name VARCHAR(150) NOT NULL,
    normalized_name VARCHAR(200) NOT NULL,
    created_by_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_stadium_created_by_user_id
        FOREIGN KEY (created_by_user_id) REFERENCES auth_user(id) ON DELETE SET NULL
);

CREATE INDEX idx_stadium_city_district
    ON stadium (city_name, district_name);

CREATE INDEX idx_stadium_normalized_name
    ON stadium (normalized_name);

ALTER TABLE game_record
    ADD COLUMN created_by_user_id BIGINT,
    ADD COLUMN city_name VARCHAR(100),
    ADD COLUMN district_name VARCHAR(100),
    ADD COLUMN stadium_id BIGINT,
    ADD COLUMN stadium_name_snapshot VARCHAR(150);

ALTER TABLE game_record
    ADD CONSTRAINT fk_game_record_created_by_user_id
        FOREIGN KEY (created_by_user_id) REFERENCES auth_user(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_game_record_stadium_id
        FOREIGN KEY (stadium_id) REFERENCES stadium(id) ON DELETE SET NULL;

CREATE INDEX idx_game_record_created_by_user_id
    ON game_record (created_by_user_id);

CREATE INDEX idx_game_record_city_district_played_at
    ON game_record (city_name, district_name, played_at);

UPDATE game_record
SET created_by_user_id = user_id
WHERE created_by_user_id IS NULL
  AND user_id IS NOT NULL;
