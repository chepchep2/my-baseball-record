CREATE TABLE auth_user (
    id BIGSERIAL PRIMARY KEY,
    google_subject VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    provider VARCHAR(20) NOT NULL
);

CREATE TABLE auth_refresh_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_auth_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES auth_user(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_auth_refresh_token_user_id
    ON auth_refresh_token(user_id);
