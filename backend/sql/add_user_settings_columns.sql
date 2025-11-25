BEGIN;

-- Add email_notifications boolean column if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;

-- Add two_factor_enabled boolean column if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

-- Add payment_methods text column if not exists (store as JSON string)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS payment_methods TEXT DEFAULT '[]';

-- Ensure no NULLs for existing rows
UPDATE users
SET
    email_notifications = TRUE
WHERE
    email_notifications IS NULL;

UPDATE users
SET
    two_factor_enabled = FALSE
WHERE
    two_factor_enabled IS NULL;

UPDATE users
SET
    payment_methods = '[]'
WHERE
    payment_methods IS NULL;

COMMIT;