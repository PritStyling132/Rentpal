import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTopProfiles = () => {
  return useQuery({
    queryKey: ['top-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('top_profiles')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};

export const useSectionVisibility = (sectionName: string) => {
  return useQuery({
    queryKey: ['section-visibility', sectionName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_visibility')
        .select('*')
        .eq('section_name', sectionName)
        .single();

      if (error) throw error;
      return data;
    },
  });
};
