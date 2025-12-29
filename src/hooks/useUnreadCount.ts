import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';

export const useUnreadCount = () => {
  const { user } = useAuth();
  const { conversations, messages } = useChat();
  const [totalUnread, setTotalUnread] = useState(0);

  // Calculate unread from local state
  useEffect(() => {
    if (!user || !conversations.length) {
      setTotalUnread(0);
      return;
    }

    const calculateUnread = () => {
      let count = 0;

      conversations.forEach((conv) => {
        const convMessages = messages[conv.id] || [];
        const unread = convMessages.filter(
          (m: any) => m.sender_id !== user.id && !m.read_at && !m.deleted_at
        ).length;
        count += unread;
      });

      setTotalUnread(count);
    };

    calculateUnread();
  }, [conversations, messages, user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return totalUnread;
};

