ALTER TABLE game_record
    ALTER COLUMN played_at TYPE TIMESTAMP
    USING played_at::timestamp;
