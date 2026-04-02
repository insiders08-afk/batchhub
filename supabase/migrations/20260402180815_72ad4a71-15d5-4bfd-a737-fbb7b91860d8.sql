
-- Add enrollment lock columns to institutes
ALTER TABLE public.institutes
  ADD COLUMN IF NOT EXISTS student_enrollment_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS teacher_enrollment_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS batch_application_open boolean NOT NULL DEFAULT true;

-- Add per-batch enrollment lock
ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS enrollment_open boolean NOT NULL DEFAULT true;
