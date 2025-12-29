/**
 * WebSocket Test Script
 * Tests WebSocket connection and message flow
 */

const WebSocket = require('ws');

// Test configuration
const WS_URL = 'ws://localhost:8081';
const TEST_TOKEN = process.argv[2]; // Pass JWT token as command line argument

if (!TEST_TOKEN) {
  console.error('❌ Usage: node test-websocket.js <JWT_TOKEN>');
  console.log('Get your JWT token from browser:');
  console.log('1. Login to the app');
  console.log('2. Open DevTools > Application > Local Storage');
  console.log('3. Copy the value of "supabase.auth.token"');
  process.exit(1);
}

console.log('🧪 Starting WebSocket Test...\n');

// Create WebSocket connection
const ws = new WebSocket(`${WS_URL}?token=${TEST_TOKEN}`);

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log(`📡 Connected to: ${WS_URL}\n`);

  // Test 1: Connection event
  console.log('Test 1: Waiting for connection confirmation...');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received message:', JSON.stringify(message, null, 2));

    // Test different message types
    switch (message.type) {
      case 'connection':
        if (message.status === 'connected') {
          console.log('✅ Connection confirmed by server\n');
        }
        break;

      case 'message_sent':
        console.log('✅ Message saved to database and confirmed');
        console.log(`   Message ID: ${message.message.id}`);
        console.log(`   Content: ${message.message.content}\n`);
        break;

      case 'new_message':
        console.log('✅ New message received from another user');
        console.log(`   Sender: ${message.message.sender_id}`);
        console.log(`   Content: ${message.message.content}\n`);
        break;

      case 'error':
        console.log('❌ Error from server:', message.message);
        break;

      default:
        console.log('ℹ️  Other message type:', message.type);
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 WebSocket closed`);
  console.log(`   Code: ${code}`);
  console.log(`   Reason: ${reason || 'No reason provided'}`);
  process.exit(code === 1000 ? 0 : 1);
});

// Keep the connection alive for testing
console.log('💡 WebSocket connection is active. Press Ctrl+C to exit.\n');
console.log('📝 To test messaging:');
console.log('   1. Open the app in your browser');
console.log('   2. Send a message in a conversation');
console.log('   3. Watch this terminal for WebSocket events\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing WebSocket connection...');
  ws.close(1000, 'Client shutting down');
});
