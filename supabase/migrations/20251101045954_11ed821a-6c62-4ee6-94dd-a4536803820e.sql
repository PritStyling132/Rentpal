-- Add reference_url column to blogs table
ALTER TABLE public.blogs 
ADD COLUMN reference_url TEXT;

COMMENT ON COLUMN public.blogs.reference_url IS 'Optional URL to external reference or related content';