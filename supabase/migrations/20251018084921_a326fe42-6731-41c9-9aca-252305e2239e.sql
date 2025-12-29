-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage notifications
CREATE POLICY "Admins can manage notifications"
  ON public.notifications
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- All authenticated users can view active notifications
CREATE POLICY "Users can view active notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create a trigger to update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();