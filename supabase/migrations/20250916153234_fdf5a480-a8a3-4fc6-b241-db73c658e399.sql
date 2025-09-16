-- Enable leaked password protection for better security
-- This addresses the security warning from the linter

-- Enable leaked password protection in auth settings
UPDATE auth.config 
SET leaked_password_protection = true 
WHERE TRUE;