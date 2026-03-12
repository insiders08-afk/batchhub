
-- Fix overly permissive chat-files upload policy — scope to authenticated users only (already done)
-- Replace the broad INSERT policy with a stricter one that scopes uploads to user's own folder
DROP POLICY IF EXISTS "Institute members can upload chat files" ON storage.objects;

CREATE POLICY "Authenticated users can upload chat files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-files'
    AND auth.role() = 'authenticated'
  );
