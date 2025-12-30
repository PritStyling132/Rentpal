import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, uploadApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  category?: string | null;
  featuredImage?: string | null;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  publishedAt?: string | null;
  views: number;
  author?: {
    id: string;
    name: string;
  };
}

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await adminApi.getBlogs({ published: true });
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data as Blog[];
    },
  });
};

export const useAdminBlogs = () => {
  return useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const response = await adminApi.getBlogs();
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data as Blog[];
    },
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blog: {
      title: string;
      slug?: string;
      content: string;
      excerpt?: string;
      featuredImage?: string;
      tags?: string[];
      category?: string;
      isPublished?: boolean;
    }) => {
      const response = await adminApi.createBlog(blog);
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({
        title: 'Success',
        description: 'Blog created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...blog }: Partial<Blog> & { id: string }) => {
      const response = await adminApi.updateBlog(id, blog);
      if (!response.data.success) throw new Error(response.data.error);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({
        title: 'Success',
        description: 'Blog updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.deleteBlog(id);
      if (!response.data.success) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({
        title: 'Success',
        description: 'Blog deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const uploadBlogImage = async (file: File, blogId?: string): Promise<string> => {
  const response = await uploadApi.uploadBlogImage(blogId || 'new', file);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data.url;
};
