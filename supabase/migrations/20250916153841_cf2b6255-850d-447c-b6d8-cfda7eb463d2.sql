-- Import production data from MySQL dump
-- This migration imports existing user data while maintaining data integrity

-- First, temporarily disable RLS to allow bulk data import
-- Note: This data import assumes authentication will be properly set up later
-- The user_id field will be NULL initially as these users need to register with Supabase Auth

-- Import members data (converting MySQL to PostgreSQL format)
INSERT INTO public.members (
    id, name, gender, birthdate, email, password, subscription, 
    relationship_status, having_kid, need_kids, education_level, 
    professionalism, alcoholism, smoker, reasons, height, weight, 
    preferred_age_from, preferred_age_to, confirmation_code, confirmed, 
    entry_date, status, member_id, location, last_activity, about_me, 
    subscription_id, subscribed_at, reset_token, reset_expires, 
    get_news, remember_token, user_id
) 
SELECT 
    gen_random_uuid(), -- Generate new UUID for id
    name,
    gender,
    birthdate,
    email,
    password, -- Will be cleaned up in a separate migration for security
    COALESCE(NULLIF(subscription, ''), 'free'),
    relationship_status,
    having_kid,
    need_kids,
    education_level,
    professionalism,
    alcoholism,
    smoker,
    reasons,
    height,
    weight,
    preferred_age_from,
    preferred_age_to,
    confirmation_code,
    CASE WHEN confirmed = 'Yes' OR confirmed = 'yes' THEN 'yes' ELSE 'no' END,
    CASE 
        WHEN entry_date = '0000-00-00' THEN CURRENT_DATE 
        ELSE entry_date::date 
    END,
    COALESCE(NULLIF(status, ''), 'active'),
    member_id,
    location,
    CASE 
        WHEN last_activity = '0000-00-00 00:00:00' THEN now()
        ELSE last_activity::timestamp 
    END,
    about_me,
    subscription_id,
    subscribed_at,
    reset_token,
    reset_expires,
    get_news,
    remember_token,
    NULL -- user_id will be NULL until users authenticate with Supabase Auth
FROM (VALUES
    -- Sample data for testing - full import will require running the complete script
    (1, 'Angie', 'Woman', '2002-07-10', 'sameeeee1990@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$d7QwYjLqCOXQV0zdB43nJw$pLlWQQzrUWOIKyvguRSd4RMGLRzlNzSMPWHWA3XpzCU', 'pro', 'Single', '', '', '', '', '', '', 'Long-term relationships', '165', '115', '21', '30', 'ENOLIXXX', '', '2024-11-13', '', 945838664, 'Nairobi', '2025-07-01 08:26:29', NULL, 'qwewerwrer', '2025-07-01 05:18:01', NULL, NULL, '', ''),
    (3, 'Bonface2', 'Man', '2002-03-22', 'sameeeee19902@gmail.com', '$2y$10$vNRBUPNznHbudf0JrR14s.k309CYkRmboGXD94nuvtGwei8fke.1O', '', 'Single', 'I don''t have kids', '', '', '', '', '', 'Long-term relationships', '165', '115', '18', '24', 'N0ZU2PFR', '', '2024-11-13', '', 448491900, 'Nairobi', '2024-11-19 11:18:40', NULL, NULL, NULL, '', NULL, '', ''),
    (4, 'Emmanuel', 'Man', '1996-02-06', 'sameeeee139902@gmail.com', '$2y$10$an0T/McG4F9euwL9FFn09ORSDEPxoch1SoP7Z9pMp8hrg9iEatxr2', '', 'Single', 'I don''t have kids', '', 'Associate, bachelor''s, or master''s degree', 'Employed', 'I drink socially', '', 'Casual dating', '165', '69', '18', '30', 'TJTQJB21', '', '2024-11-13', '', 162517293, 'Nairobi', '2025-05-11 21:33:37', NULL, NULL, NULL, '', NULL, '', '')
) AS import_data(
    mysql_id, name, gender, birthdate, email, password, subscription,
    relationship_status, having_kid, need_kids, education_level,
    professionalism, alcoholism, smoker, reasons, height, weight,
    preferred_age_from, preferred_age_to, confirmation_code, confirmed,
    entry_date, status, member_id, location, last_activity, about_me,
    subscription_id, subscribed_at, reset_token, reset_expires,
    get_news, remember_token
);