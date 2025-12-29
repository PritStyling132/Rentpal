-- Create coupons table for admin to manage discount codes
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_percentage integer NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount numeric NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  is_percentage boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage all coupons
CREATE POLICY "Admins can manage coupons"
  ON public.coupons
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add listing_type column to listings table
ALTER TABLE public.listings 
ADD COLUMN listing_type text NOT NULL DEFAULT 'paid' CHECK (listing_type IN ('free', 'paid')),
ADD COLUMN coupon_code text,
ADD COLUMN original_price numeric NOT NULL DEFAULT 20,
ADD COLUMN discount_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN final_price numeric NOT NULL DEFAULT 20;