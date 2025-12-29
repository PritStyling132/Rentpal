-- Fix search path for increment_listing_views function
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.listings
  SET views = views + 1
  WHERE id = listing_id;
$$;