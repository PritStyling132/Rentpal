-- Create terms_and_conditions table
CREATE TABLE public.terms_and_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active terms
CREATE POLICY "Anyone can view active terms"
ON public.terms_and_conditions
FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage terms
CREATE POLICY "Admins can manage terms"
ON public.terms_and_conditions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default terms
INSERT INTO public.terms_and_conditions (content, version, active, created_by)
VALUES (
  'Welcome to our platform. By using this service, you agree to the following terms and conditions:

1. **Acceptance of Terms**: By accessing and using this platform, you accept and agree to be bound by these terms.

2. **User Responsibilities**: You are responsible for maintaining the confidentiality of your account and password.

3. **Listing Guidelines**: All listings must be accurate and not misleading. False or fraudulent listings are prohibited.

4. **Payment Terms**: All payments must be made through authorized channels. We are not responsible for transactions made outside the platform.

5. **Privacy Policy**: We collect and use your personal information as described in our Privacy Policy.

6. **Prohibited Activities**: You may not use this platform for any illegal or unauthorized purpose.

7. **Modifications**: We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.

8. **Termination**: We reserve the right to terminate or suspend accounts that violate these terms.

9. **Limitation of Liability**: We are not liable for any damages arising from the use of this platform.

10. **Contact**: For questions about these terms, please contact our support team.',
  1,
  true,
  '00000000-0000-0000-0000-000000000000'
);