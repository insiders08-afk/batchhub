-- Step 1: Add app_owner to the app_role enum only (must commit before use)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'app_owner';
