ALTER TABLE game_record
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE
    USING created_at AT TIME ZONE 'UTC';

ALTER TABLE game_record
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE
    USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE auth_user
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

UPDATE auth_user
SET created_at = NOW(),
    updated_at = NOW(),
    last_login_at = NULL
WHERE created_at IS NULL
   OR updated_at IS NULL;

ALTER TABLE auth_user
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;
