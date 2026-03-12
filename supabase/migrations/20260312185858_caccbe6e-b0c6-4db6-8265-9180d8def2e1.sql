
-- Add file support columns to batch_messages
ALTER TABLE public.batch_messages
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create chat-files storage bucket (public so files are directly accessible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: institute members can upload files
CREATE POLICY "Institute members can upload chat files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-files');

-- Storage RLS: anyone authenticated can view chat files
CREATE POLICY "Anyone can view chat files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-files');

-- Storage RLS: users can delete their own uploads
CREATE POLICY "Users can delete own chat files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
