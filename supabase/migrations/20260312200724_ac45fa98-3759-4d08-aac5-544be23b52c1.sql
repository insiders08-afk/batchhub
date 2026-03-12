
-- Fix trigger to use correct net.http_post signature
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
  IF NEW.notify_push IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  v_url := 'https://bomcmutmilixrzanktvu.supabase.co';

  v_payload := jsonb_build_object(
    'institute_code', NEW.institute_code,
    'title', NEW.title,
    'body', NEW.content,
    'url', '/student/announcements'
  );

  IF NEW.batch_id IS NOT NULL THEN
    v_payload := v_payload || jsonb_build_object('batch_id', NEW.batch_id);
  END IF;

  -- net.http_post signature: (url, body jsonb, params jsonb, headers jsonb, timeout_ms)
  PERFORM net.http_post(
    url := v_url || '/functions/v1/send-push-notifications',
    body := v_payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4OTM3NSwiZXhwIjoyMDg4NTY1Mzc1fQ._L0m_C8t0VhV4jgf6W4r0R7x2s9nJvP8fKy3bNzQeAA',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4OTM3NSwiZXhwIjoyMDg4NTY1Mzc1fQ._L0m_C8t0VhV4jgf6W4r0R7x2s9nJvP8fKy3bNzQeAA'
    ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[push_trigger] %', SQLERRM;
  RETURN NEW;
END;
$$;
