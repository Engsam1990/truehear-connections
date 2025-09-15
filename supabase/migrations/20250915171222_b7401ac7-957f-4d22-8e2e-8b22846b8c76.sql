-- Create core tables for Truehearted dating app
-- Based on provided MySQL schema, converted to PostgreSQL with modern features

-- Members table (main user profiles)
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  birthdate DATE NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  subscription VARCHAR(255) NOT NULL DEFAULT 'free',
  relationship_status VARCHAR(50) NOT NULL,
  having_kid VARCHAR(50) NOT NULL,
  need_kids VARCHAR(100) NOT NULL,
  education_level VARCHAR(100) NOT NULL,
  professionalism VARCHAR(100) NOT NULL,
  alcoholism VARCHAR(50) NOT NULL,
  smoker VARCHAR(50) NOT NULL,
  reasons VARCHAR(255) NOT NULL,
  height VARCHAR(50) NOT NULL,
  weight VARCHAR(50) NOT NULL,
  preferred_age_from VARCHAR(50) NOT NULL,
  preferred_age_to VARCHAR(50) NOT NULL,
  confirmation_code VARCHAR(50) NOT NULL,
  confirmed VARCHAR(50) NOT NULL DEFAULT 'no',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  member_id INTEGER NOT NULL UNIQUE DEFAULT (floor(random() * 1000000) + 1)::INTEGER,
  location VARCHAR(255) NOT NULL,
  last_activity TIMESTAMP NOT NULL DEFAULT NOW(),
  about_me TEXT,
  subscription_id VARCHAR(100),
  subscribed_at TIMESTAMP,
  reset_token VARCHAR(50),
  reset_expires TIMESTAMP,
  get_news VARCHAR(50) NOT NULL DEFAULT 'yes',
  remember_token VARCHAR(255) NOT NULL DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Image links table
CREATE TABLE public.img_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  img_id VARCHAR(100) NOT NULL,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.img_links ENABLE ROW LEVEL SECURITY;

-- Likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_from UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  sent_to UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  like_type VARCHAR(20) NOT NULL DEFAULT 'like',
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(sent_from, sent_to)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  chat_id VARCHAR(100) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP,
  edited_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members
CREATE POLICY "Users can view all members" ON public.members
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for img_links
CREATE POLICY "Users can view all images" ON public.img_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own images" ON public.img_links
  FOR ALL USING (
    member_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for likes
CREATE POLICY "Users can view likes involving them" ON public.likes
  FOR SELECT USING (
    sent_from IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    ) OR
    sent_to IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create likes from their profile" ON public.likes
  FOR INSERT WITH CHECK (
    sent_from IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    ) OR
    receiver_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages from their profile" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_location ON public.members(location);
CREATE INDEX idx_members_last_activity ON public.members(last_activity);
CREATE INDEX idx_img_links_member_id ON public.img_links(member_id);
CREATE INDEX idx_likes_sent_from ON public.likes(sent_from);
CREATE INDEX idx_likes_sent_to ON public.likes(sent_to);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();