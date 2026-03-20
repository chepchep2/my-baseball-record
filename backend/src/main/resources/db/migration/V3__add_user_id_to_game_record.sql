ALTER TABLE game_record
    ADD COLUMN user_id BIGINT;

ALTER TABLE game_record
    ADD CONSTRAINT fk_game_record_user_id
        FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE;

CREATE INDEX idx_game_record_user_id
    ON game_record(user_id);
