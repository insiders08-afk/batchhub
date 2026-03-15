
-- =====================================================================
-- FIX #14: CASCADE DELETE on all batch-related FK constraints
-- =====================================================================

ALTER TABLE public.students_batches
  DROP CONSTRAINT IF EXISTS students_batches_batch_id_fkey;
ALTER TABLE public.students_batches
  ADD CONSTRAINT students_batches_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_batch_id_fkey;
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.announcements
  DROP CONSTRAINT IF EXISTS announcements_batch_id_fkey;
ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.homeworks
  DROP CONSTRAINT IF EXISTS homeworks_batch_id_fkey;
ALTER TABLE public.homeworks
  ADD CONSTRAINT homeworks_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.homework_submissions
  DROP CONSTRAINT IF EXISTS homework_submissions_batch_id_fkey;
ALTER TABLE public.homework_submissions
  ADD CONSTRAINT homework_submissions_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.test_scores
  DROP CONSTRAINT IF EXISTS test_scores_batch_id_fkey;
ALTER TABLE public.test_scores
  ADD CONSTRAINT test_scores_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.batch_messages
  DROP CONSTRAINT IF EXISTS batch_messages_batch_id_fkey;
ALTER TABLE public.batch_messages
  ADD CONSTRAINT batch_messages_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.batch_applications
  DROP CONSTRAINT IF EXISTS batch_applications_batch_id_fkey;
ALTER TABLE public.batch_applications
  ADD CONSTRAINT batch_applications_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

ALTER TABLE public.batch_teacher_requests
  DROP CONSTRAINT IF EXISTS batch_teacher_requests_batch_id_fkey;
ALTER TABLE public.batch_teacher_requests
  ADD CONSTRAINT batch_teacher_requests_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

-- =====================================================================
-- FIX #15: Add pending_teacher_name column to batches
-- =====================================================================

ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS pending_teacher_name TEXT DEFAULT NULL;
