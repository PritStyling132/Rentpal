import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getAccessToken, uploadApi } from '@/lib/api';
import api from '@/lib/api';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'contact' | 'system' | 'image' | 'audio';
  media_url?: string | null;
  read_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  owner_id: string;
  leaser_id: string;
  contact_request_status: 'pending' | 'approved' | 'rejected';
  contact_shared: boolean;
  created_at: string;
  updated_at: string;
  listing?: {
    product_name: string;
    images: string[] | null;
  };
  other_user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface ChatContextType {
  isConnected: boolean;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  typingUsers: Record<string, Set<string>>;
  onlineUsers: Set<string>;
  getOrCreateConversation: (listingId: string, ownerId: string) => Promise<any>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, messageType?: 'text' | 'contact' | 'system' | 'image' | 'audio', mediaUrl?: string) => Promise<void>;
  uploadMedia: (file: File, type: 'image' | 'audio') => Promise<string | null>;
  sendTyping: (conversationId: string) => void;
  sendStopTyping: (conversationId: string) => void;
  approveContactRequest: (conversationId: string, ownerPhone: string) => Promise<void>;
  rejectContactRequest: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Get WebSocket URL from environment
const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (!envUrl) return 'ws://localhost:8080';

  let url = envUrl.trim();
  if (url.startsWith('ws://') || url.startsWith('wss://')) return url;
  url = url.replace(/^https?:\/\//i, '').replace(/^\/+/, '');

  if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('192.168.') || url.startsWith('10.') || url.startsWith('172.')) {
    return `ws://${url}`;
  }
  return `wss://${url}`;
};

const WS_URL = getWsUrl();

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const currentConversationRef = useRef<string | null>(null);
  const messagesRef = useRef<Record<string, Message[]>>({});
  const isConnectingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'error':
        toast({ title: 'Error', description: data.message || 'An error occurred', variant: 'destructive' });
        break;

      case 'connection':
        if (data.status === 'connected') {
          setIsConnected(true);
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'user_online', userId: user?.id }));
          }
        }
        break;

      case 'new_message':
      case 'message_sent':
        console.log('Received message event:', data.type, data.message?.id, 'for conversation:', data.message?.conversation_id);
        if (data.message) {
          setMessages(prev => {
            const convId = data.message.conversation_id;
            const existing = prev[convId] || [];

            // Check if message already exists
            if (existing.some(m => m.id === data.message.id)) {
              console.log('Message already exists, skipping:', data.message.id);
              return prev;
            }

            const newMessages = [...existing, data.message].sort((a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            console.log('Added new message. Total messages for conversation:', convId, '=', newMessages.length);

            return {
              ...prev,
              [convId]: newMessages
            };
          });
        }
        break;

      case 'user_typing':
        setTypingUsers(prev => ({
          ...prev,
          [data.conversationId]: new Set([...(prev[data.conversationId] || []), data.userId])
        }));
        break;

      case 'user_stopped_typing':
        setTypingUsers(prev => {
          const current = prev[data.conversationId] || new Set();
          current.delete(data.userId);
          return { ...prev, [data.conversationId]: new Set(current) };
        });
        break;

      case 'message_read':
        setMessages(prev => ({
          ...prev,
          [data.conversationId]: (prev[data.conversationId] || []).map(msg =>
            msg.id === data.messageId ? { ...msg, read_at: new Date().toISOString() } : msg
          )
        }));
        break;

      case 'message_deleted':
        setMessages(prev => ({
          ...prev,
          [data.conversationId]: (prev[data.conversationId] || []).map(msg =>
            msg.id === data.messageId ? { ...msg, deleted_at: new Date().toISOString() } : msg
          )
        }));
        break;

      case 'user_online':
        if (data.userId && data.userId !== user?.id) {
          setOnlineUsers(prev => new Set([...prev, data.userId]));
        }
        break;

      case 'user_offline':
        if (data.userId) {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
        break;

      case 'online_users':
        if (data.userIds?.length) {
          setOnlineUsers(new Set(data.userIds.filter((id: string) => id !== user?.id)));
        }
        break;
    }
  }, [user?.id]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!user) return;
    if (isConnectingRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    isConnectingRef.current = true;

    const token = getAccessToken();
    if (!token) {
      isConnectingRef.current = false;
      return;
    }

    const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;

    console.log('ChatContext: Connecting to WebSocket at:', WS_URL);

    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) { /* ignore */ }
    }

    const websocket = new WebSocket(wsUrl);
    wsRef.current = websocket;

    websocket.onopen = () => {
      console.log('ChatContext: WebSocket connected');
      setIsConnected(true);
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onmessage = (event) => {
      try {
        handleWebSocketMessage(JSON.parse(event.data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = () => {
      setIsConnected(false);
      isConnectingRef.current = false;
    };

    websocket.onclose = (event) => {
      console.log('ChatContext: WebSocket closed', event.code);
      setIsConnected(false);
      isConnectingRef.current = false;

      if (event.code !== 1000 && event.code !== 1008) {
        reconnectTimeoutRef.current = setTimeout(() => connect(), 3000);
      }
    };
  }, [user, handleWebSocketMessage]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/users/conversations');
      const conversationsData = response.data;

      if (!conversationsData?.length) {
        setConversations([]);
        return;
      }

      // Transform to expected format
      const formatted = conversationsData.map((conv: any) => ({
        id: conv.id,
        listing_id: conv.listingId,
        owner_id: conv.ownerId,
        leaser_id: conv.leaserId,
        contact_request_status: conv.contactRequestStatus,
        contact_shared: conv.contactShared,
        created_at: conv.createdAt,
        updated_at: conv.updatedAt,
        listing: conv.listing ? {
          product_name: conv.listing.productName,
          images: conv.listing.images
        } : null,
        owner: conv.owner ? {
          id: conv.owner.id,
          name: conv.owner.name,
          avatar_url: conv.owner.avatarUrl
        } : { id: conv.ownerId, name: 'Owner', avatar_url: null },
        leaser: conv.leaser ? {
          id: conv.leaser.id,
          name: conv.leaser.name,
          avatar_url: conv.leaser.avatarUrl
        } : { id: conv.leaserId, name: 'Leaser', avatar_url: null },
        other_user: conv.ownerId === user.id
          ? (conv.leaser ? { id: conv.leaser.id, name: conv.leaser.name, avatar_url: conv.leaser.avatarUrl } : { id: conv.leaserId, name: 'Leaser', avatar_url: null })
          : (conv.owner ? { id: conv.owner.id, name: conv.owner.name, avatar_url: conv.owner.avatarUrl } : { id: conv.ownerId, name: 'Owner', avatar_url: null })
      }));

      setConversations(formatted);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user]);

  // Load messages
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) {
      console.log('loadMessages: No user, skipping');
      return;
    }

    console.log('loadMessages called for:', conversationId, 'user:', user.id);

    try {
      const response = await api.get(`/users/conversations/${conversationId}/messages`);
      const data = response.data;

      console.log('Loaded messages from API:', data?.length || 0, 'for conversation:', conversationId);

      // Transform messages to expected format
      const formattedMessages = (data || []).map((m: any) => ({
        id: m.id,
        conversation_id: m.conversationId,
        sender_id: m.senderId,
        content: m.content,
        message_type: m.messageType,
        media_url: m.mediaUrl,
        read_at: m.readAt,
        deleted_at: m.deletedAt,
        created_at: m.createdAt
      }));

      // Merge with existing messages to avoid losing real-time messages
      setMessages(prev => {
        const existingMessages = prev[conversationId] || [];
        const dbMessages = formattedMessages as Message[];

        // Create a map of all messages by ID
        const messageMap = new Map<string, Message>();

        // Add existing messages first
        existingMessages.forEach(msg => messageMap.set(msg.id, msg));

        // Then add/update with DB messages (DB is source of truth)
        dbMessages.forEach(msg => messageMap.set(msg.id, msg));

        // Convert back to array and sort
        const mergedMessages = Array.from(messageMap.values()).sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return { ...prev, [conversationId]: mergedMessages };
      });

      // Mark unread messages as read via API
      const unreadIds = (data || [])
        .filter((m: any) => m.senderId !== user.id && !m.readAt)
        .map((m: any) => m.id);

      if (unreadIds.length > 0) {
        await api.post(`/users/conversations/${conversationId}/mark-read`, { messageIds: unreadIds });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [user]);

  // Get or create conversation
  const getOrCreateConversation = useCallback(async (listingId: string, ownerId: string) => {
    if (!user) return null;

    try {
      const response = await api.post('/users/conversations', { listingId, ownerId });
      const data = response.data;
      await loadConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [user, loadConversations]);

  // Upload media (image or audio)
  const uploadMedia = useCallback(async (file: File, type: 'image' | 'audio'): Promise<string | null> => {
    if (!user) return null;

    try {
      // Use Cloudinary via API for chat media uploads
      const result = await uploadApi.uploadImage(file, 'chat');
      return result.url;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({ title: 'Error', description: 'Failed to upload media', variant: 'destructive' });
      return null;
    }
  }, [user]);

  // Send message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'contact' | 'system' | 'image' | 'audio' = 'text',
    mediaUrl?: string
  ) => {
    if (!user) return;

    try {
      const currentWs = wsRef.current;
      if (currentWs?.readyState === WebSocket.OPEN) {
        currentWs.send(JSON.stringify({ type: 'send_message', conversationId, content, messageType, mediaUrl }));
        console.log('Message sent via WebSocket');
      } else {
        // Fallback to API call
        const response = await api.post(`/users/conversations/${conversationId}/messages`, {
          content,
          messageType,
          mediaUrl: mediaUrl || null
        });

        const newMessage = response.data;
        const formattedMessage: Message = {
          id: newMessage.id,
          conversation_id: newMessage.conversationId,
          sender_id: newMessage.senderId,
          content: newMessage.content,
          message_type: newMessage.messageType,
          media_url: newMessage.mediaUrl,
          read_at: newMessage.readAt,
          deleted_at: newMessage.deletedAt,
          created_at: newMessage.createdAt
        };

        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), formattedMessage].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  }, [user]);

  // Join/Leave conversation
  const joinConversation = useCallback((conversationId: string) => {
    console.log('joinConversation called:', conversationId);
    currentConversationRef.current = conversationId;

    // Load messages from database
    loadMessages(conversationId);

    // Notify server that user joined this conversation
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'join_conversation', conversationId }));
      console.log('Sent join_conversation to server');
    }
  }, [loadMessages]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (currentConversationRef.current === conversationId) {
      currentConversationRef.current = null;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave_conversation', conversationId }));
    }
  }, []);

  // Typing indicators
  const sendTyping = useCallback((conversationId: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'typing', conversationId }));

    if (typingTimeoutRef.current[conversationId]) clearTimeout(typingTimeoutRef.current[conversationId]);
    typingTimeoutRef.current[conversationId] = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'stop_typing', conversationId }));
      }
    }, 3000);
  }, []);

  const sendStopTyping = useCallback((conversationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop_typing', conversationId }));
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string, conversationId: string) => {
    if (!user) return;

    try {
      await api.delete(`/users/conversations/${conversationId}/messages/${messageId}`);

      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg =>
          msg.id === messageId ? { ...msg, deleted_at: new Date().toISOString() } : msg
        )
      }));

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'delete_message', conversationId, messageId }));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [user]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await api.delete(`/users/conversations/${conversationId}`);

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [user]);

  // Contact request handlers
  const approveContactRequest = useCallback(async (conversationId: string, ownerPhone: string) => {
    if (!user) return;

    try {
      await api.post(`/users/conversations/${conversationId}/approve-contact`, { phone: ownerPhone });
      await sendMessage(conversationId, ownerPhone, 'contact');
      await loadConversations();
    } catch (error) {
      console.error('Error approving contact request:', error);
    }
  }, [user, sendMessage, loadConversations]);

  const rejectContactRequest = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await api.post(`/users/conversations/${conversationId}/reject-contact`);
      await loadConversations();
    } catch (error) {
      console.error('Error rejecting contact request:', error);
    }
  }, [user, loadConversations]);

  // Initialize on user change
  useEffect(() => {
    if (user?.id && user.id !== userIdRef.current) {
      userIdRef.current = user.id;
      console.log('ChatContext: User changed, connecting for:', user.id);
      connect();
      loadConversations();
    } else if (!user) {
      userIdRef.current = null;
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [user?.id, connect, loadConversations]);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Polling fallback for offline messages
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const pollForNewMessages = async () => {
      for (const conv of conversations) {
        try {
          const response = await api.get(`/users/conversations/${conv.id}/messages`);
          const dbMessages = (response.data || []).map((m: any) => ({
            id: m.id,
            conversation_id: m.conversationId,
            sender_id: m.senderId,
            content: m.content,
            message_type: m.messageType,
            media_url: m.mediaUrl,
            read_at: m.readAt,
            deleted_at: m.deletedAt,
            created_at: m.createdAt
          }));

          if (dbMessages?.length) {
            const currentMessages = messagesRef.current[conv.id] || [];
            const currentIds = new Set(currentMessages.map(m => m.id));
            const newMessages = dbMessages.filter((m: Message) => !currentIds.has(m.id));

            if (newMessages.length > 0) {
              setMessages(prev => ({ ...prev, [conv.id]: dbMessages as Message[] }));
            }
          }
        } catch (error) {
          // Ignore polling errors
        }
      }
    };

    const pollingInterval = setInterval(pollForNewMessages, 5000);
    return () => clearInterval(pollingInterval);
  }, [user, conversations]);

  const value: ChatContextType = {
    isConnected,
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    getOrCreateConversation,
    joinConversation,
    leaveConversation,
    sendMessage,
    uploadMedia,
    sendTyping,
    sendStopTyping,
    approveContactRequest,
    rejectContactRequest,
    loadConversations,
    loadMessages,
    deleteMessage,
    deleteConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
