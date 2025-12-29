-- Fix search_path for sync_top_profiles function
CREATE OR REPLACE FUNCTION public.sync_top_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all existing top profiles (using WHERE true to satisfy RLS)
  DELETE FROM public.top_profiles WHERE true;
  
  -- Insert top 10 users from leaderboard
  INSERT INTO public.top_profiles (user_id, name, avatar_url, streak, display_order, created_by)
  SELECT 
    l.user_id,
    p.name,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || l.user_id),
    l.current_streak,
    ROW_NUMBER() OVER (ORDER BY l.current_streak DESC, l.last_login DESC) as display_order,
    auth.uid()
  FROM public.leaderboard l
  JOIN public.profiles p ON l.user_id = p.id
  ORDER BY l.current_streak DESC, l.last_login DESC
  LIMIT 10;
END;
$$;