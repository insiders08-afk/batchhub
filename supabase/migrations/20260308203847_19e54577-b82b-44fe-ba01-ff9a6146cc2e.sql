
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.institutes ADD COLUMN IF NOT EXISTS city text;
