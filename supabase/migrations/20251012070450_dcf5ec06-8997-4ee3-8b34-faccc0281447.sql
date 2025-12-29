-- Add product_type to listings table
CREATE TYPE product_type AS ENUM ('rent', 'sale', 'both');

ALTER TABLE public.listings 
ADD COLUMN product_type product_type DEFAULT 'rent' NOT NULL;

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings
CREATE POLICY "Anyone can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

-- Users can create their own ratings
CREATE POLICY "Users can create their own ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings" 
ON public.ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to calculate average rating for a listing
CREATE OR REPLACE FUNCTION public.calculate_listing_rating(listing_id_param UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.ratings
  WHERE listing_id = listing_id_param;
$$ LANGUAGE SQL STABLE;

-- Create index for better performance
CREATE INDEX idx_ratings_listing_id ON public.ratings(listing_id);
CREATE INDEX idx_ratings_user_id ON public.ratings(user_id);