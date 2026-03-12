
-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY HARDENING: Rate limits table + fixed trigger
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Rate limits table (no expression index) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id            uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier    text        NOT NULL,
  action        text        NOT NULL,
  request_count integer     NOT NULL DEFAULT 1,
  window_start  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Simple composite index (no expression, avoids IMMUTABLE requirement)
CREATE INDEX IF NOT EXISTS rate_limits_identifier_action_idx
  ON public.rate_limits (identifier, action, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits"
  ON public.rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── 2. Enable vault extension ──────────────────────────────────────────────
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS supabase_vault CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Vault extension: %', SQLERRM;
END;
$$;

-- ─── 3. Fix trigger_announcement_push - remove hardcoded service_role key ───
CREATE OR REPLACE FUNCTION public.trigger_announcement_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url             TEXT;
  v_payload         JSONB;
  v_internal_secret TEXT;
  v_anon_key        TEXT;
BEGIN
  IF NEW.notify_push IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Anon key is PUBLIC (already in frontend .env - safe to store here)
  v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNtdXRtaWxpeHJ6YW5rdHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODkzNzUsImV4cCI6MjA4ODU2NTM3NX0.pZxyD2007h-Z4xFeqp005bPHmAg4QeE8rY_lkFDe2f0';

  -- Try to read internal secret from vault
  BEGIN
    SELECT decrypted_secret INTO v_internal_secret
    FROM vault.decrypted_secrets
    WHERE name = 'push_internal_secret'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_internal_secret := NULL;
  END;

  v_url := 'https://bomcmutmilixrzanktvu.supabase.co';

  v_payload := jsonb_build_object(
    'institute_code', NEW.institute_code,
    'title',          NEW.title,
    'body',           NEW.content,
    'url',            '/student/announcements'
  );

  IF NEW.batch_id IS NOT NULL THEN
    v_payload := v_payload || jsonb_build_object('batch_id', NEW.batch_id);
  END IF;

  PERFORM net.http_post(
    url     := v_url || '/functions/v1/send-push-notifications',
    body    := v_payload,
    headers := CASE
      WHEN v_internal_secret IS NOT NULL THEN
        jsonb_build_object(
          'Content-Type',      'application/json',
          'Authorization',     'Bearer ' || v_anon_key,
          'apikey',            v_anon_key,
          'x-internal-secret', v_internal_secret
        )
      ELSE
        jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key,
          'apikey',        v_anon_key
        )
    END,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[push_trigger] %', SQLERRM;
  RETURN NEW;
END;
$$;

-- ─── 4. Ensure trigger is registered ────────────────────────────────────────
DROP TRIGGER IF EXISTS on_announcement_push ON public.announcements;
CREATE TRIGGER on_announcement_push
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_announcement_push();
