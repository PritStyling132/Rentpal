import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useInfluencerPartners = () => {
  return useQuery({
    queryKey: ['influencer-partners'],
    queryFn: async () => {
      const response = await api.get('/admin/influencer-partners/active');
      return response.data || [];
    },
  });
};
