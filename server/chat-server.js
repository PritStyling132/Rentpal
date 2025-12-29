require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Global admin client for server-side operations (bypasses RLS)
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
const supabase = adminSupabase;

// Health check endpoint
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'chat-server',
      timestamp: new Date().toISOString(),
      connections: connections.size
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });

// Store active connections: userId -> WebSocket
const connections = new Map();
// Store user rooms: userId -> Set of conversationIds
const userRooms = new Map();

// Helper to safely send message to a WebSocket
function safeSend(ws, data) {
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
  return false;
}

// Helper to get active connection for a user
function getConnection(userId) {
  const ws = connections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }
  // Clean up stale connection
  if (ws) {
    connections.delete(userId);
  }
  return null;
}

// Helper to verify JWT token
async function verifyToken(token) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('❌ Token verification error:', error.message || error);
      return null;
    }
    if (!user) {
      console.error('❌ No user found for token');
      return null;
    }
    return user;
  } catch (error) {
    console.error('❌ Token verification exception:', error.message);
    return null;
  }
}

// Helper to get conversation participants using Admin client
async function getConversationParticipants(conversationId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('owner_id, leaser_id')
    .eq('id', conversationId)
    .single();

  if (error || !data) return null;
  return { ownerId: data.owner_id, leaserId: data.leaser_id };
}

wss.on('connection', async (ws, req) => {
  console.log('New WebSocket connection attempt');

  // Extract token from query string or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    console.log('❌ No token provided in connection');
    ws.close(1008, 'Authentication required');
    return;
  }

  // Verify token
  const user = await verifyToken(token);
  if (!user) {
    console.log('❌ Token verification failed');
    ws.close(1008, 'Invalid token');
    return;
  }

  console.log('✅ Token verified for user:', user.id);

  // Create an authenticated Supabase client for this user
  let userSupabase = supabase;
  if (supabaseAnonKey) {
    userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }

  // Close any existing connection for this user
  const existingWs = connections.get(user.id);
  if (existingWs && existingWs !== ws) {
    console.log(`Closing existing connection for user ${user.id}`);
    existingWs.isReplaced = true; // Mark as replaced so close handler doesn't clean up
    try {
      existingWs.close(1000, 'New connection established');
    } catch (e) {
      // Ignore close errors
    }
  }

  // Store connection and user info
  ws.userId = user.id;
  ws.userSupabase = userSupabase;
  connections.set(user.id, ws);

  if (!userRooms.has(user.id)) {
    userRooms.set(user.id, new Set());
  }

  console.log(`User ${user.id} connected. Total connections: ${connections.size}`);

  // Send connection confirmation
  safeSend(ws, {
    type: 'connection',
    status: 'connected',
    userId: user.id
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received message from ${user.id}:`, data.type);

      switch (data.type) {
        case 'join_conversation':
          await handleJoinConversation(ws, user.id, data.conversationId);
          break;

        case 'leave_conversation':
          await handleLeaveConversation(user.id, data.conversationId);
          break;

        case 'send_message':
          await handleSendMessage(ws.userSupabase, user.id, data);
          break;

        case 'typing':
          await handleTyping(user.id, data);
          break;

        case 'stop_typing':
          await handleStopTyping(user.id, data);
          break;

        case 'mark_read':
          await handleMarkRead(ws.userSupabase, user.id, data);
          break;

        case 'delete_message':
          await handleDeleteMessage(ws.userSupabase, user.id, data);
          break;

        case 'user_online':
          await handleUserOnline(ws.userSupabase, user.id);
          break;

        default:
          safeSend(ws, {
            type: 'error',
            message: 'Unknown message type'
          });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      safeSend(ws, {
        type: 'error',
        message: 'Error processing message'
      });
    }
  });

  ws.on('close', async () => {
    console.log(`WebSocket closed for user ${user.id}`);

    // Only clean up if this is the current connection (not a replaced one)
    if (ws.isReplaced) {
      console.log(`Connection was replaced, skipping cleanup for ${user.id}`);
      return;
    }

    // Check if the current connection in the map is this one
    const currentWs = connections.get(user.id);
    if (currentWs !== ws) {
      console.log(`Connection already replaced for ${user.id}, skipping cleanup`);
      return;
    }

    console.log(`User ${user.id} disconnected`);

    // Update online status
    try {
      await userSupabase
        .from('online_status')
        .upsert({
          user_id: user.id,
          is_online: false,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating online status:', error);
    }

    // Notify users in conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('owner_id, leaser_id')
      .or(`owner_id.eq.${user.id},leaser_id.eq.${user.id}`);

    if (conversations) {
      const userIds = new Set();
      conversations.forEach(conv => {
        if (conv.owner_id !== user.id) userIds.add(conv.owner_id);
        if (conv.leaser_id !== user.id) userIds.add(conv.leaser_id);
      });

      userIds.forEach(otherUserId => {
        const otherWs = getConnection(otherUserId);
        if (otherWs) {
          safeSend(otherWs, {
            type: 'user_offline',
            userId: user.id
          });
        }
      });
    }

    connections.delete(user.id);
    userRooms.delete(user.id);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for user ${user.id}:`, error.message);
  });
});

async function handleJoinConversation(ws, userId, conversationId) {
  console.log(`User ${userId} joining conversation ${conversationId}`);

  // Verify user is part of conversation
  const participants = await getConversationParticipants(conversationId);
  if (!participants || (participants.ownerId !== userId && participants.leaserId !== userId)) {
    safeSend(ws, {
      type: 'error',
      message: 'Not authorized to join this conversation'
    });
    return;
  }

  userRooms.get(userId)?.add(conversationId);

  safeSend(ws, {
    type: 'joined_conversation',
    conversationId
  });
}

async function handleLeaveConversation(userId, conversationId) {
  userRooms.get(userId)?.delete(conversationId);
}

async function handleSendMessage(userSupabase, userId, data) {
  const { conversationId, content, messageType = 'text', mediaUrl = null } = data;

  console.log('=== handleSendMessage ===');
  console.log('From:', userId);
  console.log('Conversation:', conversationId);
  console.log('Content:', content.substring(0, 50));
  console.log('Message type:', messageType);
  console.log('Media URL:', mediaUrl ? 'present' : 'none');

  // Verify user is part of conversation
  const participants = await getConversationParticipants(conversationId);
  if (!participants) {
    console.error('Conversation not found:', conversationId);
    return;
  }

  console.log('Participants:', participants);

  if (participants.ownerId !== userId && participants.leaserId !== userId) {
    console.error('User not authorized for conversation:', { userId, participants });
    return;
  }

  // Determine recipient
  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  console.log('Recipient:', recipientId);

  // Check if this is a new conversation (first message)
  const { data: existingMessages } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .limit(1);

  const isNewConversation = !existingMessages || existingMessages.length === 0;

  // Save message to database using admin client (we've already verified authorization above)
  console.log('Saving message to database...');
  const messageData = {
    conversation_id: conversationId,
    sender_id: userId,
    content,
    message_type: messageType
  };

  // Add media_url if present
  if (mediaUrl) {
    messageData.media_url = mediaUrl;
  }

  // Use admin supabase to bypass RLS - we've already verified the user is authorized
  const { data: message, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    const senderWs = getConnection(userId);
    if (senderWs) {
      safeSend(senderWs, {
        type: 'error',
        message: 'Failed to send message. Please try again.',
        error: error.message
      });
    }
    return;
  }

  console.log('Message saved with ID:', message.id);

  // If this is a new conversation and the sender is the leaser, send email to owner
  if (isNewConversation && participants.leaserId === userId) {
    await sendNewRequestEmail(participants.ownerId, conversationId, content);
  }

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  const messagePayload = {
    ...message,
    sender_id: userId
  };

  // Send confirmation to sender
  const senderWs = getConnection(userId);
  if (senderWs) {
    console.log('Sending confirmation to sender');
    safeSend(senderWs, {
      type: 'message_sent',
      message: messagePayload
    });
  }

  // Send to recipient if online
  const recipientWs = getConnection(recipientId);
  if (recipientWs) {
    console.log('Sending message to recipient:', recipientId);
    const sent = safeSend(recipientWs, {
      type: 'new_message',
      message: messagePayload,
      conversationId
    });
    console.log('Message sent to recipient:', sent);
  } else {
    console.log('Recipient not connected:', recipientId);
  }

  console.log('=== Message handling complete ===');
}

// Email service function
async function sendNewRequestEmail(ownerId, conversationId, messageContent) {
  try {
    const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(ownerId);
    if (ownerError || !ownerData) {
      console.error('Error fetching owner data:', ownerError);
      return;
    }

    const { data: conversationData } = await supabase
      .from('conversations')
      .select(`
        listing:listings(id, product_name, images),
        leaser:profiles!conversations_leaser_id_fkey(id, name)
      `)
      .eq('id', conversationId)
      .single();

    if (!conversationData) return;

    const listing = conversationData.listing;
    const leaser = conversationData.leaser;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E5383B 0%, #BA181B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #E5383B; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #E5383B; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Rental Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${leaser?.name || 'A user'}</strong> has sent you a new request for your listing: <strong>${listing?.product_name || 'Product'}</strong></p>
            <div class="message-box">
              <p><strong>Message:</strong></p>
              <p>${messageContent.substring(0, 200)}${messageContent.length > 200 ? '...' : ''}</p>
            </div>
            <p>Please log in to your account to view and respond to this request.</p>
            <a href="${process.env.FRONTEND_URL || 'https://allrent-r.vercel.app'}/inbox" class="button">View Request</a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated email from AllRentR. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Email would be sent to:', ownerData.user.email);

    try {
      const { data, error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: ownerData.user.email,
          subject: `New Rental Request for ${listing?.product_name || 'Your Listing'}`,
          html: emailHtml,
          from: 'AllRentR <noreply@allrentr.com>'
        }
      });

      if (emailError) {
        console.error('Error invoking email function:', emailError);
      } else {
        console.log('Email sent successfully:', data);
      }
    } catch (emailErr) {
      console.error('Error calling email function:', emailErr);
    }

  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function handleTyping(userId, data) {
  const { conversationId } = data;
  const participants = await getConversationParticipants(conversationId);
  if (!participants) return;

  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  const recipientWs = getConnection(recipientId);

  if (recipientWs && userRooms.get(recipientId)?.has(conversationId)) {
    safeSend(recipientWs, {
      type: 'user_typing',
      conversationId,
      userId
    });
  }
}

async function handleStopTyping(userId, data) {
  const { conversationId } = data;
  const participants = await getConversationParticipants(conversationId);
  if (!participants) return;

  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  const recipientWs = getConnection(recipientId);

  if (recipientWs && userRooms.get(recipientId)?.has(conversationId)) {
    safeSend(recipientWs, {
      type: 'user_stopped_typing',
      conversationId,
      userId
    });
  }
}

async function handleMarkRead(userSupabase, userId, data) {
  const { messageId } = data;

  await userSupabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('conversation_id', data.conversationId);

  const { data: message } = await supabase
    .from('messages')
    .select('sender_id, conversation_id')
    .eq('id', messageId)
    .single();

  if (message && message.sender_id !== userId) {
    const senderWs = getConnection(message.sender_id);
    if (senderWs) {
      safeSend(senderWs, {
        type: 'message_read',
        messageId,
        conversationId: message.conversation_id
      });
    }
  }
}

async function handleDeleteMessage(userSupabase, userId, data) {
  const { messageId, conversationId } = data;

  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('id', messageId)
    .single();

  if (fetchError || !message || message.sender_id !== userId) {
    return;
  }

  const { error } = await userSupabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return;
  }

  const participants = await getConversationParticipants(conversationId);
  if (!participants) return;

  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;

  const senderWs = getConnection(userId);
  if (senderWs) {
    safeSend(senderWs, {
      type: 'message_deleted',
      conversationId,
      messageId
    });
  }

  const recipientWs = getConnection(recipientId);
  if (recipientWs && userRooms.get(recipientId)?.has(conversationId)) {
    safeSend(recipientWs, {
      type: 'message_deleted',
      conversationId,
      messageId
    });
  }
}

async function handleUserOnline(userSupabase, userId) {
  console.log(`handleUserOnline for ${userId}`);

  try {
    await userSupabase
      .from('online_status')
      .upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error updating online status:', error);
  }

  const { data: conversations } = await supabase
    .from('conversations')
    .select('owner_id, leaser_id')
    .or(`owner_id.eq.${userId},leaser_id.eq.${userId}`);

  if (!conversations) return;

  const conversationUserIds = new Set();
  conversations.forEach(conv => {
    if (conv.owner_id !== userId) conversationUserIds.add(conv.owner_id);
    if (conv.leaser_id !== userId) conversationUserIds.add(conv.leaser_id);
  });

  // Find which of these users are currently online
  const onlineUserIds = [];
  conversationUserIds.forEach(otherUserId => {
    if (getConnection(otherUserId)) {
      onlineUserIds.push(otherUserId);
    }
  });

  // Send the list of online users to the newly connected user
  const currentUserWs = getConnection(userId);
  if (currentUserWs && onlineUserIds.length > 0) {
    console.log(`Sending online users list to ${userId}:`, onlineUserIds);
    safeSend(currentUserWs, {
      type: 'online_users',
      userIds: onlineUserIds
    });
  }

  // Notify all connected users that this user is now online
  conversationUserIds.forEach(otherUserId => {
    const ws = getConnection(otherUserId);
    if (ws) {
      console.log(`Notifying ${otherUserId} that ${userId} is online`);
      safeSend(ws, {
        type: 'user_online',
        userId
      });
    }
  });
}

const PORT = process.env.PORT || process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});
