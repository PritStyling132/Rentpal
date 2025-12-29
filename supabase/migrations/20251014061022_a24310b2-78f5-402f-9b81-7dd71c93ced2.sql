-- Trigger types regeneration
-- This comment migration will force the Supabase types to sync with the current database schema

-- Verify all tables exist and have proper structure
COMMENT ON TABLE public.listings IS 'Rental listings posted by users';
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.ratings IS 'Ratings and reviews for listings';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';
