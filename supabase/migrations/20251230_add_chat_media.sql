-- Migration to add media support to chat messages

-- Add media_url column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Add deleted_at column if it doesn't exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Drop the old message_type check constraint and add updated one with image and audio
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check
  CHECK (message_type IN ('text', 'contact', 'system', 'image', 'audio'));

-- Create chat-media storage bucket (if using Supabase dashboard, this needs to be done there)
-- The bucket should be created via Supabase dashboard with the following settings:
-- Name: chat-media
-- Public: true (for public URL access)
-- Allowed MIME types: image/*, audio/*

-- Create index for media_url
CREATE INDEX IF NOT EXISTS idx_messages_media_url ON public.messages(media_url) WHERE media_url IS NOT NULL;
