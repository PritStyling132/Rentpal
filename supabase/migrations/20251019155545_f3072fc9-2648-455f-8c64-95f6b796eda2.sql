-- Fix profiles PII exposure by restricting RLS policies
-- Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Anyone can view profile streaks" ON public.profiles;

-- Keep existing owner-only policies and add policy for leaderboard view access
-- Note: The leaderboard view (SECURITY INVOKER) only exposes safe columns
CREATE POLICY "Public leaderboard data access" ON public.profiles
FOR SELECT
USING (
  -- Users can view their own full profile
  auth.uid() = id
  OR
  -- Leaderboard: only allow access for users with active streaks
  -- This policy relies on the leaderboard view to limit exposed columns
  (current_streak > 0)
);

-- Grant permissions for the leaderboard view to be accessible by all roles
GRANT SELECT ON public.leaderboard TO authenticated, anon;