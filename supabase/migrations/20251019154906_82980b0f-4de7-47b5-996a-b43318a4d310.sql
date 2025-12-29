-- Fix 1: Change leaderboard view to SECURITY INVOKER to prevent RLS bypass
DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.name,
  p.current_streak,
  p.longest_streak,
  p.last_active_at,
  ROW_NUMBER() OVER (ORDER BY p.current_streak DESC, p.last_active_at DESC) as rank
FROM public.profiles p
WHERE p.current_streak > 0;

-- Fix 2: Add admin authorization check to sync_top_profiles function
CREATE OR REPLACE FUNCTION public.sync_top_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin access
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Delete all existing top profiles (using WHERE true to satisfy RLS)
  DELETE FROM public.top_profiles WHERE true;
  
  -- Insert top 10 users from leaderboard
  INSERT INTO public.top_profiles (user_id, name, avatar_url, streak, display_order, created_by)
  SELECT 
    l.user_id,
    p.name,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || l.user_id),
    l.current_streak,
    ROW_NUMBER() OVER (ORDER BY l.current_streak DESC, l.last_active_at DESC) as display_order,
    auth.uid()
  FROM public.leaderboard l
  JOIN public.profiles p ON l.user_id = p.id
  ORDER BY l.current_streak DESC, l.last_active_at DESC
  LIMIT 10;
END;
$$;