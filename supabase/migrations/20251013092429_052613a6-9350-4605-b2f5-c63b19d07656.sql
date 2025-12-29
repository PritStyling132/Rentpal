-- Add category column to listings table
ALTER TABLE public.listings 
ADD COLUMN category text NOT NULL DEFAULT 'other';

-- Add check constraint for valid categories
ALTER TABLE public.listings 
ADD CONSTRAINT valid_category CHECK (category IN ('electronics', 'vehicles', 'furniture', 'tools', 'sports', 'books', 'clothing', 'other'));