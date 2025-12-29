import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeaderboard = (limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['leaderboard', limit, offset],
    queryFn: async () => {
      // Query from the leaderboard view instead of profiles table directly
      // This view only exposes non-sensitive columns (no phone/pin_code)
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return {
        data: data?.map((user, index) => ({
          ...user,
          rank: offset + index + 1
        })) || [],
        total: data?.length || 0
      };
    },
  });
};

export const useUserStreak = (userId: string) => {
  return useQuery({
    queryKey: ['user-streak', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_active_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
