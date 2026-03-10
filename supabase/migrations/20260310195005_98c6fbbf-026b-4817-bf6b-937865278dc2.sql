
-- Add structured fee columns to fees table
ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS annual_amount numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_frequency text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS batch_id uuid DEFAULT NULL;

-- Index for batch-based fee filtering
CREATE INDEX IF NOT EXISTS idx_fees_batch_id ON public.fees(batch_id);
CREATE INDEX IF NOT EXISTS idx_fees_institute_batch ON public.fees(institute_code, batch_id);
