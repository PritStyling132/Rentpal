-- Add streak tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create function to update user activity and streak
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_last_active timestamp with time zone;
  v_current_streak integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get current user data
  SELECT last_active_at, current_streak
  INTO v_last_active, v_current_streak
  FROM public.profiles
  WHERE id = v_user_id;

  -- Check if user was active yesterday or today
  IF v_last_active IS NULL OR 
     DATE(v_last_active) < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken - reset to 1
    UPDATE public.profiles
    SET current_streak = 1,
        last_active_at = now()
    WHERE id = v_user_id;
  ELSIF DATE(v_last_active) = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE public.profiles
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_active_at = now()
    WHERE id = v_user_id;
  ELSIF DATE(v_last_active) = CURRENT_DATE THEN
    -- Already active today, just update timestamp
    UPDATE public.profiles
    SET last_active_at = now()
    WHERE id = v_user_id;
  END IF;
END;
$$;

-- Create function to sync top profiles from leaderboard
CREATE OR REPLACE FUNCTION public.sync_top_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing top profiles
  DELETE FROM public.top_profiles;
  
  -- Insert top 10 users by streak
  INSERT INTO public.top_profiles (user_id, name, avatar_url, streak, display_order, created_by)
  SELECT 
    p.id,
    p.name,
    COALESCE('https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.id::text, ''),
    p.current_streak,
    ROW_NUMBER() OVER (ORDER BY p.current_streak DESC, p.last_active_at DESC)::integer,
    p.id
  FROM public.profiles p
  WHERE p.current_streak > 0
  ORDER BY p.current_streak DESC, p.last_active_at DESC
  LIMIT 10;
END;
$$;

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.name,
  p.current_streak,
  p.longest_streak,
  p.last_active_at,
  ROW_NUMBER() OVER (ORDER BY p.current_streak DESC, p.last_active_at DESC) as rank
FROM public.profiles p
WHERE p.current_streak > 0
ORDER BY p.current_streak DESC, p.last_active_at DESC;

-- Grant access to leaderboard view
GRANT SELECT ON public.leaderboard TO authenticated, anon;

-- Create RLS policy for profiles to allow users to see streak data
CREATE POLICY "Anyone can view profile streaks" ON public.profiles
FOR SELECT USING (true);

-- Add leaderboard section visibility
INSERT INTO public.section_visibility (section_name, is_visible, updated_by)
VALUES ('leaderboard', true, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (section_name) DO NOTHING;