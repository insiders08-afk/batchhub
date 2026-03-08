
-- Fix profiles RLS: allow anon insert during signup (before email confirmation)
-- The issue: after signUp(), user isn't confirmed so auth.uid() is null
-- Solution: allow anon role to insert profiles where user_id matches the registered user

DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.profiles;

CREATE POLICY "Anyone can insert profile during signup"
ON public.profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Seed super admin for user 5dc7ea0f-8524-4a7f-bffd-f1979fbde7fd (kjais1104@gmail.com)
-- First insert into user_roles
INSERT INTO public.user_roles (user_id, role, city)
VALUES ('5dc7ea0f-8524-4a7f-bffd-f1979fbde7fd', 'super_admin', 'Bareilly')
ON CONFLICT DO NOTHING;

-- Insert/update profile for the super admin user
INSERT INTO public.profiles (user_id, full_name, email, role, status)
VALUES ('5dc7ea0f-8524-4a7f-bffd-f1979fbde7fd', 'Lamba Owner', 'kjais1104@gmail.com', 'admin', 'approved')
ON CONFLICT (user_id) DO UPDATE SET status = 'approved', role = 'admin';

-- Delete the dummy institute they created
DELETE FROM public.institutes WHERE owner_user_id = '5dc7ea0f-8524-4a7f-bffd-f1979fbde7fd';
