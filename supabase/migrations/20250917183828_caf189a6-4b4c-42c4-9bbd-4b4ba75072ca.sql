-- Drop and recreate tables with integer columns for proper relationships

-- Drop existing tables in correct order (due to foreign keys)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.img_links CASCADE;

-- Recreate img_links table with integer member_id
CREATE TABLE public.img_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  img_id character varying NOT NULL,
  member_id integer NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Recreate likes table with integer columns
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_from integer NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  sent_to integer NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  timestamp timestamp without time zone NOT NULL DEFAULT now(),
  like_type character varying NOT NULL DEFAULT 'like'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Recreate messages table with integer columns
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  sender_id integer NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  receiver_id integer NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  timestamp timestamp without time zone DEFAULT now(),
  chat_id character varying NOT NULL,
  is_read boolean DEFAULT false,
  delivered_at timestamp without time zone,
  edited_at timestamp without time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.img_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for img_links
CREATE POLICY "Users can manage own images" ON public.img_links
FOR ALL USING (
  member_id IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view authorized profile images" ON public.img_links
FOR SELECT USING (
  -- Own images
  member_id IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
  OR
  -- Matched members' images
  member_id IN (
    SELECT DISTINCT
      CASE
        WHEN l1.sent_to = (SELECT m.member_id FROM public.members m WHERE m.user_id = auth.uid()) THEN l1.sent_from
        WHEN l1.sent_from = (SELECT m.member_id FROM public.members m WHERE m.user_id = auth.uid()) THEN l1.sent_to
        ELSE NULL
      END
    FROM public.likes l1
    JOIN public.likes l2 ON (l1.sent_from = l2.sent_to AND l1.sent_to = l2.sent_from)
    WHERE ((l1.sent_from = (SELECT m.member_id FROM public.members m WHERE m.user_id = auth.uid())) 
           OR (l1.sent_to = (SELECT m.member_id FROM public.members m WHERE m.user_id = auth.uid())))
      AND l1.like_type = 'like' AND l2.like_type = 'like'
  )
  OR
  -- Potential matches based on preferences
  member_id IN (
    SELECT m2.member_id
    FROM public.members m1, public.members m2
    WHERE m1.user_id = auth.uid()
      AND m2.member_id != m1.member_id
      AND m2.status = 'active' AND m1.status = 'active'
      AND EXTRACT(year FROM age(m2.birthdate::timestamp)) >= m1.preferred_age_from::int
      AND EXTRACT(year FROM age(m2.birthdate::timestamp)) <= m1.preferred_age_to::int
      AND EXTRACT(year FROM age(m1.birthdate::timestamp)) >= m2.preferred_age_from::int
      AND EXTRACT(year FROM age(m1.birthdate::timestamp)) <= m2.preferred_age_to::int
      AND NOT EXISTS (
        SELECT 1 FROM public.likes l 
        WHERE l.sent_from = m1.member_id AND l.sent_to = m2.member_id AND l.like_type = 'pass'
      )
  )
);

-- Create RLS policies for likes
CREATE POLICY "Users can create likes from their profile" ON public.likes
FOR INSERT WITH CHECK (
  sent_from IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view likes involving them" ON public.likes
FOR SELECT USING (
  sent_from IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
  OR
  sent_to IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
);

-- Create RLS policies for messages
CREATE POLICY "Users can send messages from their profile" ON public.messages
FOR INSERT WITH CHECK (
  sender_id IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT USING (
  sender_id IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
  OR
  receiver_id IN (
    SELECT m.member_id 
    FROM public.members m 
    WHERE m.user_id = auth.uid()
  )
);