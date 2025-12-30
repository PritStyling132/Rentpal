const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

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
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

// Helper to get conversation participants
async function getConversationParticipants(conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { ownerId: true, leaserId: true }
  });

  if (!conversation) return null;
  return { ownerId: conversation.ownerId, leaserId: conversation.leaserId };
}

// Initialize WebSocket server
function initWebSocket(wss) {
  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection attempt');

    // Extract token from query string or headers
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided in connection');
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify token
    const user = verifyToken(token);
    if (!user) {
      console.log('Token verification failed');
      ws.close(1008, 'Invalid token');
      return;
    }

    console.log('Token verified for user:', user.userId);

    // Close any existing connection for this user
    const existingWs = connections.get(user.userId);
    if (existingWs && existingWs !== ws) {
      console.log(`Closing existing connection for user ${user.userId}`);
      existingWs.isReplaced = true;
      try {
        existingWs.close(1000, 'New connection established');
      } catch (e) {
        // Ignore close errors
      }
    }

    // Store connection and user info
    ws.userId = user.userId;
    connections.set(user.userId, ws);

    if (!userRooms.has(user.userId)) {
      userRooms.set(user.userId, new Set());
    }

    console.log(`User ${user.userId} connected. Total connections: ${connections.size}`);

    // Send connection confirmation
    safeSend(ws, {
      type: 'connection',
      status: 'connected',
      userId: user.userId
    });

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from ${user.userId}:`, data.type);

        switch (data.type) {
          case 'join_conversation':
            await handleJoinConversation(ws, user.userId, data.conversationId);
            break;

          case 'leave_conversation':
            await handleLeaveConversation(user.userId, data.conversationId);
            break;

          case 'send_message':
            await handleSendMessage(user.userId, data);
            break;

          case 'typing':
            await handleTyping(user.userId, data);
            break;

          case 'stop_typing':
            await handleStopTyping(user.userId, data);
            break;

          case 'mark_read':
            await handleMarkRead(user.userId, data);
            break;

          case 'delete_message':
            await handleDeleteMessage(user.userId, data);
            break;

          case 'user_online':
            await handleUserOnline(user.userId);
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
      console.log(`WebSocket closed for user ${user.userId}`);

      if (ws.isReplaced) {
        console.log(`Connection was replaced, skipping cleanup for ${user.userId}`);
        return;
      }

      const currentWs = connections.get(user.userId);
      if (currentWs !== ws) {
        console.log(`Connection already replaced for ${user.userId}, skipping cleanup`);
        return;
      }

      console.log(`User ${user.userId} disconnected`);

      // Update online status
      try {
        await prisma.onlineStatus.upsert({
          where: { userId: user.userId },
          update: {
            isOnline: false,
            lastSeen: new Date(),
          },
          create: {
            userId: user.userId,
            isOnline: false,
            lastSeen: new Date(),
          }
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }

      // Notify users in conversations
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { ownerId: user.userId },
            { leaserId: user.userId }
          ]
        },
        select: { ownerId: true, leaserId: true }
      });

      const userIds = new Set();
      conversations.forEach(conv => {
        if (conv.ownerId !== user.userId) userIds.add(conv.ownerId);
        if (conv.leaserId !== user.userId) userIds.add(conv.leaserId);
      });

      userIds.forEach(otherUserId => {
        const otherWs = getConnection(otherUserId);
        if (otherWs) {
          safeSend(otherWs, {
            type: 'user_offline',
            userId: user.userId
          });
        }
      });

      connections.delete(user.userId);
      userRooms.delete(user.userId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${user.userId}:`, error.message);
    });
  });
}

async function handleJoinConversation(ws, userId, conversationId) {
  console.log(`User ${userId} joining conversation ${conversationId}`);

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

async function handleSendMessage(userId, data) {
  const { conversationId, content, messageType = 'text', mediaUrl = null } = data;

  console.log('=== handleSendMessage ===');
  console.log('From:', userId);
  console.log('Conversation:', conversationId);

  const participants = await getConversationParticipants(conversationId);
  if (!participants) {
    console.error('Conversation not found:', conversationId);
    return;
  }

  if (participants.ownerId !== userId && participants.leaserId !== userId) {
    console.error('User not authorized for conversation:', { userId, participants });
    return;
  }

  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;

  // Check if this is a new conversation
  const existingMessages = await prisma.message.findFirst({
    where: { conversationId }
  });
  const isNewConversation = !existingMessages;

  // Save message to database
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content,
      messageType,
      mediaUrl
    }
  });

  console.log('Message saved with ID:', message.id);

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  const messagePayload = {
    id: message.id,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    content: message.content,
    message_type: message.messageType,
    media_url: message.mediaUrl,
    created_at: message.createdAt,
    read_at: message.readAt,
    deleted_at: message.deletedAt
  };

  // Send confirmation to sender
  const senderWs = getConnection(userId);
  if (senderWs) {
    safeSend(senderWs, {
      type: 'message_sent',
      message: messagePayload
    });
  }

  // Send to recipient if online
  const recipientWs = getConnection(recipientId);
  if (recipientWs) {
    console.log('Sending message to recipient:', recipientId);
    safeSend(recipientWs, {
      type: 'new_message',
      message: messagePayload,
      conversationId
    });
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

async function handleMarkRead(userId, data) {
  const { messageId, conversationId } = data;

  await prisma.message.updateMany({
    where: {
      id: messageId,
      conversationId,
      senderId: { not: userId }
    },
    data: { readAt: new Date() }
  });

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, conversationId: true }
  });

  if (message && message.senderId !== userId) {
    const senderWs = getConnection(message.senderId);
    if (senderWs) {
      safeSend(senderWs, {
        type: 'message_read',
        messageId,
        conversationId: message.conversationId
      });
    }
  }
}

async function handleDeleteMessage(userId, data) {
  const { messageId, conversationId } = data;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true }
  });

  if (!message || message.senderId !== userId) {
    return;
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() }
  });

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

async function handleUserOnline(userId) {
  console.log(`handleUserOnline for ${userId}`);

  try {
    await prisma.onlineStatus.upsert({
      where: { userId },
      update: {
        isOnline: true,
        lastSeen: new Date(),
      },
      create: {
        userId,
        isOnline: true,
        lastSeen: new Date(),
      }
    });
  } catch (error) {
    console.error('Error updating online status:', error);
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { leaserId: userId }
      ]
    },
    select: { ownerId: true, leaserId: true }
  });

  const conversationUserIds = new Set();
  conversations.forEach(conv => {
    if (conv.ownerId !== userId) conversationUserIds.add(conv.ownerId);
    if (conv.leaserId !== userId) conversationUserIds.add(conv.leaserId);
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
      safeSend(ws, {
        type: 'user_online',
        userId
      });
    }
  });
}

module.exports = {
  initWebSocket,
  connections,
  getConnection
};
