-- Trigger types regeneration by adding a helpful comment
COMMENT ON TABLE public.profiles IS 'User profile information including name, phone, and location';
COMMENT ON TABLE public.listings IS 'Product listings for rent or sale';
COMMENT ON TABLE public.ratings IS 'User ratings and reviews for listings';
COMMENT ON TABLE public.blogs IS 'Blog posts and articles';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';
COMMENT ON TABLE public.user_activity_logs IS 'Activity tracking for user actions';
COMMENT ON TABLE public.admin_activity_logs IS 'Activity tracking for admin actions';