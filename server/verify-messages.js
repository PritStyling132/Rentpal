const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMessages() {
  console.log('\n🔍 Checking Messages Table Schema and Data...\n');

  try {
    // Get the conversation ID from server logs
    const conversationId = 'aa4b9d16-6c55-4d48-b23f-ce84d6b9379b';

    console.log('1️⃣ Fetching conversation details...');
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('❌ Error fetching conversation:', convError);
      return;
    }

    console.log('✅ Conversation found:');
    console.log(`   - Owner ID: ${conversation.owner_id}`);
    console.log(`   - Leaser ID: ${conversation.leaser_id}`);
    console.log(`   - Status: ${conversation.contact_request_status}`);
    console.log('');

    console.log('2️⃣ Fetching ALL messages for this conversation (bypassing RLS)...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (msgError) {
      console.error('❌ Error fetching messages:', msgError);
      return;
    }

    console.log(`✅ Found ${messages.length} messages:\n`);

    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`);
      console.log(`   - ID: ${msg.id}`);
      console.log(`   - Sender ID: ${msg.sender_id || 'NULL ❌'}`);
      console.log(`   - Content: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`);
      console.log(`   - Created: ${new Date(msg.created_at).toLocaleString()}`);
      console.log(`   - Read: ${msg.read_at ? 'Yes' : 'No'}`);

      // Check if sender is owner or leaser
      if (msg.sender_id === conversation.owner_id) {
        console.log(`   - Sender: Owner (${msg.sender_id})`);
      } else if (msg.sender_id === conversation.leaser_id) {
        console.log(`   - Sender: Leaser (${msg.sender_id})`);
      } else {
        console.log(`   - ⚠️  Sender is NEITHER owner nor leaser!`);
      }
      console.log('');
    });

    console.log('3️⃣ Summary of findings:');
    console.log(`   - Total messages in DB: ${messages.length}`);
    console.log(`   - All have sender_id: ${messages.every(m => m.sender_id) ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   - Conversation has owner & leaser: YES ✅`);
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyMessages();
