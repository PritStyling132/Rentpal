import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { ChatWindow } from '@/components/ChatWindow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Inbox as InboxIcon,
  Search,
  Loader2,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    conversations, 
    messages, 
    isConnected,
    joinConversation,
    loadConversations,
    deleteConversation
  } = useChat();
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [listingPhone, setListingPhone] = useState<string | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Calculate unread counts - fetch from database to ensure accuracy
  useEffect(() => {
    if (!user || !conversations.length) {
      setUnreadCounts({});
      return;
    }

    const calculateUnread = async () => {
      const counts: Record<string, number> = {};
      
      try {
        // Get all conversation IDs
        const convIds = conversations.map(c => c.id);
        
        // Fetch unread counts from database for accuracy
        // Get all messages in these conversations that are unread and not from the current user
        const { data: unreadData, error } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .is('read_at', null)
          .is('deleted_at', null)
          .neq('sender_id', user.id);
        
        if (error) {
          console.error('Error fetching unread counts:', error);
          // Fallback to local calculation
          for (const conv of conversations) {
            const convMessages = messages[conv.id] || [];
            const unread = convMessages.filter(
              (m: any) => m.sender_id !== user.id && !m.read_at && !m.deleted_at
            ).length;
            counts[conv.id] = unread;
          }
        } else {
          // Count unread messages per conversation
          const unreadMap = new Map<string, number>();
          (unreadData || []).forEach((msg: any) => {
            unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1);
          });
          
          conversations.forEach(conv => {
            counts[conv.id] = unreadMap.get(conv.id) || 0;
          });
        }
      } catch (error) {
        console.error('Error calculating unread counts:', error);
        // Fallback to local calculation
        for (const conv of conversations) {
          const convMessages = messages[conv.id] || [];
          const unread = convMessages.filter(
            (m: any) => m.sender_id !== user.id && !m.read_at && !m.deleted_at
          ).length;
          counts[conv.id] = unread;
        }
      }
      
      setUnreadCounts(counts);
    };

    calculateUnread();
  }, [conversations, messages, user]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const handleOpenChat = async (conversation: any) => {
    setSelectedConversation(conversation);
    joinConversation(conversation.id);
    
    // Mark all messages in this conversation as read
    try {
      const { data: convMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user?.id)
        .is('read_at', null)
        .is('deleted_at', null);
      
      if (convMessages && convMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', convMessages.map(m => m.id));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
    
    // Fetch listing phone if user is owner and needs to approve contact
    if (conversation.owner_id === user?.id && conversation.contact_request_status === 'pending') {
      try {
        const { data } = await supabase
          .from('listings')
          .select('phone')
          .eq('id', conversation.listing_id)
          .single();
        setListingPhone(data?.phone);
      } catch (error) {
        console.error('Error fetching listing phone:', error);
      }
    }
    
    setChatOpen(true);
  };

  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.listing?.product_name?.toLowerCase().includes(query) ||
      conv.other_user?.name?.toLowerCase().includes(query) ||
      conv.owner?.name?.toLowerCase().includes(query) ||
      conv.leaser?.name?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLastMessage = (conversationId: string) => {
    const convMessages = messages[conversationId] || [];
    return convMessages[convMessages.length - 1];
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3F4] to-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold text-[#161A1D] mb-4">Please login to view your inbox</h1>
          <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-[#E5383B] to-[#BA181B]">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3F4] to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <InboxIcon className="w-8 h-8 text-[#E5383B]" />
              <h1 className="text-4xl font-bold text-[#161A1D]">Inbox</h1>
              {totalUnread > 0 && (
                <Badge className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white">
                  {totalUnread} unread
                </Badge>
              )}
            </div>
            <p className="text-[#660708]/70">
              Manage your conversations with owners and leasers
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#660708]/50 w-5 h-5" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#E5383B]/20 focus:border-[#E5383B]"
              />
            </div>
          </div>

          {/* Conversations List */}
          <Card className="bg-white border-2 border-[#E5383B]/20 shadow-lg">
            <ScrollArea className="h-[600px]">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <MessageCircle className="w-16 h-16 text-[#D3D3D3] mb-4" />
                  <p className="text-xl text-[#660708]/70 mb-2">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                  <p className="text-sm text-[#660708]/50">
                    {searchQuery 
                      ? 'Try a different search term' 
                      : 'Start a conversation from a listing to see it here'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E5]">
                  {filteredConversations.map((conversation) => {
                    const lastMessage = getLastMessage(conversation.id);
                    const unreadCount = unreadCounts[conversation.id] || 0;
                    const isPending = conversation.contact_request_status === 'pending';
                    const isRejected = conversation.contact_request_status === 'rejected';
                    const isOwner = conversation.owner_id === user.id;

                    return (
                      <div
                        key={conversation.id}
                        className="p-4 hover:bg-[#F5F3F4] transition-colors group relative"
                      >
                        <div 
                          onClick={() => handleOpenChat(conversation)}
                          className="flex items-start gap-4 cursor-pointer"
                        >
                          <Avatar className="h-12 w-12 border-2 border-[#E5383B]/30">
                            <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-[#E5383B] to-[#BA181B] text-white">
                              {getInitials(conversation.other_user?.name || 'U')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[#161A1D] truncate">
                                  {conversation.other_user?.name || (isOwner ? 'Leaser' : 'Owner')}
                                </h3>
                                {isPending && (
                                  <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                    Pending
                                  </Badge>
                                )}
                                {isRejected && (
                                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                                    Rejected
                                  </Badge>
                                )}
                              </div>
                              {lastMessage && (
                                <span className="text-xs text-[#660708]/50 whitespace-nowrap ml-2">
                                  {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-[#660708]/70 mb-1 truncate">
                              {conversation.listing?.product_name || 'Listing'}
                            </p>

                            {lastMessage ? (
                              <p className="text-sm text-[#660708]/60 truncate">
                                {lastMessage.content.length > 50
                                  ? `${lastMessage.content.substring(0, 50)}...`
                                  : lastMessage.content}
                              </p>
                            ) : (
                              <p className="text-sm text-[#660708]/50 italic">
                                No messages yet
                              </p>
                            )}
                          </div>

                          {unreadCount > 0 && (
                            <Badge className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white min-w-[24px] h-6 flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        {/* Delete Conversation Button */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setConversationToDelete(conversation.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Conversation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (conversationToDelete) {
                      await deleteConversation(conversationToDelete);
                      setDeleteDialogOpen(false);
                      setConversationToDelete(null);
                      if (selectedConversation?.id === conversationToDelete) {
                        setChatOpen(false);
                        setSelectedConversation(null);
                      }
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#660708]/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to chat server...</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none outline-none ring-0 focus:outline-none focus:ring-0" aria-describedby="inbox-chat-description">
          <DialogHeader className="sr-only">
            <DialogTitle>
              Chat with {selectedConversation?.other_user?.name || 'User'}
            </DialogTitle>
            <DialogDescription id="inbox-chat-description">
              Conversation about {selectedConversation?.listing?.product_name || 'listing'}
            </DialogDescription>
          </DialogHeader>
          {selectedConversation && (
            <ChatWindow
              conversationId={selectedConversation.id}
              listingName={selectedConversation.listing?.product_name || 'Listing'}
              otherUserName={selectedConversation.other_user?.name || (selectedConversation.owner_id === user.id ? 'Leaser' : 'Owner')}
              otherUserAvatar={selectedConversation.other_user?.avatar_url}
              otherUserId={selectedConversation.other_user?.id}
              onClose={() => {
                setChatOpen(false);
                setSelectedConversation(null);
                setListingPhone(undefined);
                loadConversations(); // Refresh to update unread counts
              }}
              isOwner={selectedConversation.owner_id === user.id}
              contactRequestStatus={selectedConversation.contact_request_status}
              ownerPhone={listingPhone}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inbox;

