-- Import sample production data from MySQL dump
-- This migration safely imports a few sample records with proper data type conversion

-- Import sample members data with proper PostgreSQL types
INSERT INTO public.members (
    name, gender, birthdate, email, password, subscription, 
    relationship_status, having_kid, need_kids, education_level, 
    professionalism, alcoholism, smoker, reasons, height, weight, 
    preferred_age_from, preferred_age_to, confirmation_code, confirmed, 
    entry_date, status, member_id, location, last_activity, about_me, 
    subscription_id, subscribed_at, reset_token, reset_expires, 
    get_news, remember_token, user_id
) VALUES 
(
    'Angie Sample', 
    'Woman', 
    '2002-07-10'::date,
    'angie.sample@example.com',
    '$argon2id$v=19$m=65536,t=4,p=1$d7QwYjLqCOXQV0zdB43nJw$pLlWQQzrUWOIKyvguRSd4RMGLRzlNzSMPWHWA3XpzCU',
    'pro',
    'Single',
    '',
    '',
    '',
    '',
    '',
    '',
    'Long-term relationships',
    '165',
    '115',
    '21',
    '30',
    'SAMPLE001',
    'yes',
    '2024-11-13'::date,
    'active',
    945838664,
    'Nairobi',
    '2025-07-01 08:26:29'::timestamp,
    'Sample imported profile',
    NULL,
    NULL,
    NULL,
    NULL,
    'yes',
    '',
    NULL -- user_id will be set when user authenticates with Supabase Auth
),
(
    'Emmanuel Sample',
    'Man',
    '1996-02-06'::date,
    'emmanuel.sample@example.com',
    '$2y$10$an0T/McG4F9euwL9FFn09ORSDEPxoch1SoP7Z9pMp8hrg9iEatxr2',
    'free',
    'Single',
    'I don''t have kids',
    '',
    'Associate, bachelor''s, or master''s degree',
    'Employed',
    'I drink socially',
    '',
    'Casual dating',
    '165',
    '69',
    '18',
    '30',
    'SAMPLE002',
    'yes',
    '2024-11-13'::date,
    'active',
    162517293,
    'Nairobi',
    '2025-05-11 21:33:37'::timestamp,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'yes',
    '',
    NULL
),
(
    'Bonface Sample',
    'Man',
    '2002-03-22'::date,
    'bonface.sample@example.com',
    '$2y$10$vNRBUPNznHbudf0JrR14s.k309CYkRmboGXD94nuvtGwei8fke.1O',
    'free',
    'Single',
    'I don''t have kids',
    '',
    '',
    '',
    '',
    '',
    'Long-term relationships',
    '165',
    '115',
    '18',
    '24',
    'SAMPLE003',
    'yes',
    '2024-11-13'::date,
    'active',
    448491900,
    'Nairobi',
    '2024-11-19 11:18:40'::timestamp,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'yes',
    '',
    NULL
);

-- Add sample image links for the imported members
INSERT INTO public.img_links (img_id, member_id, is_primary) 
SELECT 
    'sample_image_' || m.member_id || '.jpg',
    m.id,
    true
FROM public.members m 
WHERE m.email IN ('angie.sample@example.com', 'emmanuel.sample@example.com', 'bonface.sample@example.com');

-- Add sample likes between imported members
INSERT INTO public.likes (sent_from, sent_to, like_type, timestamp)
SELECT 
    m1.id,
    m2.id,
    'like',
    now()
FROM public.members m1, public.members m2
WHERE m1.email = 'angie.sample@example.com' 
  AND m2.email = 'emmanuel.sample@example.com';

-- Add sample message between matched users
INSERT INTO public.messages (sender_id, receiver_id, message, chat_id, is_read, timestamp)
SELECT 
    m1.id,
    m2.id,
    'Hello! Thanks for the like.',
    concat(m1.member_id, '_', m2.member_id),
    false,
    now()
FROM public.members m1, public.members m2
WHERE m1.email = 'angie.sample@example.com' 
  AND m2.email = 'emmanuel.sample@example.com';