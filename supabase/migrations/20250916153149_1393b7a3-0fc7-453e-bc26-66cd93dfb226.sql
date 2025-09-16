-- Migration to import TrueHearted dating data from MySQL dump
-- This will insert data into existing tables with proper UUID conversions

-- First, create a temporary function to generate consistent UUIDs from member_ids
CREATE OR REPLACE FUNCTION generate_member_uuid(member_id_int INTEGER) 
RETURNS UUID AS $$
BEGIN
  -- Generate deterministic UUID based on member_id for consistency
  RETURN md5('member_' || member_id_int::text)::uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert members data (adapting MySQL structure to PostgreSQL)
INSERT INTO public.members (
  id, user_id, member_id, name, gender, birthdate, email, password, 
  subscription, relationship_status, having_kid, need_kids, 
  education_level, professionalism, alcoholism, smoker, reasons,
  height, weight, preferred_age_from, preferred_age_to,
  confirmation_code, confirmed, entry_date, status, location,
  last_activity, about_me, subscription_id, subscribed_at,
  reset_token, reset_expires, get_news, remember_token,
  created_at, updated_at
) VALUES
-- Sample member data from the dump (converting MySQL format to PostgreSQL)
(generate_member_uuid(945838664), NULL, 945838664, 'Angie', 'Woman', '2002-07-10', 'sameeeee1990@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$d7QwYjLqCOXQV0zdB43nJw$pLlWQQzrUWOIKyvguRSd4RMGLRzlNzSMPWHWA3XpzCU', 'pro', 'Single', '', '', '', '', '', '', 'Long-term relationships', '165', '115', '21', '30', 'ENOLIXXX', '', '2024-11-13', 'active', 'Nairobi', '2025-07-01 08:26:29', NULL, 'qwewerwrer', '2025-07-01 05:18:01', NULL, NULL, '', '', now(), now()),
(generate_member_uuid(448491900), NULL, 448491900, 'Bonface2', 'Man', '2002-03-22', 'sameeeee19902@gmail.com', '$2y$10$vNRBUPNznHbudf0JrR14s.k309CYkRmboGXD94nuvtGwei8fke.1O', 'free', 'Single', 'I don''t have kids', '', '', '', '', '', 'Long-term relationships', '165', '115', '18', '24', 'N0ZU2PFR', '', '2024-11-13', 'active', 'Nairobi', '2024-11-19 11:18:40', NULL, NULL, NULL, '', NULL, '', '', now(), now()),
(generate_member_uuid(162517293), NULL, 162517293, 'Emmanuel', 'Man', '1996-02-06', 'sameeeee139902@gmail.com', '$2y$10$an0T/McG4F9euwL9FFn09ORSDEPxoch1SoP7Z9pMp8hrg9iEatxr2', 'free', 'Single', 'I don''t have kids', '', 'Associate, bachelor''s, or master''s degree', 'Employed', 'I drink socially', '', 'Casual dating', '165', '69', '18', '30', 'TJTQJB21', '', '2024-11-13', 'active', 'Nairobi', '2025-05-11 21:33:37', NULL, NULL, NULL, '', NULL, '', '', now(), now()),
(generate_member_uuid(831921031), NULL, 831921031, 'Joyj', 'Woman', '1996-02-06', 'samtyn7sss@gmail.com', '$2y$10$pwNUeH/wQVpRTuu42KLqKeeiKesp4CSP/Hc1j0VrtQxGeW4SnXadS', 'free', 'Single', 'I don''t have kids', 'I would like to have children', 'Vocational high school', '', 'I don''t drink', 'I don''t smoke', 'Long-term relationships', '165', '69', '25', '35', 'ENL00T04', '', '2024-11-13', 'active', 'Nairobi', '2025-05-11 21:34:04', NULL, NULL, NULL, '', NULL, '', '', now(), now()),
(generate_member_uuid(666689185), NULL, 666689185, 'Benita', 'Woman', '2001-06-13', 'sameeeee1r990@gmail.com', '$2y$10$D9WsxUIF9Hx853yqVhK18.76IOZCuVRy6vFav1SXWEZMU906zSqGi', 'free', 'Single', 'I don''t have kids', '', 'Associate, bachelor''s, or master''s degree', 'Student', '', 'I don''t smoke', 'Long-term relationships', '165', '53', '22', '33', 'MPJJJ5RK', '', '2024-11-13', 'active', 'Nairobi', '2025-05-12 21:34:11', NULL, NULL, NULL, '', NULL, '', '', now(), now());

-- Insert image links (converting integer member_ids to UUIDs)
INSERT INTO public.img_links (id, img_id, member_id, is_primary, created_at) VALUES
(gen_random_uuid(), '9458386642218644673_xhuge.webp', generate_member_uuid(945838664), true, now()),
(gen_random_uuid(), '4484919002219746965_xhuge.webp', generate_member_uuid(448491900), true, now()),
(gen_random_uuid(), '1625172932213450333_square_large.jpg', generate_member_uuid(162517293), true, now()),
(gen_random_uuid(), '8319210312218597148_xhuge.webp', generate_member_uuid(831921031), true, now()),
(gen_random_uuid(), '6666891852218613254_xhuge.webp', generate_member_uuid(666689185), true, now());

-- Insert sample likes data (converting member IDs to UUIDs)
INSERT INTO public.likes (id, sent_from, sent_to, like_type, timestamp, created_at) VALUES
(gen_random_uuid(), generate_member_uuid(945838664), generate_member_uuid(448491900), 'like', '2025-01-01 10:00:00', now()),
(gen_random_uuid(), generate_member_uuid(162517293), generate_member_uuid(831921031), 'like', '2025-01-02 15:30:00', now()),
(gen_random_uuid(), generate_member_uuid(666689185), generate_member_uuid(945838664), 'super_like', '2025-01-03 20:15:00', now());

-- Clean up the helper function
DROP FUNCTION generate_member_uuid(INTEGER);