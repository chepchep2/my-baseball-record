CREATE TABLE batter_record_verification (
    id BIGSERIAL PRIMARY KEY,
    batter_record_id BIGINT NOT NULL,
    verified_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_batter_record_verification_batter_record_id
        FOREIGN KEY (batter_record_id) REFERENCES batter_record(id) ON DELETE CASCADE,
    CONSTRAINT fk_batter_record_verification_verified_by_user_id
        FOREIGN KEY (verified_by_user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    CONSTRAINT uq_batter_record_verification_record_user
        UNIQUE (batter_record_id, verified_by_user_id)
);

CREATE INDEX idx_batter_record_verification_verified_by_user_id
    ON batter_record_verification (verified_by_user_id);
