-- Modify listings table to support multiple images
-- Drop the old image_url column and add new images array column
ALTER TABLE public.listings DROP COLUMN IF EXISTS image_url;
ALTER TABLE public.listings ADD COLUMN images text[] DEFAULT ARRAY[]::text[];