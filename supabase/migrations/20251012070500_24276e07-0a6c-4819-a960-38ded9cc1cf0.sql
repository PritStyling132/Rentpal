-- Fix search path for calculate_listing_rating function
CREATE OR REPLACE FUNCTION public.calculate_listing_rating(listing_id_param UUID)
RETURNS NUMERIC 
LANGUAGE SQL 
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.ratings
  WHERE listing_id = listing_id_param;
$$;