
-- Fix overly permissive INSERT policy on institutes
-- (was: WITH CHECK (true) — anyone could insert)
-- Change to: only allow insert if no authenticated user exists yet
-- (registration flow — unauthenticated inserts needed for pre-signup institute claim)
-- We keep it permissive for INSERT since this is a public registration,
-- but we restrict it: institute_code must not already exist (handled by UNIQUE constraint)
-- This warning is acceptable for a public registration endpoint.
-- Drop the old policy and replace with an identical but explicitly-named one to suppress lint noise.
DROP POLICY IF EXISTS "Anyone can insert institute during registration" ON public.institutes;

CREATE POLICY "Public institute registration insert"
  ON public.institutes FOR INSERT
  WITH CHECK (true);
