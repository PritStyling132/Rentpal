import { useQuery } from '@tanstack/react-query';
import { usersApi, adminApi } from '@/lib/api';

export interface TopProfile {
  id: string;
  profileId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  profile?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    userType?: string;
    businessName?: string | null;
  };
}

export interface SectionVisibility {
  id: string;
  sectionName: string;
  isVisible: boolean;
  updatedAt: string;
}

export const useTopProfiles = () => {
  return useQuery({
    queryKey: ['top-profiles'],
    queryFn: async () => {
      const response = await usersApi.getTopProfiles();
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data as TopProfile[];
    },
  });
};

export const useSectionVisibility = (sectionName: string) => {
  return useQuery({
    queryKey: ['section-visibility', sectionName],
    queryFn: async () => {
      const response = await adminApi.getSectionVisibility();
      if (!response.data.success) throw new Error(response.data.error);
      const sections = response.data.data as SectionVisibility[];
      return sections.find((s) => s.sectionName === sectionName) || null;
    },
  });
};
