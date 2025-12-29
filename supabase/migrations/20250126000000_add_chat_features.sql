-- Add deleted_at field to messages table
ALTER TABLE public.messages 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted_at
CREATE INDEX idx_messages_deleted_at ON public.messages(deleted_at) WHERE deleted_at IS NULL;

-- Create online_status table to track user online status
CREATE TABLE IF NOT EXISTS public.online_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS for online_status
ALTER TABLE public.online_status ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view online status of users they have conversations with
CREATE POLICY "Users can view online status of conversation participants"
  ON public.online_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.owner_id = auth.uid() OR c.leaser_id = auth.uid())
      AND (c.owner_id = online_status.user_id OR c.leaser_id = online_status.user_id)
    )
  );

-- RLS Policy: Users can update their own online status
CREATE POLICY "Users can update their own online status"
  ON public.online_status
  FOR ALL
  USING (user_id = auth.uid());

-- Create index for online_status
CREATE INDEX idx_online_status_is_online ON public.online_status(is_online) WHERE is_online = TRUE;

-- Update get_unread_count function to exclude deleted messages
CREATE OR REPLACE FUNCTION get_unread_count(user_id_param UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM public.messages m
  INNER JOIN public.conversations c ON m.conversation_id = c.id
  WHERE (c.owner_id = user_id_param OR c.leaser_id = user_id_param)
    AND m.sender_id != user_id_param
    AND m.read_at IS NULL
    AND m.deleted_at IS NULL;
$$ LANGUAGE SQL STABLE;

