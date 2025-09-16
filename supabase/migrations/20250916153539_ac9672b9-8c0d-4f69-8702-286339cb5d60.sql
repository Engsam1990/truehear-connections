-- Fix critical security vulnerability: Private Photos Accessible to Unauthorized Users
-- Drop the overly permissive policy that allows anyone to view all images
DROP POLICY IF EXISTS "Users can view all images" ON public.img_links;

-- Create a secure policy that only allows viewing images from authorized profiles
CREATE POLICY "Users can view authorized profile images" 
ON public.img_links 
FOR SELECT 
USING (
  -- Users can view their own images
  member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  )
  OR
  -- Users can view images from profiles they have mutual likes with (matches)
  member_id IN (
    SELECT DISTINCT 
      CASE 
        WHEN l1.sent_to = (SELECT id FROM public.members WHERE user_id = auth.uid()) THEN l1.sent_from
        WHEN l1.sent_from = (SELECT id FROM public.members WHERE user_id = auth.uid()) THEN l1.sent_to
      END as matched_member_id
    FROM public.likes l1
    INNER JOIN public.likes l2 ON (
      (l1.sent_from = l2.sent_to AND l1.sent_to = l2.sent_from)
    )
    WHERE (
      l1.sent_from = (SELECT id FROM public.members WHERE user_id = auth.uid()) OR
      l1.sent_to = (SELECT id FROM public.members WHERE user_id = auth.uid())
    )
    AND l1.like_type = 'like' AND l2.like_type = 'like'
  )
  OR
  -- Users can view images from compatible profiles (age preferences match and active status)
  member_id IN (
    SELECT m2.id 
    FROM public.members m1, public.members m2
    WHERE m1.user_id = auth.uid()
    AND m2.id != m1.id
    AND m2.status = 'active'
    AND m1.status = 'active'
    -- Age compatibility check
    AND EXTRACT(YEAR FROM AGE(m2.birthdate)) BETWEEN m1.preferred_age_from::integer AND m1.preferred_age_to::integer
    AND EXTRACT(YEAR FROM AGE(m1.birthdate)) BETWEEN m2.preferred_age_from::integer AND m2.preferred_age_to::integer
    -- Ensure user hasn't already "passed" on this profile
    AND NOT EXISTS (
      SELECT 1 FROM public.likes l 
      WHERE l.sent_from = m1.id 
      AND l.sent_to = m2.id 
      AND l.like_type = 'pass'
    )
  )
);