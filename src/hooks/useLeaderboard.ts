import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';

export interface LeaderboardEntry {
  id: string;
  profileId: string;
  rank: number;
  score: number;
  category?: string | null;
  profile?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    userType?: string;
  };
}

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await usersApi.getLeaderboard();
      if (!response.data.success) throw new Error(response.data.error);

      const data = response.data.data as LeaderboardEntry[];
      return {
        data: data || [],
        total: data?.length || 0,
      };
    },
  });
};

export const useUserStreak = (userId: string) => {
  return useQuery({
    queryKey: ['user-streak', userId],
    queryFn: async () => {
      const response = await usersApi.getProfile(userId);
      if (!response.data.success) throw new Error(response.data.error);
      const profile = response.data.data;
      return {
        currentStreak: profile?.currentStreak || 0,
        longestStreak: profile?.longestStreak || 0,
        lastActiveAt: profile?.lastActiveAt || null,
      };
    },
    enabled: !!userId,
  });
};
