-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can insert blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can insert ad content" ON storage.objects;

-- Add RLS policies for storage buckets to restrict uploads to authorized users only

-- Listing images: Only authenticated users can upload their own images
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
);

-- Blog images: Only admins can upload
CREATE POLICY "Admins can insert blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  public.has_role(auth.uid(), 'admin')
);

-- Ad content: Only admins can upload
CREATE POLICY "Admins can insert ad content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-content' AND
  public.has_role(auth.uid(), 'admin')
);