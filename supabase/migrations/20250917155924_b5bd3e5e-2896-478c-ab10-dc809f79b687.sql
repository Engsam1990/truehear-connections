-- Create user mapping table for Supabase auth integration
-- This table maps Supabase user IDs to existing members table IDs

CREATE TABLE public.user_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL UNIQUE REFERENCES public.members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  migration_status TEXT DEFAULT 'pending' CHECK (migration_status IN ('pending', 'completed', 'failed')),
  migration_notes TEXT
);

-- Enable RLS
ALTER TABLE public.user_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for user mappings
CREATE POLICY "Users can view their own mapping" 
ON public.user_mappings 
FOR SELECT 
USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own mapping" 
ON public.user_mappings 
FOR INSERT 
WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own mapping" 
ON public.user_mappings 
FOR UPDATE 
USING (auth.uid() = supabase_user_id);

-- Create indexes for performance
CREATE INDEX idx_user_mappings_supabase_user_id ON public.user_mappings(supabase_user_id);
CREATE INDEX idx_user_mappings_member_id ON public.user_mappings(member_id);

-- Function to get member_id from Supabase user_id
CREATE OR REPLACE FUNCTION public.get_member_id_from_auth()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT member_id 
  FROM public.user_mappings 
  WHERE supabase_user_id = auth.uid()
  LIMIT 1;
$$;

-- Function to get member data with proper mapping
CREATE OR REPLACE FUNCTION public.get_current_member()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  birthdate DATE,
  gender TEXT,
  location TEXT,
  about_me TEXT,
  profession TEXT,
  education_level TEXT,
  relationship_status TEXT,
  having_kid TEXT,
  need_kids TEXT,
  height TEXT,
  weight TEXT,
  alcoholism TEXT,
  smoker TEXT,
  reasons TEXT,
  preferred_age_from TEXT,
  preferred_age_to TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id,
    m.name,
    m.email,
    m.birthdate,
    m.gender,
    m.location,
    m.about_me,
    m.professionalism,
    m.education_level,
    m.relationship_status,
    m.having_kid,
    m.need_kids,
    m.height,
    m.weight,
    m.alcoholism,
    m.smoker,
    m.reasons,
    m.preferred_age_from,
    m.preferred_age_to,
    m.status,
    m.created_at,
    m.updated_at
  FROM public.members m
  JOIN public.user_mappings um ON m.id = um.member_id
  WHERE um.supabase_user_id = auth.uid();
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_user_mappings_updated_at
  BEFORE UPDATE ON public.user_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();