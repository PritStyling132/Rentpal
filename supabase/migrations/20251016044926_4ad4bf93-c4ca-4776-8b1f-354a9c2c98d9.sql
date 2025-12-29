-- Create top_profiles table for featured profiles section
CREATE TABLE public.top_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create influencer_partners table for influencer partnership section
CREATE TABLE public.influencer_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT,
  followers_count INTEGER,
  platform TEXT NOT NULL,
  profile_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create section_visibility table for admin to control section visibility
CREATE TABLE public.section_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default visibility settings
INSERT INTO public.section_visibility (section_name, is_visible, updated_by)
VALUES 
  ('top_profiles', true, (SELECT id FROM auth.users LIMIT 1)),
  ('influencer_partners', true, (SELECT id FROM auth.users LIMIT 1));

-- Enable RLS
ALTER TABLE public.top_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_visibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for top_profiles
CREATE POLICY "Anyone can view active top profiles"
ON public.top_profiles FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage top profiles"
ON public.top_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for influencer_partners
CREATE POLICY "Anyone can view active influencer partners"
ON public.influencer_partners FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage influencer partners"
ON public.influencer_partners FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for section_visibility
CREATE POLICY "Anyone can view section visibility"
ON public.section_visibility FOR SELECT
USING (true);

CREATE POLICY "Admins can manage section visibility"
ON public.section_visibility FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));