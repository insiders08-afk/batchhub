
-- 1. Fix stale names in batches (teacher_name) based on current profiles
UPDATE public.batches
SET teacher_name = p.full_name
FROM public.profiles p
WHERE batches.teacher_id = p.user_id
  AND batches.teacher_name IS DISTINCT FROM p.full_name;

-- 2. Fix stale owner_name in institutes based on profiles of each owner
UPDATE public.institutes
SET owner_name = p.full_name
FROM public.profiles p
WHERE institutes.owner_user_id = p.user_id
  AND institutes.owner_name IS DISTINCT FROM p.full_name;

-- 3. Create trigger function to auto-sync full_name changes from profiles
CREATE OR REPLACE FUNCTION public.sync_profile_name_to_tables()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.full_name IS NOT DISTINCT FROM OLD.full_name THEN
    RETURN NEW;
  END IF;
  UPDATE public.batches SET teacher_name = NEW.full_name WHERE teacher_id = NEW.user_id;
  UPDATE public.institutes SET owner_name = NEW.full_name WHERE owner_user_id = NEW.user_id;
  UPDATE public.announcements SET posted_by_name = NEW.full_name WHERE posted_by = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_name ON public.profiles;
CREATE TRIGGER trg_sync_profile_name
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_name_to_tables();
