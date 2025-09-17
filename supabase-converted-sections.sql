-- SUPABASE CONVERTED DATA SECTIONS
-- Converted from MySQL TrueHearted Dating Data
-- Run these sections in order in your Supabase SQL Editor

-- ============================================================================
-- SECTION 1: MEMBERS TABLE (First 20 members from your actual data)
-- ============================================================================

INSERT INTO public.members (
    name, gender, birthdate, email, password, subscription, relationship_status,
    having_kid, need_kids, education_level, professionalism, alcoholism, smoker,
    reasons, height, weight, preferred_age_from, preferred_age_to, confirmation_code,
    confirmed, entry_date, status, member_id, location, last_activity, about_me,
    subscription_id, subscribed_at, reset_token, reset_expires, get_news, remember_token,
    user_id
) VALUES
-- Member 1: Angie
('Angie', 'Female', '2002-07-10', 'sameeeee1990@gmail.com', 
 '$argon2id$v=19$m=65536,t=4,p=1$d7QwYjLqCOXQV0zdB43nJw$pLlWQQzrUWOIKyvguRSd4RMGLRzlNzSMPWHWA3XpzCU', 
 'premium', 'Single', 'No', 'Maybe', 'University', 'Student', 'No', 'No', 
 'Long-term relationships', '165', '115', '21', '30', 'ENOLIXXX', 'yes', 
 '2024-11-13', 'active', 945838664, 'Nairobi', '2025-07-01 08:26:29+00', 
 NULL, 'qwewerwrer', '2025-07-01 05:18:01+00', NULL, NULL, 'yes', '', NULL),

-- Member 2: Bonface2  
('Bonface2', 'Male', '2002-03-22', 'sameeeee19902@gmail.com',
 '$2y$10$vNRBUPNznHbudf0JrR14s.k309CYkRmboGXD94nuvtGwei8fke.1O',
 'free', 'Single', 'No', 'Maybe', 'High School', 'Student', 'No', 'No',
 'Long-term relationships', '165', '115', '18', '24', 'N0ZU2PFR', 'yes',
 '2024-11-13', 'active', 448491900, 'Nairobi', '2024-11-19 11:18:40+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 3: Emmanuel
('Emmanuel', 'Male', '1996-02-06', 'sameeeee139902@gmail.com',
 '$2y$10$an0T/McG4F9euwL9FFn09ORSDEPxoch1SoP7Z9pMp8hrg9iEatxr2',
 'free', 'Single', 'No', 'Maybe', 'Associate, bachelor\'s, or master\'s degree', 'Employed', 'Socially', 'No',
 'Casual dating', '165', '69', '18', '30', 'TJTQJB21', 'yes',
 '2024-11-13', 'active', 162517293, 'Nairobi', '2025-05-11 21:33:37+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 4: Joyj
('Joyj', 'Female', '1996-02-06', 'samtyn7sss@gmail.com',
 '$2y$10$pwNUeH/wQVpRTuu42KLqKeeiKesp4CSP/Hc1j0VrtQxGeW4SnXadS',
 'free', 'Single', 'No', 'Yes', 'Vocational high school', 'Student', 'No', 'No',
 'Long-term relationships', '165', '69', '25', '35', 'ENL00T04', 'yes',
 '2024-11-13', 'active', 831921031, 'Nairobi', '2025-05-11 21:34:04+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 5: Benita
('Benita', 'Female', '2001-06-13', 'sameeeee1r990@gmail.com',
 '$2y$10$D9WsxUIF9Hx853yqVhK18.76IOZCuVRy6vFav1SXWEZMU906zSqGi',
 'free', 'Single', 'No', 'Maybe', 'Associate, bachelor\'s, or master\'s degree', 'Student', 'No', 'No',
 'Long-term relationships', '165', '53', '22', '33', 'MPJJJ5RK', 'yes',
 '2024-11-13', 'active', 666689185, 'Nairobi', '2025-05-12 21:34:11+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 6: Anitah
('Anitah', 'Female', '2001-05-04', 'sameeeee13r990@gmail.com',
 '$2y$10$1K4IDK8/5xj9FHIZFCcQpuibexwkxR0evIPr/N0zc5soD/ei3s2vi',
 'free', 'Single', 'Maybe', 'Maybe', 'High School', 'Student', 'No', 'No',
 'Don\'t know yet', '165', '53', '22', '33', 'S8WQ8J0J', 'yes',
 '2024-11-13', 'active', 741655489, 'Nairobi', '2025-05-12 21:34:17+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 7: Mariam
('Mariam', 'Female', '1994-07-20', 'sameeeee13r4990@gmail.com',
 '$2y$10$7rFvYWUJ/d/Jx82RY6rdXueA9fbe2DgY90EHdnzK1vOC8NIL6exjS',
 'free', 'Single', 'No', 'Yes', 'University', 'Student', 'Socially', 'No',
 'Conversation and friendship', '155', '53', '34', '40', 'FBV3RCPZ', 'yes',
 '2024-11-13', 'active', 717706734, 'Nairobi', '2025-05-11 21:34:23+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 8: janeB
('janeB', 'Female', '1984-02-15', 'sameeeee454@gmail.com',
 '$2y$10$3leavvV0NnXHbaoxIProD.xmopGvCfF3EmeaV.W/aobRYlky8PXja',
 'free', 'Divorced', 'Yes', 'Maybe', 'High School', 'Other', 'No', 'No',
 'Long-term relationships', '155', '53', '30', '70', 'UMPZDK1F', 'yes',
 '2024-11-27', 'active', 494438048, 'Nairobi', '2024-11-27 11:19:53+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 9: Mike
('Mike', 'Male', '1993-11-12', 'samee3eee454@gmail.com',
 '$2y$10$rwR4Vtda3PfGHcpg34Rs8OdcNizcfkBSfyQ/DAJR7WOM.Q6WOnovW',
 'free', 'Single', 'No', 'Yes', 'University', 'Student', 'No', 'No',
 'Long-term relationships', '164', '53', '20', '30', 'J5Q5R28E', 'yes',
 '2024-11-13', 'active', 624016355, 'Nairobi', '2025-05-12 21:34:38+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL),

-- Member 10: Rebecca
('Rebecca', 'Female', '1995-06-27', 'samee34454@gmail.com',
 '$2y$10$W6xWKlRojx2MZpYBxPUnu.uqnh5PDKBvybaBjybHikrH0eYvJKNaG',
 'free', 'Separated', 'Yes', 'Maybe', 'High School', 'Other', 'No', 'No',
 'Long-term relationships', '139', '53', '30', '40', 'G66B8GMX', 'yes',
 '2024-11-24', 'active', 176787454, 'Nairobi', '2024-11-26 11:24:56+00',
 NULL, NULL, NULL, NULL, NULL, 'yes', '', NULL);

-- ============================================================================
-- SECTION 2: IMG_LINKS TABLE (Images for the members above)
-- ============================================================================

INSERT INTO public.img_links (img_id, member_id, is_primary)
SELECT 
    '9458386642218644673_xhuge.webp',
    m.id,
    true
FROM public.members m WHERE m.member_id = 945838664

UNION ALL SELECT 
    '4484919002219746965_xhuge.webp',
    m.id,
    true
FROM public.members m WHERE m.member_id = 448491900

UNION ALL SELECT 
    '1625172932213450333_square_large.jpg',
    m.id,
    true
FROM public.members m WHERE m.member_id = 162517293

UNION ALL SELECT 
    '8319210312218597148_xhuge.webp',
    m.id,
    true
FROM public.members m WHERE m.member_id = 831921031

UNION ALL SELECT 
    '6666891852218613254_xhuge.webp',
    m.id,
    true
FROM public.members m WHERE m.member_id = 666689185

UNION ALL SELECT 
    '74165548900.webp',
    m.id,
    true
FROM public.members m WHERE m.member_id = 741655489

UNION ALL SELECT 
    '717706734222.jpg',
    m.id,
    true
FROM public.members m WHERE m.member_id = 717706734

UNION ALL SELECT 
    '49443804833.jpg',
    m.id,
    true
FROM public.members m WHERE m.member_id = 494438048

UNION ALL SELECT 
    '624016355bn.jpg',
    m.id,
    true
FROM public.members m WHERE m.member_id = 624016355

UNION ALL SELECT 
    '176787454re.jpg',
    m.id,
    true
FROM public.members m WHERE m.member_id = 176787454;

-- ============================================================================
-- SECTION 3: LIKES TABLE (Actual likes from your data)
-- ============================================================================

INSERT INTO public.likes (sent_from, sent_to, timestamp, like_type)
-- Like 1: Member 219069568 likes 666689185
SELECT 
    m1.id,
    m2.id,
    '2024-12-07 12:31:42+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 219069568 AND m2.member_id = 666689185

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-07 12:31:48+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 219069568 AND m2.member_id = 710551558

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-07 12:34:39+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 219069568 AND m2.member_id = 101559219

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-16 07:56:48+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 205659027 AND m2.member_id = 448491900

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-16 07:56:53+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 205659027 AND m2.member_id = 103329639

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-16 15:57:46+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 205659027 AND m2.member_id = 140850035

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-16 15:58:04+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 205659027 AND m2.member_id = 162517293

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-25 03:46:48+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 769442684 AND m2.member_id = 749242083

UNION ALL SELECT 
    m1.id,
    m2.id,
    '2024-12-25 03:48:26+00',
    'like'
FROM public.members m1, public.members m2 
WHERE m1.member_id = 769442684 AND m2.member_id = 494438048;

-- ============================================================================
-- SECTION 4: MESSAGES TABLE (Actual messages from your data)
-- ============================================================================

INSERT INTO public.messages (message, sender_id, receiver_id, timestamp, chat_id, is_read)
-- Message 1
SELECT 
    'Hie ',
    m1.id,
    m2.id,
    '2024-12-07 12:32:38+00',
    '344577675',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 219069568 AND m2.member_id = 125508107

UNION ALL SELECT 
    'Hie',
    m1.id,
    m2.id,
    '2024-12-07 12:34:14+00',
    '620355038',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 219069568 AND m2.member_id = 401285470

UNION ALL SELECT 
    'Hie',
    m1.id,
    m2.id,
    '2024-12-07 14:36:35+00',
    '713507616',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 219069568 AND m2.member_id = 494438048

UNION ALL SELECT 
    'Morning ',
    m1.id,
    m2.id,
    '2024-12-25 03:45:42+00',
    '871001903',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 769442684 AND m2.member_id = 101559219

UNION ALL SELECT 
    'Hey... Do you mind texting me on WhatsApp 073 147 3016 ',
    m1.id,
    m2.id,
    '2024-12-25 04:02:49+00',
    '1263880732',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 769442684 AND m2.member_id = 494438048

UNION ALL SELECT 
    'Hi',
    m1.id,
    m2.id,
    '2025-01-04 02:57:23+00',
    '1011978286',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 610692816 AND m2.member_id = 401285470

UNION ALL SELECT 
    'Heyy ',
    m1.id,
    m2.id,
    '2025-01-30 06:30:25+00',
    '764449236',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 662890017 AND m2.member_id = 101559219

UNION ALL SELECT 
    'Hi Anitah',
    m1.id,
    m2.id,
    '2025-03-06 06:04:37+00',
    '1026623388',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 284967899 AND m2.member_id = 741655489

UNION ALL SELECT 
    'Hi',
    m1.id,
    m2.id,
    '2025-03-06 06:09:31+00',
    '984790131',
    false
FROM public.members m1, public.members m2 
WHERE m1.member_id = 284967899 AND m2.member_id = 699822232;

-- ============================================================================
-- CONVERSION NOTES:
-- ============================================================================

/*
KEY CHANGES MADE:

1. MEMBERS TABLE:
   - Gender: "Woman"/"Man" → "Female"/"Male" 
   - Timestamps: Added timezone (+00)
   - Boolean fields: Converted empty strings to proper values
   - Invalid dates: '0000-00-00' → current date
   - user_id: Set to NULL (will be linked after Supabase Auth signup)

2. IMG_LINKS TABLE:
   - Uses UUID member_id lookups instead of integer references
   - Set first image as primary (is_primary = true)

3. LIKES TABLE:
   - Uses UUID member_id lookups for sent_from/sent_to
   - Added timezone to timestamps
   - Set like_type to 'like'

4. MESSAGES TABLE:
   - Uses UUID member_id lookups for sender_id/receiver_id
   - Added timezone to timestamps
   - Set is_read to false
   - Preserved original chat_id and message content

NEXT STEPS:
1. Run Section 1 (Members) first
2. Run Section 2 (Images) 
3. Run Section 3 (Likes)
4. Run Section 4 (Messages)
5. Check for any errors and handle missing member_id references
6. Notify users to reset passwords and sign up with original emails

IMPORTANT:
- Some likes/messages may fail if referenced member_ids don't exist
- You'll need to continue converting the remaining members from your MySQL file
- This covers about 10 members - you have 447 total members to convert
*/