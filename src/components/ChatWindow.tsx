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
  Trash2,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  Mic,
  Square,
  Play,
  Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

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
    uploadMedia,
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const conversationMessages = messages[conversationId] || [];
  const isTypingActive = typingUsers[conversationId]?.size > 0;

  // Debug: Log when messages change
  console.log('ChatWindow render - conversationId:', conversationId, 'messages count:', conversationMessages.length);

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

  // Emoji picker handler
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Image upload handler
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      const mediaUrl = await uploadMedia(file, 'image');
      if (mediaUrl) {
        await sendMessage(conversationId, 'Image', 'image', mediaUrl);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });

        setIsUploading(true);
        try {
          const mediaUrl = await uploadMedia(audioFile, 'audio');
          if (mediaUrl) {
            await sendMessage(conversationId, 'Voice message', 'audio', mediaUrl);
          }
        } finally {
          setIsUploading(false);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio playback handler
  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    let audio = audioElementsRef.current.get(messageId);

    if (!audio) {
      audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudioId(null);
      audioElementsRef.current.set(messageId, audio);
    }

    if (playingAudioId === messageId) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      if (playingAudioId) {
        const currentAudio = audioElementsRef.current.get(playingAudioId);
        currentAudio?.pause();
      }
      audio.play();
      setPlayingAudioId(messageId);
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
                    // A message is "own" if the sender_id matches current user's id
                    // Use strict comparison and ensure both values exist
                    // Also validate against otherUserId for extra safety
                    const currentUserId = user?.id;
                    const messageSenderId = message.sender_id;

                    // If sender is the other user, it's definitely not our message
                    const isFromOtherUser = otherUserId && messageSenderId === otherUserId;
                    // A message is ours only if we have a valid user ID and sender matches
                    const isOwn = !isFromOtherUser && Boolean(currentUserId) && messageSenderId === currentUserId;

                    const isContact = message.message_type === 'contact';
                    const isSystem = message.message_type === 'system';
                    const isImage = message.message_type === 'image';
                    const isAudio = message.message_type === 'audio';

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
                              : isImage
                              ? 'p-1 bg-transparent'
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
                            ) : isImage && message.media_url ? (
                              <div className="rounded-xl overflow-hidden">
                                <img
                                  src={message.media_url}
                                  alt="Shared image"
                                  className="max-w-[250px] max-h-[250px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(message.media_url!, '_blank')}
                                />
                              </div>
                            ) : isAudio && message.media_url ? (
                              <div className={`flex items-center gap-3 min-w-[180px] ${
                                isOwn ? 'bg-white/20' : 'bg-[#E5383B]/10'
                              } rounded-full px-3 py-2`}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={`h-8 w-8 rounded-full ${
                                    isOwn ? 'hover:bg-white/20 text-white' : 'hover:bg-[#E5383B]/20 text-[#E5383B]'
                                  }`}
                                  onClick={() => toggleAudioPlayback(message.id, message.media_url!)}
                                >
                                  {playingAudioId === message.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  <div className={`h-1 rounded-full ${
                                    isOwn ? 'bg-white/40' : 'bg-[#E5383B]/30'
                                  }`}>
                                    <div className={`h-full w-0 rounded-full ${
                                      isOwn ? 'bg-white' : 'bg-[#E5383B]'
                                    } ${playingAudioId === message.id ? 'animate-pulse' : ''}`} />
                                  </div>
                                  <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-[#660708]/50'}`}>
                                    Voice message
                                  </span>
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

          {/* Recording indicator */}
          {isRecording && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-700">Recording... {formatRecordingTime(recordingTime)}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={stopRecording}
                className="text-red-700 hover:bg-red-100"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </div>
          )}

          {/* Uploading indicator */}
          {isUploading && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">Uploading...</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-[#E5383B]/10"
                  disabled={isRecording || isUploading}
                >
                  <Smile className="h-5 w-5 text-[#660708]/70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-none" side="top" align="start">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={350}
                />
              </PopoverContent>
            </Popover>

            {/* Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-[#E5383B]/10"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording || isUploading}
            >
              <ImageIcon className="h-5 w-5 text-[#660708]/70" />
            </Button>

            {/* Audio Recording */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${isRecording ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-[#E5383B]/10'}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploading}
            >
              {isRecording ? (
                <Square className="h-5 w-5 text-red-600" />
              ) : (
                <Mic className="h-5 w-5 text-[#660708]/70" />
              )}
            </Button>

            {/* Message Input */}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-white border-[#E5383B]/20 focus:border-[#E5383B]"
              disabled={isRecording || isUploading}
            />

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isRecording || isUploading}
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

