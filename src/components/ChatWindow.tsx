import { useState, useEffect, useRef } from 'react';
import { useChat, Message } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  X, 
  Check, 
  CheckCheck,
  Loader2,
  MessageCircle,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  conversationId: string;
  listingName: string;
  otherUserName: string;
  otherUserAvatar?: string | null;
  otherUserId?: string;
  onClose: () => void;
  isOwner?: boolean;
  contactRequestStatus?: 'pending' | 'approved' | 'rejected';
  ownerPhone?: string;
}

export const ChatWindow = ({
  conversationId,
  listingName,
  otherUserName,
  otherUserAvatar,
  otherUserId,
  onClose,
  isOwner = false,
  contactRequestStatus,
  ownerPhone
}: ChatWindowProps) => {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    sendTyping, 
    sendStopTyping,
    typingUsers,
    onlineUsers,
    isConnected,
    approveContactRequest,
    rejectContactRequest,
    joinConversation,
    deleteMessage
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationMessages = messages[conversationId] || [];
  const isTypingActive = typingUsers[conversationId]?.size > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  useEffect(() => {
    // Always join conversation to load messages, regardless of WebSocket status
    if (conversationId) {
      joinConversation(conversationId);
    }
  }, [conversationId, joinConversation]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue(''); // Clear input immediately for better UX
    setIsTyping(false);
    sendStopTyping(conversationId);

    // Send message (now works directly with database)
    await sendMessage(conversationId, messageText);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(conversationId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApprove = () => {
    if (ownerPhone) {
      approveContactRequest(conversationId, ownerPhone);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const isMessageRead = (message: Message) => {
    return message.read_at !== null;
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    if (messages.length === 0) return [];
    
    const grouped: Array<{ date: string; messages: Message[] }> = [];
    let currentDate: string | null = null;
    let currentGroup: Message[] = [];

    messages.forEach((message, index) => {
      const messageDate = new Date(message.created_at).toDateString();
      
      if (currentDate !== messageDate) {
        if (currentGroup.length > 0 && currentDate) {
          grouped.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }

      // Add last group
      if (index === messages.length - 1 && currentDate) {
        grouped.push({ date: currentDate, messages: currentGroup });
      }
    });

    return grouped;
  };

  return (
    <Card className="flex flex-col h-[600px] md:h-[700px] w-full max-w-2xl mx-auto shadow-2xl border-2 border-[#E5383B]/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#E5383B]/5 to-[#BA181B]/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-[#E5383B]/30">
              <AvatarImage src={otherUserAvatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#E5383B] to-[#BA181B] text-white">
                {getInitials(otherUserName)}
              </AvatarFallback>
            </Avatar>
            {otherUserId && onlineUsers.has(otherUserId) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#161A1D]">{otherUserName}</h3>
              {otherUserId && onlineUsers.has(otherUserId) ? (
                <span className="text-xs text-green-600 font-medium">Online</span>
              ) : (
                <span className="text-xs text-[#660708]/50">Offline</span>
              )}
            </div>
            <p className="text-xs text-[#660708]/70">{listingName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected && (
            <Badge variant="outline" className="text-xs">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Connecting...
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-[#E5383B]/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contact Request Banner (for owner) */}
      {isOwner && contactRequestStatus === 'pending' && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Contact Request Pending
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {otherUserName} wants to contact you about this listing
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] hover:opacity-90"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectContactRequest(conversationId)}
                className="border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Request Banner */}
      {contactRequestStatus === 'rejected' && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200">
          <p className="text-sm font-semibold text-red-900">
            Contact request has been rejected
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {(() => {
              const filteredMessages = conversationMessages.filter(msg => !msg.deleted_at);
              const groupedMessages = groupMessagesByDate(filteredMessages);
              
              return groupedMessages.map((group, groupIndex) => (
                <div key={group.date}>
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-[#F5F3F4] px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-[#660708]/60">
                        {formatDateDivider(group.messages[0].created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {group.messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    const isContact = message.message_type === 'contact';
                    const isSystem = message.message_type === 'system';

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group mb-2`}
                      >
                        <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwn && !isSystem && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={otherUserAvatar || undefined} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-[#E5383B] to-[#BA181B] text-white">
                                {getInitials(otherUserName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`relative rounded-2xl px-4 py-2 ${
                            isSystem 
                              ? 'bg-[#F5F3F4] text-[#660708]/70 text-center text-sm'
                              : isContact
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                              : isOwn
                              ? 'bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white'
                              : 'bg-[#F5F3F4] text-[#161A1D]'
                          }`}>
                            {isContact ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-700" />
                                <div>
                                  <p className="text-xs font-semibold text-green-900 mb-1">Contact Number</p>
                                  <a 
                                    href={`tel:${message.content}`}
                                    className="text-lg font-bold text-green-700 hover:underline"
                                  >
                                    {message.content}
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                            <div className={`flex items-center gap-1 mt-1 ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className={`text-xs ${
                                isOwn ? 'text-white/70' : 'text-[#660708]/50'
                              }`}>
                                {formatMessageTime(message.created_at)}
                              </span>
                              {isOwn && !isSystem && (
                                <div className="ml-1 flex items-center gap-1">
                                  {isMessageRead(message) ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-white/70" />
                                  )}
                                </div>
                              )}
                            </div>
                            {isOwn && !isSystem && !isContact && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-8 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => deleteMessage(message.id, conversationId)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ));
            })()}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTypingActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gradient-to-br from-[#E5383B] to-[#BA181B] text-white">
                  {getInitials(otherUserName)}
                </AvatarFallback>
              </Avatar>
              <div className="bg-[#F5F3F4] rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#660708]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#660708]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#660708]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      {contactRequestStatus !== 'rejected' && (
        <div className="p-4 border-t bg-[#F5F3F4]">
          {!isOwner && contactRequestStatus === 'pending' && (
            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                Your contact request is pending. The owner will be notified.
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-white border-[#E5383B]/20 focus:border-[#E5383B]"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

