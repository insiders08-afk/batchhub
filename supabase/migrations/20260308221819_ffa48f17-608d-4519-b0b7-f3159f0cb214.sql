CREATE TABLE public.batch_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL,
  institute_code TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'student',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institute members can view batch messages"
  ON public.batch_messages FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Institute members can send messages"
  ON public.batch_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND institute_code = get_my_institute_code()
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_messages;

CREATE INDEX idx_batch_messages_batch_id ON public.batch_messages(batch_id, created_at);