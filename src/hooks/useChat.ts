import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'contact' | 'system';
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

// Get WebSocket URL from environment, default to 8080
const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (!envUrl) {
    return 'ws://localhost:8080';
  }

  let url = envUrl.trim();

  // If it already has ws:// or wss://, use it as is
  if (url.startsWith('ws://') || url.startsWith('wss://')) {
    return url;
  }

  // Remove http:// or https:// if present
  url = url.replace(/^https?:\/\//i, '');

  // Remove any leading slashes
  url = url.replace(/^\/+/, '');

  // Add ws:// prefix (use wss:// only for non-localhost)
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('192.168.') || url.startsWith('10.') || url.startsWith('172.')) {
    return `ws://${url}`;
  }

  return `wss://${url}`;
};

const WS_URL = getWsUrl();

export const useChat = () => {
  const { user, session } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentConversationRef = useRef<string | null>(null);
  const messagesRef = useRef<Record<string, Message[]>>({});

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!user || !session) {
      console.log('❌ Cannot connect: No user or session');
      return;
    }

    // Get fresh session to ensure token is not expired
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    if (!freshSession) {
      console.log('❌ Cannot connect: No fresh session available');
      return;
    }

    const token = freshSession.access_token;
    // Build URL without logging the token - never log the full URL
    const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;

    console.log('Attempting to connect to WebSocket server at:', WS_URL);
    console.log('Using token expiry:', new Date(freshSession.expires_at! * 1000).toLocaleString());

    // Create WebSocket without exposing URL in any logs
    const websocket = new WebSocket(wsUrl);
    wsRef.current = websocket;

    websocket.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      // Only show toast on first connection error, not on reconnection attempts
      if (!reconnectTimeoutRef.current) {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to chat server. Retrying...',
          variant: 'destructive'
        });
      }
    };

    websocket.onclose = (event) => {
      console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
      setIsConnected(false);

      // Show user-friendly message
      if (event.code === 1008) {
        toast({
          title: 'Authentication Failed',
          description: 'Please try logging out and logging back in.',
          variant: 'destructive'
        });
      }

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    setWs(websocket);
  }, [user, session]);

  // Initialize notification sound
  useEffect(() => {
    // Try to load custom notification sound from public folder
    // You can add your custom sound file at: public/notification-sound.mp3
    const customSoundPath = '/notification-sound.mp3';
    const audio = new Audio(customSoundPath);

    // Handle audio load errors (fallback to Web Audio API)
    audio.onerror = () => {
      console.log('Custom notification sound not found, using default beep');
      // Initialize Web Audio API as fallback
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        notificationSoundRef.current = {
          play: async () => {
            try {
              // Resume audio context if suspended (browser autoplay policy)
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
              }

              // Create a simple beep sound
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();

              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);

              oscillator.frequency.value = 800;
              oscillator.type = 'sine';

              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
              console.warn('Could not play notification sound:', error);
            }
          }
        } as any;
      } catch (error) {
        console.warn('Could not initialize notification sound:', error);
      }
    };

    // If custom sound loads successfully, use it
    audio.oncanplaythrough = () => {
      notificationSoundRef.current = {
        play: async () => {
          try {
            audio.currentTime = 0; // Reset to start
            await audio.play();
          } catch (error) {
            console.warn('Could not play notification sound:', error);
            // Fallback to Web Audio API if custom sound fails
            if (audioContextRef.current) {
              const audioContext = audioContextRef.current;
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
              }
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.2);
            }
          }
        }
      } as any;
    };

    // Try to load the custom sound
    audio.load();
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'error':
        // Handle error messages from server
        toast({
          title: 'Error',
          description: data.message || 'An error occurred',
          variant: 'destructive'
        });
        break;

      case 'connection':
        if (data.status === 'connected') {
          setIsConnected(true);
          // Notify server that user is online
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'user_online',
              userId: user?.id
            }));
          }
        }
        break;

      case 'new_message':
      case 'message_sent':
        if (data.message) {
          setMessages(prev => {
            const convId = data.message.conversation_id;
            const existing = prev[convId] || [];
            // Check if message already exists
            if (existing.some(m => m.id === data.message.id)) {
              return prev;
            }
            const newMessages = {
              ...prev,
              [convId]: [...existing, data.message].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            };

            // Play notification sound if message is from another user and not in current conversation
            if (data.type === 'new_message' &&
              data.message.sender_id !== user?.id &&
              currentConversationRef.current !== convId) {
              // Play notification sound
              if (notificationSoundRef.current) {
                notificationSoundRef.current.play().catch((error: any) => {
                  console.warn('Could not play notification sound:', error);
                });
              }

              // Also try browser notification if permission granted
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification('New message', {
                    body: data.message.content.substring(0, 50),
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `message-${data.message.id}` // Prevent duplicate notifications
                  });
                } catch (error) {
                  console.warn('Could not show browser notification:', error);
                }
              }
            }

            return newMessages;
          });
        }
        break;

      case 'user_typing':
        setTypingUsers(prev => {
          const convId = data.conversationId;
          const current = prev[convId] || new Set();
          return {
            ...prev,
            [convId]: new Set([...current, data.userId])
          };
        });
        break;

      case 'user_stopped_typing':
        setTypingUsers(prev => {
          const convId = data.conversationId;
          const current = prev[convId] || new Set();
          current.delete(data.userId);
          return {
            ...prev,
            [convId]: new Set(current)
          };
        });
        break;

      case 'message_read':
        setMessages(prev => {
          const convId = data.conversationId;
          const convMessages = prev[convId] || [];
          return {
            ...prev,
            [convId]: convMessages.map(msg =>
              msg.id === data.messageId
                ? { ...msg, read_at: new Date().toISOString() }
                : msg
            )
          };
        });
        break;

      case 'message_deleted':
        setMessages(prev => {
          const convId = data.conversationId;
          const convMessages = prev[convId] || [];
          return {
            ...prev,
            [convId]: convMessages.map(msg =>
              msg.id === data.messageId
                ? { ...msg, deleted_at: new Date().toISOString() }
                : msg
            )
          };
        });
        break;

      case 'user_online':
        if (data.userId && data.userId !== user?.id) {
          setOnlineUsers(prev => new Set([...prev, data.userId]));
        }
        break;

      case 'user_offline':
        if (data.userId && data.userId !== user?.id) {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
        break;

      case 'online_users':
        if (data.userIds && Array.isArray(data.userIds)) {
          setOnlineUsers(new Set(data.userIds.filter((id: string) => id !== user?.id)));
        }
        break;
    }
  };

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      // First, get conversations
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(product_name, images)
        `)
        .or(`owner_id.eq.${user.id},leaser_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Get unique user IDs (owner and leaser)
      const userIds = new Set<string>();
      conversationsData.forEach((conv: any) => {
        userIds.add(conv.owner_id);
        userIds.add(conv.leaser_id);
      });

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        // Continue without profiles
      }

      // Create a map of user ID to profile
      const profilesMap = new Map();
      (profilesData || []).forEach((profile: any) => {
        profilesMap.set(profile.id, profile);
      });

      // Format conversations with profile data
      const formatted = conversationsData.map((conv: any) => {
        const ownerProfile = profilesMap.get(conv.owner_id) || { id: conv.owner_id, name: 'Owner', avatar_url: null };
        const leaserProfile = profilesMap.get(conv.leaser_id) || { id: conv.leaser_id, name: 'Leaser', avatar_url: null };

        return {
          ...conv,
          owner: ownerProfile,
          leaser: leaserProfile,
          other_user: conv.owner_id === user.id
            ? leaserProfile
            : ownerProfile,
          listing: conv.listing
        };
      });

      setConversations(formatted);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    console.log(`📖 Loading messages for conversation: ${conversationId}`);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null) // Only load non-deleted messages
        .order('created_at', { ascending: true});

      if (error) throw error;

      console.log(`✅ Loaded ${data?.length || 0} messages for conversation ${conversationId}`);

      setMessages(prev => ({
        ...prev,
        [conversationId]: (data as unknown as Message[]) || []
      }));

      // Mark messages as read
      const unreadIds = (data || [])
        .filter(m => m.sender_id !== user.id && !m.read_at && !m.deleted_at)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        console.log(`📬 Marking ${unreadIds.length} messages as read`);
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);

        // Notify sender via WebSocket
        if (ws && isConnected) {
          unreadIds.forEach(messageId => {
            ws.send(JSON.stringify({
              type: 'mark_read',
              conversationId,
              messageId
            }));
          });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [user, ws, isConnected]);


  // Create or get conversation
  const getOrCreateConversation = useCallback(async (listingId: string, ownerId: string) => {
    if (!user) return null;

    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('leaser_id', user.id)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          owner_id: ownerId,
          leaser_id: user.id,
          contact_request_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await loadConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, loadConversations]);

  // Send message - HYBRID APPROACH (WebSocket + Database fallback)
  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: 'text' | 'contact' | 'system' = 'text') => {
    console.log('sendMessage called:', { conversationId, content, messageType, userId: user?.id });

    if (!user) {
      console.error('No user - cannot send message');
      return;
    }

    try {
      // Try WebSocket first if connected
      if (ws && isConnected) {
        ws.send(JSON.stringify({
          type: 'send_message',
          conversationId,
          content,
          messageType
        }));
        console.log('✅ Message sent via WebSocket');
      } else {
        // Fallback: Save directly to database if WebSocket not available
        console.log('⚠️ WebSocket not connected, saving to database directly');

        const { data: newMessage, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            message_type: messageType
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log('✅ Message saved to database:', newMessage.id);

        // Update local state immediately
        setMessages(prev => {
          const convMessages = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: [...convMessages, newMessage as Message].sort((a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          };
        });

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        toast({
          title: 'Message sent',
          description: 'Your message has been delivered'
        });
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  }, [user, ws, isConnected]);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    currentConversationRef.current = conversationId;

    // Always load messages from database (regardless of WebSocket status)
    loadMessages(conversationId);

    // If WebSocket is connected, join the conversation room for real-time updates
    if (ws && isConnected) {
      ws.send(JSON.stringify({
        type: 'join_conversation',
        conversationId
      }));
    } else {
      console.log('⚠️ WebSocket not connected, loading messages from database only');
    }
  }, [ws, isConnected, loadMessages]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    if (currentConversationRef.current === conversationId) {
      currentConversationRef.current = null;
    }

    ws.send(JSON.stringify({
      type: 'leave_conversation',
      conversationId
    }));
  }, [ws, isConnected]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string, conversationId: string) => {
    if (!user) return;

    try {
      // Soft delete - update deleted_at using RPC or direct query
      const { error } = await (supabase as any)
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only allow deleting own messages

      if (error) throw error;

      // Update local state
      setMessages(prev => {
        const convMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: convMessages.map(msg =>
            msg.id === messageId
              ? { ...msg, deleted_at: new Date().toISOString() }
              : msg
          )
        };
      });

      // Notify via WebSocket
      if (ws && isConnected) {
        ws.send(JSON.stringify({
          type: 'delete_message',
          conversationId,
          messageId
        }));
      }

      toast({
        title: 'Message deleted',
        description: 'The message has been deleted'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  }, [user, ws, isConnected]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      // Delete all messages in the conversation first
      const { error: messagesError } = await (supabase as any)
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete the conversation
      const { error: convError } = await (supabase as any)
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .or(`owner_id.eq.${user.id},leaser_id.eq.${user.id}`);

      if (convError) throw convError;

      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });

      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been deleted'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive'
      });
    }
  }, [user]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    ws.send(JSON.stringify({
      type: 'typing',
      conversationId
    }));

    // Auto stop typing after 3 seconds
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
    }
    typingTimeoutRef.current[conversationId] = setTimeout(() => {
      sendStopTyping(conversationId);
    }, 3000);
  }, [ws, isConnected]);

  // Stop typing indicator
  const sendStopTyping = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    ws.send(JSON.stringify({
      type: 'stop_typing',
      conversationId
    }));
  }, [ws, isConnected]);

  // Approve contact request
  const approveContactRequest = useCallback(async (conversationId: string, ownerPhone: string) => {
    if (!user) return;

    try {
      // Update conversation status
      const { error: convError } = await supabase
        .from('conversations')
        .update({
          contact_request_status: 'approved',
          contact_shared: true
        })
        .eq('id', conversationId)
        .eq('owner_id', user.id);

      if (convError) throw convError;

      // Send contact as message
      sendMessage(conversationId, ownerPhone, 'contact');

      await loadConversations();
      toast({
        title: 'Contact shared',
        description: 'The contact number has been shared with the leaser'
      });
    } catch (error) {
      console.error('Error approving contact request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve contact request',
        variant: 'destructive'
      });
    }
  }, [user, sendMessage, loadConversations]);

  // Reject contact request
  const rejectContactRequest = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ contact_request_status: 'rejected' })
        .eq('id', conversationId)
        .eq('owner_id', user.id);

      if (error) throw error;

      await loadConversations();
      toast({
        title: 'Request rejected',
        description: 'Contact request has been rejected'
      });
    } catch (error) {
      console.error('Error rejecting contact request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject contact request',
        variant: 'destructive'
      });
    }
  }, [user, loadConversations]);

  // Initialize
  useEffect(() => {
    if (user && session) {
      connect();
      loadConversations();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [user, session, connect, loadConversations]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Listen for auth state changes and reconnect with fresh token
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed, reconnecting WebSocket with fresh token');
        // Close existing connection
        if (wsRef.current) {
          wsRef.current.close();
        }
        // Reconnect will happen automatically via the main useEffect
      }

      if (event === 'SIGNED_OUT') {
        console.log('User signed out, closing WebSocket');
        if (wsRef.current) {
          wsRef.current.close();
        }
        setIsConnected(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Hybrid approach: WebSocket for real-time + polling as fallback
  // Poll for new messages every 3 seconds to catch messages sent when user was offline
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    console.log('Setting up fallback polling for offline messages');

    const pollForNewMessages = async () => {
      try {
        console.log(`🔄 Polling: Checking ${conversations.length} conversations for new messages...`);

        for (const conv of conversations) {
          console.log(`   Polling conversation ${conv.id}...`);

          // Get all messages from database for this conversation
          const { data: dbMessages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: true });

          if (error) {
            console.error(`❌ Error polling messages for ${conv.id}:`, error);
            continue;
          }

          console.log(`   Found ${dbMessages?.length || 0} messages in DB for conversation ${conv.id}`);

          if (dbMessages && dbMessages.length > 0) {
            // Compare with current messages from ref (won't cause re-render)
            const currentMessages = messagesRef.current[conv.id] || [];
            console.log(`   Current local messages: ${currentMessages.length}`);

            const currentIds = new Set(currentMessages.map(m => m.id));
            const newMessages = dbMessages.filter(m => !currentIds.has(m.id));

            console.log(`   New messages to add: ${newMessages.length}`);

            if (newMessages.length > 0) {
              console.log(`📥 Polling found ${newMessages.length} new messages for conversation ${conv.id}`);
              newMessages.forEach(msg => {
                console.log(`     - "${msg.content.substring(0, 30)}" from ${msg.sender_id === user.id ? 'me' : 'other user'}`);
              });

              setMessages(prev => ({
                ...prev,
                [conv.id]: dbMessages as Message[]
              }));

              // Show notification for messages from other users
              const incomingMessages = newMessages.filter(m => m.sender_id !== user.id);
              if (incomingMessages.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('New Message', {
                  body: incomingMessages[0].content.substring(0, 50) + '...',
                  icon: '/favicon.ico'
                });
              }

              // Refresh conversations to update last message preview
              await loadConversations();
            }
          }
        }
        console.log('✅ Polling cycle complete');
      } catch (error) {
        console.error('Error in fallback polling:', error);
      }
    };

    // Poll every 3 seconds as fallback
    const pollingInterval = setInterval(pollForNewMessages, 3000);

    // Do immediate poll
    pollForNewMessages();

    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(pollingInterval);
    };
  }, [user, conversations, loadConversations]); // messages intentionally excluded

  // Update online status on mount/unmount
  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = async () => {
      try {
        await supabase
          .from('online_status')
          .upsert({
            user_id: user.id,
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      // Set offline on unmount
      (async () => {
        try {
          await supabase
            .from('online_status')
            .upsert({
              user_id: user.id,
              is_online: false,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (error) {
          console.error('Error updating online status on unmount:', error);
        }
      })();
    };
  }, [user]);

  return {
    isConnected,
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    getOrCreateConversation,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendStopTyping,
    approveContactRequest,
    rejectContactRequest,
    loadConversations,
    loadMessages,
    deleteMessage,
    deleteConversation
  };
};

