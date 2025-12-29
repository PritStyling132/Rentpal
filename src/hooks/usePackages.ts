import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const usePackages = () => {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data as Package[];
    },
  });

  const createPackage = useMutation({
    mutationFn: async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('packages')
        .insert([{ ...packageData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({ title: 'Package created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create package', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Package> & { id: string }) => {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({ title: 'Package updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update package', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({ title: 'Package deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete package', 
        description: error.message,
        variant: 'destructive' 
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
