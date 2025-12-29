import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInfluencerPartners = () => {
  return useQuery({
    queryKey: ['influencer-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_partners')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
