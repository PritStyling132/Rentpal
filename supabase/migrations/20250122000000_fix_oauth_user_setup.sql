-- Fix OAuth user creation and ensure proper profile/role setup
-- This migration ensures OAuth users get proper profiles and roles

-- Update the handle_new_user function to better handle OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with OAuth data
  INSERT INTO public.profiles (id, name, phone, pin_code)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'pin_code', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Add default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create a function to ensure OAuth users have proper setup
CREATE OR REPLACE FUNCTION public.ensure_user_setup(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (id, name, phone, pin_code)
  SELECT 
    user_id,
    COALESCE(
      au.raw_user_meta_data->>'name',
      au.raw_user_meta_data->>'full_name',
      'User'
    ),
    COALESCE(au.raw_user_meta_data->>'phone', ''),
    COALESCE(au.raw_user_meta_data->>'pin_code', '')
  FROM auth.users au
  WHERE au.id = user_id
  ON CONFLICT (id) DO NOTHING;
  
  -- Ensure user role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_user_setup(UUID) TO authenticated;
