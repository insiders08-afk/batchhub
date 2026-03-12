
-- Update the push trigger to use the service role key from app settings
-- We store the service role key as a Postgres config setting
CREATE OR REPLACE FUNCTION public.trigger_announcement_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_payload JSONB;
  v_service_key TEXT;
BEGIN
  IF NEW.notify_push IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  v_url := 'https://bomcmutmilixrzanktvu.supabase.co';
  
  -- Get service role key stored as a Postgres setting (set via migration below)
  v_service_key := current_setting('app.service_role_key', true);

  v_payload := jsonb_build_object(
    'institute_code', NEW.institute_code,
    'title', NEW.title,
    'body', NEW.content,
    'url', '/student/announcements'
  );

  IF NEW.batch_id IS NOT NULL THEN
    v_payload := v_payload || jsonb_build_object('batch_id', NEW.batch_id);
  END IF;

  IF v_service_key IS NOT NULL AND v_service_key != '' THEN
    PERFORM extensions.http_post(
      url := v_url || '/functions/v1/send-push-notifications',
      body := v_payload::text,
      content_type := 'application/json',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key,
        'apikey', v_service_key
      )
    );
  ELSE
    -- Fallback: call without auth (the edge function has verify_jwt=false for this reason)
    PERFORM extensions.http_post(
      url := v_url || '/functions/v1/send-push-notifications',
      body := v_payload::text,
      content_type := 'application/json',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4OTM3NSwiZXhwIjoyMDg4NTY1Mzc1fQ._L0m_C8t0VhV4jgf6W4r0R7x2s9nJvP8fKy3bNzQeAA',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4OTM3NSwiZXhwIjoyMDg4NTY1Mzc1fQ._L0m_C8t0VhV4jgf6W4r0R7x2s9nJvP8fKy3bNzQeAA'
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[push_trigger] %', SQLERRM;
  RETURN NEW;
END;
$$;
