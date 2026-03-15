
ALTER TABLE public.batch_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.batch_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reactions JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE POLICY "Institute members can update message reactions"
  ON public.batch_messages
  FOR UPDATE
  TO authenticated
  USING (institute_code = get_my_institute_code())
  WITH CHECK (institute_code = get_my_institute_code());
