import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { usersApi } from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  created_at?: string; // For component compatibility
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await usersApi.getNotifications({ limit: 50 });
      if (!response.data.success) throw new Error(response.data.error);
      // Transform to include snake_case for component compatibility
      const notifications = (response.data.data as Notification[]) || [];
      return notifications.map(n => ({
        ...n,
        created_at: n.createdAt,
      }));
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.markNotificationRead(id);
      if (!response.data.success) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await usersApi.markAllNotificationsRead();
      if (!response.data.success) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
};

// Admin: Create notification for all users
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; message: string }) => {
      const response = await api.post('/admin/notifications/broadcast', {
        title: data.title,
        message: data.message,
        type: 'announcement',
      });
      if (!response.data.success) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Admin: Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/notifications/${id}`);
      if (!response.data.success) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
