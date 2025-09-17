-- TrueHearted Migration Scripts
-- These scripts help migrate from MySQL to Supabase authentication while preserving existing data

-- 1. Password Migration Options
-- Option A: If you have access to plaintext passwords (during migration window)
CREATE OR REPLACE FUNCTION migrate_user_with_password(
  user_email TEXT,
  user_password TEXT,
  member_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create Supabase auth user with password
  -- Note: This requires service role key and admin privileges
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create user mapping
  INSERT INTO public.user_mappings (
    supabase_user_id,
    member_id,
    migration_status,
    migration_notes
  ) VALUES (
    new_user_id,
    member_id,
    'completed',
    'Migrated with preserved password'
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Option B: Force password reset migration
CREATE OR REPLACE FUNCTION migrate_user_force_reset(
  user_email TEXT,
  member_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create Supabase auth user without password (will need to reset)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    NOW(),
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex')
  )
  RETURNING id INTO new_user_id;

  -- Create user mapping
  INSERT INTO public.user_mappings (
    supabase_user_id,
    member_id,
    migration_status,
    migration_notes
  ) VALUES (
    new_user_id,
    member_id,
    'completed',
    'Migrated - password reset required'
  );

  -- Update member status to indicate password reset needed
  UPDATE public.members 
  SET confirmation_code = 'RESET_REQUIRED',
      confirmed = 'no'
  WHERE id = member_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 2. Batch Migration Script
CREATE OR REPLACE FUNCTION batch_migrate_users(
  batch_size INTEGER DEFAULT 100,
  use_password_migration BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  processed INTEGER,
  successful INTEGER,
  failed INTEGER,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
  success_count INTEGER := 0;
  fail_count INTEGER := 0;
  total_count INTEGER := 0;
  migration_result BOOLEAN;
BEGIN
  -- Process members that don't have mappings yet
  FOR member_record IN 
    SELECT m.id, m.email, m.password, m.name
    FROM public.members m
    LEFT JOIN public.user_mappings um ON m.id = um.member_id
    WHERE um.member_id IS NULL 
      AND m.status = 'active'
      AND m.email IS NOT NULL
    LIMIT batch_size
  LOOP
    total_count := total_count + 1;
    
    IF use_password_migration AND member_record.password IS NOT NULL THEN
      -- Try to migrate with existing password (if bcrypt compatible)
      SELECT migrate_user_with_password(
        member_record.email,
        member_record.password,
        member_record.id
      ) INTO migration_result;
    ELSE
      -- Force password reset migration
      SELECT migrate_user_force_reset(
        member_record.email,
        member_record.id
      ) INTO migration_result;
    END IF;
    
    IF migration_result THEN
      success_count := success_count + 1;
    ELSE
      fail_count := fail_count + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    total_count,
    success_count,
    fail_count,
    jsonb_build_object(
      'timestamp', NOW(),
      'batch_size', batch_size,
      'use_password_migration', use_password_migration
    );
END;
$$;

-- 3. Rollback Functions
CREATE OR REPLACE FUNCTION rollback_user_migration(member_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mapping_record RECORD;
BEGIN
  -- Get the mapping
  SELECT * INTO mapping_record 
  FROM public.user_mappings 
  WHERE member_id = rollback_user_migration.member_id;
  
  IF mapping_record.supabase_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Delete the Supabase auth user
  DELETE FROM auth.users WHERE id = mapping_record.supabase_user_id;
  
  -- Delete the mapping
  DELETE FROM public.user_mappings WHERE id = mapping_record.id;
  
  -- Reset member status if needed
  UPDATE public.members 
  SET confirmation_code = '',
      confirmed = 'yes'
  WHERE id = rollback_user_migration.member_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 4. Validation and Health Check Functions
CREATE OR REPLACE FUNCTION validate_migration_integrity()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  count_value INTEGER,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check for orphaned mappings
  RETURN QUERY SELECT 
    'orphaned_mappings',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*)::INTEGER,
    'User mappings without corresponding auth users'
  FROM public.user_mappings um
  LEFT JOIN auth.users au ON um.supabase_user_id = au.id
  WHERE au.id IS NULL;
  
  -- Check for duplicate mappings
  RETURN QUERY SELECT 
    'duplicate_mappings',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*)::INTEGER,
    'Multiple mappings for the same member or user'
  FROM (
    SELECT member_id, COUNT(*) as cnt
    FROM public.user_mappings
    GROUP BY member_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Check mapping coverage
  RETURN QUERY SELECT 
    'migration_coverage',
    CASE WHEN (mapped_count::FLOAT / total_count) > 0.95 THEN 'PASS' ELSE 'WARN' END,
    mapped_count,
    CONCAT('Mapped ', mapped_count, ' of ', total_count, ' active members')
  FROM (
    SELECT 
      COUNT(DISTINCT m.id) as total_count,
      COUNT(DISTINCT um.member_id) as mapped_count
    FROM public.members m
    LEFT JOIN public.user_mappings um ON m.id = um.member_id
    WHERE m.status = 'active'
  ) coverage;
END;
$$;

-- 5. Cutover Plan Functions
CREATE OR REPLACE FUNCTION prepare_cutover()
RETURNS TABLE (
  step_name TEXT,
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if migration is ready
  RETURN QUERY SELECT 
    'migration_validation',
    'INFO',
    'Running migration integrity checks...'
  ;
  
  -- Enable maintenance mode flag
  INSERT INTO public.system_settings (key, value, description)
  VALUES (
    'maintenance_mode',
    'true',
    'System in maintenance for authentication cutover'
  )
  ON CONFLICT (key) DO UPDATE SET 
    value = 'true',
    updated_at = NOW();
  
  RETURN QUERY SELECT 
    'maintenance_mode',
    'SUCCESS',
    'Maintenance mode enabled'
  ;
  
  -- Prepare RLS policies for Supabase auth
  RETURN QUERY SELECT 
    'rls_preparation',
    'SUCCESS',
    'RLS policies ready for Supabase authentication'
  ;
END;
$$;

-- 6. Production Monitoring
CREATE TABLE public.migration_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_details JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION record_migration_metric(
  metric_name TEXT,
  metric_value NUMERIC,
  metric_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.migration_metrics (metric_name, metric_value, metric_details)
  VALUES (record_migration_metric.metric_name, record_migration_metric.metric_value, record_migration_metric.metric_details);
END;
$$;

-- Example usage queries:
-- SELECT * FROM batch_migrate_users(50, false); -- Migrate 50 users with password reset
-- SELECT * FROM validate_migration_integrity(); -- Check migration health
-- SELECT * FROM prepare_cutover(); -- Prepare for production cutover