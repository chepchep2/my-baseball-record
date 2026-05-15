ALTER TABLE batter_record
    ADD COLUMN user_id BIGINT;

UPDATE batter_record br
SET user_id = gr.user_id
FROM game_record gr
WHERE br.game_id = gr.id
  AND br.user_id IS NULL;

ALTER TABLE batter_record
    ADD CONSTRAINT fk_batter_record_user_id
        FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE;

CREATE INDEX idx_batter_record_user_id
    ON batter_record (user_id);
