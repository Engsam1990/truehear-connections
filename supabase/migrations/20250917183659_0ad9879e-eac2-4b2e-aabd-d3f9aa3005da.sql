-- Change member_id, sent_from, sent_to, sender_id, receiver_id columns to int

-- First, drop existing RLS policies
DROP POLICY IF EXISTS "Users can manage own images" ON public.img_links;
DROP POLICY IF EXISTS "Users can view authorized profile images" ON public.img_links;
DROP POLICY IF EXISTS "Users can create likes from their profile" ON public.likes;
DROP POLICY IF EXISTS "Users can view likes involving them" ON public.likes;
DROP POLICY IF EXISTS "Users can send messages from their profile" ON public.messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

-- Clear existing data to avoid conversion issues
TRUNCATE public.messages CASCADE;
TRUNCATE public.likes CASCADE;
TRUNCATE public.img_links CASCADE;

-- Change img_links.member_id from UUID to int
ALTER TABLE public.img_links 
ALTER COLUMN member_id TYPE int;

-- Change likes columns from UUID to int
ALTER TABLE public.likes 
ALTER COLUMN sent_from TYPE int,
ALTER COLUMN sent_to TYPE int;

-- Change messages columns from UUID to int
ALTER TABLE public.messages 
ALTER COLUMN sender_id TYPE int,
ALTER COLUMN receiver_id TYPE int;

-- Add foreign key constraints to reference members.member_id (int)
ALTER TABLE public.img_links 
ADD CONSTRAINT img_links_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.members(member_id) ON DELETE CASCADE;

ALTER TABLE public.likes 
ADD CONSTRAINT likes_sent_from_fkey 
FOREIGN KEY (sent_from) REFERENCES public.members(member_id) ON DELETE CASCADE,
ADD CONSTRAINT likes_sent_to_fkey 
FOREIGN KEY (sent_to) REFERENCES public.members(member_id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.members(member_id) ON DELETE CASCADE,
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.members(member_id) ON DELETE CASCADE;

-- Recreate RLS policies with updated logic using member_id
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