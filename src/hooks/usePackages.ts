import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface Package {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  duration: number;
  features: string[];
  listingsLimit?: number | null;
  boostDays?: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usePackages = () => {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await adminApi.getPackages();
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data as Package[];
    },
  });

  const createPackage = useMutation({
    mutationFn: async (packageData: {
      name: string;
      description?: string;
      price: number;
      duration?: number;
      features?: string[];
      listingsLimit?: number;
      boostDays?: number;
      displayOrder?: number;
      isActive?: boolean;
    }) => {
      const response = await adminApi.createPackage(packageData);
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({ title: 'Package created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create package',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Package> & { id: string }) => {
      const response = await adminApi.updatePackage(id, updates);
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({ title: 'Package updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update package',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.deletePackage(id);
      if (!response.data.success) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({ title: 'Package deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete package',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    packages,
    isLoading,
    createPackage,
    updatePackage,
    deletePackage,
  };
};
