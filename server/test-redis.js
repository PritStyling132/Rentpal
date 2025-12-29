require('dotenv').config();
const { Redis } = require('@upstash/redis');

async function testRedis() {
  console.log('\n🔍 Testing Redis Connection...\n');

  console.log('Environment variables:');
  console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Not set');
  console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('');

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Redis credentials not found in .env file');
    return;
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('✅ Redis client created');
    console.log('');

    // Test 1: Set a test key
    console.log('Test 1: Setting a test key...');
    await redis.set('test:connection', 'working', { ex: 60 });
    console.log('✅ Set test:connection = "working"');
    console.log('');

    // Test 2: Get the test key
    console.log('Test 2: Getting the test key...');
    const value = await redis.get('test:connection');
    console.log(`✅ Retrieved: ${value}`);
    console.log('');

    // Test 3: Check for existing message queues
    console.log('Test 3: Checking for existing message queues...');
    const keys = await redis.keys('messages:*');
    console.log(`Found ${keys.length} message queues:`);
    if (keys.length > 0) {
      for (const key of keys.slice(0, 5)) {
        const messages = await redis.lrange(key, 0, -1);
        console.log(`  - ${key}: ${messages.length} messages`);
      }
      if (keys.length > 5) {
        console.log(`  ... and ${keys.length - 5} more`);
      }
    }
    console.log('');

    // Test 4: Simulate storing a message
    console.log('Test 4: Simulating message storage...');
    const testMessage = {
      type: 'new_message',
      message: {
        id: 'test-123',
        content: 'Redis test message',
        sender_id: 'test-user',
      },
      conversationId: 'test-conversation',
      timestamp: new Date().toISOString()
    };

    await redis.lpush('messages:test-recipient:test-conversation', JSON.stringify(testMessage));
    await redis.expire('messages:test-recipient:test-conversation', 60); // Expire in 60 seconds
    console.log('✅ Stored test message');
    console.log('');

    // Test 5: Retrieve the message
    console.log('Test 5: Retrieving the test message...');
    const storedMessages = await redis.lrange('messages:test-recipient:test-conversation', 0, -1);
    console.log(`✅ Retrieved ${storedMessages.length} message(s)`);
    if (storedMessages.length > 0) {
      const parsed = JSON.parse(storedMessages[0]);
      console.log(`   Content: "${parsed.message.content}"`);
    }
    console.log('');

    // Cleanup
    console.log('Cleaning up test data...');
    await redis.del('test:connection');
    await redis.del('messages:test-recipient:test-conversation');
    console.log('✅ Cleanup complete');
    console.log('');

    console.log('🎉 All Redis tests passed! Redis is working correctly.');

  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.error('Full error:', error);
  }
}

testRedis();
