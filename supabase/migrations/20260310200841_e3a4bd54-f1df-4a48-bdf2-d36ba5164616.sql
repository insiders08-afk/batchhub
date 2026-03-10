
-- Add cycle-based fee columns to fees table
ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS cycle_day integer CHECK (cycle_day >= 1 AND cycle_day <= 31),
  ADD COLUMN IF NOT EXISTS start_month text, -- e.g. '2025-03' (YYYY-MM)
  ADD COLUMN IF NOT EXISTS paid_cycles_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paid_amount numeric NOT NULL DEFAULT 0;

-- Make batch_id effectively required by adding a comment (can't add NOT NULL without default on existing rows)
-- We'll enforce this in app logic

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_fees_student_batch ON public.fees(student_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_fees_institute_due ON public.fees(institute_code, due_date);
