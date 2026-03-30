ALTER TABLE auth_user
    RENAME COLUMN google_subject TO provider_subject;

ALTER TABLE auth_user
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE auth_user
    ADD COLUMN profile_image_url VARCHAR(500);

ALTER TABLE auth_user
    DROP CONSTRAINT IF EXISTS auth_user_google_subject_key;

ALTER TABLE auth_user
    DROP CONSTRAINT IF EXISTS auth_user_email_key;

ALTER TABLE auth_user
    ADD CONSTRAINT uq_auth_user_provider_subject
        UNIQUE (provider, provider_subject);

UPDATE auth_user
SET email = NULL
WHERE provider = 'KAKAO'
  AND email LIKE 'kakao-%@no-email.local';
