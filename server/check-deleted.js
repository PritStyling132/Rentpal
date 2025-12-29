const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('\n🔍 Checking deleted_at field in messages...\n');

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_id, deleted_at, created_at')
    .eq('conversation_id', 'aa4b9d16-6c55-4d48-b23f-ce84d6b9379b')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} messages:\n`);

  data.forEach((m, i) => {
    console.log(`${i + 1}. Content: "${m.content.substring(0, 30)}"`);
    console.log(`   deleted_at: ${m.deleted_at || 'null ✅'}`);
    console.log(`   sender_id: ${m.sender_id}`);
    console.log('');
  });

  // Check if .is('deleted_at', null) filter works
  console.log('\n🔍 Testing .is(deleted_at, null) filter...\n');

  const { data: filtered, error: filterError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', 'aa4b9d16-6c55-4d48-b23f-ce84d6b9379b')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (filterError) {
    console.error('Filter error:', filterError);
    return;
  }

  console.log(`Messages with deleted_at IS NULL: ${filtered.length}`);
  console.log(`Total messages in table: ${data.length}`);
  console.log(`Difference: ${data.length - filtered.length} (should be 0 if all are non-deleted)`);
})();
