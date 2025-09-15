-- Insert sample members for testing (these will help test the app functionality)
INSERT INTO public.members (
  name, gender, birthdate, email, password, location, 
  relationship_status, having_kid, need_kids, education_level, 
  professionalism, alcoholism, smoker, reasons, height, weight, 
  preferred_age_from, preferred_age_to, confirmation_code, 
  about_me, subscription, get_news, remember_token
) VALUES 
(
  'Emma Johnson', 'female', '1995-06-15', 'emma@example.com', 'hashed_password',
  'New York, NY', 'single', 'no', 'maybe', 'college', 'graphic_designer', 
  'social', 'no', 'Looking for genuine connections', '168cm', '60kg', 
  '25', '35', 'CONF123', 
  'I love hiking, photography, and trying new coffee shops. Looking for genuine connections and someone who shares my love for adventure.',
  'free', 'yes', ''
),
(
  'Alex Rodriguez', 'male', '1992-03-22', 'alex@example.com', 'hashed_password',
  'Los Angeles, CA', 'single', 'no', 'yes', 'university', 'software_engineer', 
  'occasional', 'no', 'Seeking meaningful relationships', '180cm', '75kg', 
  '26', '32', 'CONF456',
  'Fitness enthusiast and dog lover. Enjoy weekend getaways and cooking Italian food. Looking for someone who appreciates good food and outdoor adventures.',
  'free', 'yes', ''
),
(
  'Maya Patel', 'female', '1997-11-08', 'maya@example.com', 'hashed_password',
  'Chicago, IL', 'single', 'no', 'maybe', 'college', 'art_teacher', 
  'no', 'no', 'Creative connections', '165cm', '55kg', 
  '23', '30', 'CONF789',
  'Artist by day, dancer by night. Always looking for new experiences and meaningful conversations. Love museums, live music, and spontaneous road trips.',
  'free', 'yes', ''
),
(
  'David Chen', 'male', '1990-09-14', 'david@example.com', 'hashed_password',
  'San Francisco, CA', 'single', 'no', 'yes', 'university', 'product_manager', 
  'social', 'no', 'Long-term partnership', '175cm', '70kg', 
  '28', '35', 'CONF101',
  'Tech professional who loves to travel and try new cuisines. Passionate about sustainability and making a positive impact. Looking for a partner to explore the world with.',
  'free', 'yes', ''
),
(
  'Sarah Williams', 'female', '1994-01-20', 'sarah@example.com', 'hashed_password',
  'Austin, TX', 'single', 'no', 'maybe', 'university', 'marketing_specialist', 
  'social', 'no', 'Fun and serious', '170cm', '62kg', 
  '26', '33', 'CONF202',
  'Marketing professional with a passion for live music and food trucks. Love exploring Austin music scene and weekend farmers markets. Seeking someone genuine and fun.',
  'free', 'yes', ''
);