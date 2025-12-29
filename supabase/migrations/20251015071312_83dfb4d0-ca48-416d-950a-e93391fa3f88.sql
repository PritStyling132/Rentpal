-- Create banners table for managing promotional banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ads table for popup advertisements
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  link_url TEXT,
  display_duration INTEGER NOT NULL DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banners
CREATE POLICY "Anyone can view active banners"
ON public.banners
FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ads
CREATE POLICY "Anyone can view active ads"
ON public.ads
FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage ads"
ON public.ads
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for banner and ad images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-content', 'ad-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad content
CREATE POLICY "Anyone can view ad content"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ad-content');

CREATE POLICY "Admins can upload ad content"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ad-content' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad content"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ad-content' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad content"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ad-content' AND has_role(auth.uid(), 'admin'::app_role));