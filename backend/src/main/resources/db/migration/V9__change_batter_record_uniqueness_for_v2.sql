ALTER TABLE batter_record
    DROP CONSTRAINT IF EXISTS batter_record_game_id_key;

ALTER TABLE batter_record
    ADD CONSTRAINT uq_batter_record_game_user
        UNIQUE (game_id, user_id);
