-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable real-time for conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verify publications
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
