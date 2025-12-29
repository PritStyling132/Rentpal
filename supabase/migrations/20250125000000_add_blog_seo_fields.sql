-- Add SEO fields to blogs table
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN public.blogs.seo_title IS 'SEO optimized title (optional, defaults to title)';
COMMENT ON COLUMN public.blogs.meta_description IS 'Meta description for SEO (optional, defaults to description)';
COMMENT ON COLUMN public.blogs.meta_keywords IS 'Comma-separated keywords for SEO';
COMMENT ON COLUMN public.blogs.og_image IS 'Open Graph image URL (optional, defaults to image_url)';
COMMENT ON COLUMN public.blogs.author_name IS 'Author name for display and SEO';
COMMENT ON COLUMN public.blogs.reading_time IS 'Estimated reading time in minutes';

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_blogs_seo_title ON public.blogs(seo_title) WHERE seo_title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blogs_meta_keywords ON public.blogs USING gin(to_tsvector('english', COALESCE(meta_keywords, '')));

