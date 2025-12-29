-- Add phone and address columns to listings table
ALTER TABLE public.listings
ADD COLUMN phone text NOT NULL DEFAULT '',
ADD COLUMN address text NOT NULL DEFAULT '';