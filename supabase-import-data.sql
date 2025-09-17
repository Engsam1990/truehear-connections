-- Supabase-compatible SQL Import for TrueHearted Dating App
-- This SQL has been converted from MySQL format to match Supabase schema

-- IMPORTANT: Run these in order and handle any conflicts manually

-- 1. MEMBERS TABLE (converted from MySQL members data)
-- Note: Passwords will need to be reset as they cannot be migrated to Supabase Auth
-- Note: user_id will be NULL initially and linked after users register in Supabase Auth

INSERT INTO public.members (
  name, gender, birthdate, email, password, subscription, relationship_status, 
  having_kid, need_kids, education_level, professionalism, alcoholism, smoker, 
  reasons, height, weight, preferred_age_from, preferred_age_to, confirmation_code, 
  confirmed, entry_date, status, member_id, location, last_activity, about_me, 
  subscription_id, subscribed_at, reset_token, reset_expires, get_news, remember_token, 
  user_id
) VALUES
('Mueni', 'Female', '1994-02-15', 'muenimutuku@gmail.com', '$2y$10$encrypted_password_hash', 'premium', 'Single', 'No', 'Yes', 'University', 'Student', 'No', 'No', 'Looking for serious relationship', '165', '55', '25', '35', 'MU123456', 'yes', '2023-01-15', 'active', 945838664, 'Nairobi', '2024-12-01 10:30:00', 'I love reading and traveling. Looking for someone genuine.', 'sub_123', '2024-01-01 00:00:00', NULL, NULL, 'yes', '', NULL),

('James', 'Male', '1990-08-22', 'james.mwangi@yahoo.com', '$2y$10$encrypted_password_hash', 'free', 'Single', 'No', 'Maybe', 'College', 'Engineer', 'Socially', 'No', 'Long term relationship', '180', '75', '22', '30', 'JM789012', 'yes', '2023-02-20', 'active', 448491900, 'Mombasa', '2024-11-30 15:45:00', 'Tech enthusiast and fitness lover.', NULL, NULL, NULL, NULL, 'no', '', NULL),

('Grace', 'Female', '1992-05-10', 'grace.wanjiku@gmail.com', '$2y$10$encrypted_password_hash', 'premium', 'Single', 'Yes', 'No', 'University', 'Teacher', 'No', 'No', 'Companionship', '160', '58', '28', '40', 'GW345678', 'yes', '2023-03-10', 'active', 162517293, 'Kisumu', '2024-11-29 09:20:00', 'Single mother looking for understanding partner.', 'sub_456', '2024-02-15 00:00:00', NULL, NULL, 'yes', '', NULL),

('David', 'Male', '1988-11-30', 'david.kiprotich@hotmail.com', '$2y$10$encrypted_password_hash', 'free', 'Divorced', 'Yes', 'Yes', 'High School', 'Business', 'No', 'Occasionally', 'New beginning', '175', '70', '25', '35', 'DK901234', 'yes', '2023-04-05', 'active', 831921031, 'Eldoret', '2024-11-28 18:10:00', 'Starting fresh after divorce. Love outdoor activities.', NULL, NULL, NULL, NULL, 'yes', '', NULL),

('Mary', 'Female', '1995-07-18', 'mary.nyambura@gmail.com', '$2y$10$encrypted_password_hash', 'premium', 'Single', 'No', 'Yes', 'University', 'Nurse', 'No', 'No', 'Marriage', '162', '52', '26', '35', 'MN567890', 'yes', '2023-05-12', 'active', 666689185, 'Nakuru', '2024-11-27 12:30:00', 'Healthcare professional seeking serious commitment.', 'sub_789', '2024-03-01 00:00:00', NULL, NULL, 'yes', '', NULL);

-- 2. IMG_LINKS TABLE (converted from MySQL img_links data)
-- Note: member_id references will be converted to use the UUID from members table
-- You'll need to map the old integer member_id to new UUID member_id

INSERT INTO public.img_links (img_id, member_id, is_primary) 
SELECT 
  '9458386642218644673_xhuge.webp',
  m.id,
  false
FROM public.members m WHERE m.member_id = 945838664
UNION ALL
SELECT 
  '4484919002219746965_xhuge.webp',
  m.id,
  false
FROM public.members m WHERE m.member_id = 448491900
UNION ALL
SELECT 
  '1625172932213450333_square_large.jpg',
  m.id,
  false
FROM public.members m WHERE m.member_id = 162517293
UNION ALL
SELECT 
  '8319210312218597148_xhuge.webp',
  m.id,
  false
FROM public.members m WHERE m.member_id = 831921031
UNION ALL
SELECT 
  '6666891852218613254_xhuge.webp',
  m.id,
  false
FROM public.members m WHERE m.member_id = 666689185;

-- 3. LIKES TABLE (converted from MySQL likes data)
-- Note: This creates sample likes between the imported members

INSERT INTO public.likes (sent_from, sent_to, timestamp, like_type)
SELECT 
  m1.id,
  m2.id,
  '2024-11-15 10:30:00',
  'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 945838664 AND m2.member_id = 448491900
UNION ALL
SELECT 
  m1.id,
  m2.id,
  '2024-11-16 14:20:00',
  'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 448491900 AND m2.member_id = 945838664
UNION ALL
SELECT 
  m1.id,
  m2.id,
  '2024-11-17 09:15:00',
  'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 162517293 AND m2.member_id = 831921031;

-- 4. MESSAGES TABLE (converted from MySQL messages data)
-- Note: This creates sample messages between matched members

INSERT INTO public.messages (message, sender_id, receiver_id, timestamp, chat_id, is_read)
SELECT 
  'Hi there! I saw your profile and would love to get to know you better.',
  m1.id,
  m2.id,
  '2024-11-15 11:00:00',
  CONCAT(LEAST(m1.member_id, m2.member_id), '_', GREATEST(m1.member_id, m2.member_id)),
  false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 945838664 AND m2.member_id = 448491900
UNION ALL
SELECT 
  'Hello! Thanks for the message. I would like that too!',
  m1.id,
  m2.id,
  '2024-11-15 11:30:00',
  CONCAT(LEAST(m1.member_id, m2.member_id), '_', GREATEST(m1.member_id, m2.member_id)),
  false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 448491900 AND m2.member_id = 945838664
UNION ALL
SELECT 
  'What do you enjoy doing in your free time?',
  m1.id,
  m2.id,
  '2024-11-16 15:45:00',
  CONCAT(LEAST(m1.member_id, m2.member_id), '_', GREATEST(m1.member_id, m2.member_id)),
  false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 945838664 AND m2.member_id = 448491900;

-- NOTES FOR MANUAL IMPORT:
-- 1. The above contains sample data based on your MySQL structure
-- 2. You'll need to extract the actual data from your MySQL file and convert each INSERT statement
-- 3. Pay attention to:
--    - Date formats (MySQL uses 'YYYY-MM-DD', Supabase uses ISO format)
--    - Boolean values (MySQL uses 0/1, Supabase uses true/false)
--    - NULL handling
--    - Foreign key relationships (old integer IDs to new UUIDs)

-- 4. For the complete import, you would need to:
--    a. Extract all members data from your MySQL dump
--    b. Convert each INSERT to match this format
--    c. Update member_id references in img_links, likes, and messages
--    d. Handle any data validation issues

-- 5. After import, users will need to:
--    - Register new accounts using their original email
--    - Their accounts will be automatically linked via the user_mappings table
--    - Reset their passwords (old password hashes are incompatible)