-- Fix RLS policies for messages table to ensure both participants can see all messages

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

-- Create a more permissive SELECT policy
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE owner_id = auth.uid() OR leaser_id = auth.uid()
    )
  );

-- Drop and recreate UPDATE policy to allow recipients to mark messages as read
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Allow users to update messages in their conversations (for read receipts and soft delete)
CREATE POLICY "Users can update messages in their conversations"
  ON public.messages
  FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE owner_id = auth.uid() OR leaser_id = auth.uid()
    )
  );

-- Ensure deleted_at and media_url columns exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Update message_type constraint to include image and audio
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check
  CHECK (message_type IN ('text', 'contact', 'system', 'image', 'audio'));
