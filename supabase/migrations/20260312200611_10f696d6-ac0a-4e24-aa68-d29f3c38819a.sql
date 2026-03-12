
-- Enable pg_net extension for HTTP calls from DB triggers
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Function that fires push notification when announcement with notify_push=true is inserted
CREATE OR REPLACE FUNCTION public.trigger_announcement_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_payload JSONB;
BEGIN
  -- Only fire if notify_push is true
  IF NEW.notify_push IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  v_url := 'https://bomcmutmilixrzanktvu.supabase.co';

  -- Build payload
  v_payload := jsonb_build_object(
    'institute_code', NEW.institute_code,
    'title', NEW.title,
    'body', NEW.content,
    'url', '/student/announcements'
  );

  IF NEW.batch_id IS NOT NULL THEN
    v_payload := v_payload || jsonb_build_object('batch_id', NEW.batch_id);
  END IF;

  -- Fire HTTP request via pg_net (fire-and-forget, non-blocking)
  PERFORM extensions.http_post(
    url := v_url || '/functions/v1/send-push-notifications',
    body := v_payload::text,
    content_type := 'application/json',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4OTM3NSwiZXhwIjoyMDg4NTY1Mzc1fQ._L0m_C8t0VhV4jgf6W4r0R7x2s9nJvP8fKy3bNzQeAA',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4OTM3NSwiZXhwIjoyMDg4NTY1Mzc1fQ._L0m_C8t0VhV4jgf6W4r0R7x2s9nJvP8fKy3bNzQeAA'
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[push_trigger] Failed to send push: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger on announcements table
DROP TRIGGER IF EXISTS on_announcement_push ON public.announcements;
CREATE TRIGGER on_announcement_push
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_announcement_push();
