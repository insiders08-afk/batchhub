import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Base64url helpers ────────────────────────────────────────────────────────
function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array(raw.split("").map((c) => c.charCodeAt(0)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert PKCS8 private key to raw 32-byte format if needed
    // PKCS8 P-256 keys have a 36-byte header; raw key starts at byte 36
    let rawPrivateKey = vapidPrivateKey;
    try {
      const decoded = base64UrlDecode(vapidPrivateKey);
      if (decoded.length > 32) {
        // Strip PKCS8 header — raw private key is the last 32 bytes
        rawPrivateKey = base64UrlEncode(decoded.slice(decoded.length - 32));
      }
    } catch { /* use as-is */ }

    webpush.setVapidDetails(
      "mailto:admin@batchhub.app",
      vapidPublicKey,
      rawPrivateKey
    );

    const body = await req.json();
    const {
      institute_code,
      batch_id,        // optional — if set, only push to students in that batch
      title,
      body: bodyText,
      url,
      target_user_ids, // optional — explicit list of user_ids to push to (overrides batch_id / institute_code)
    } = body;

    if (!institute_code || !title) {
      return new Response(
        JSON.stringify({ error: "institute_code and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    let userIds: string[] | null = null;

    // Rule engine: resolve which users should receive this push
    if (target_user_ids && Array.isArray(target_user_ids) && target_user_ids.length > 0) {
      // Explicit list provided (e.g. teacher message → batch students only)
      userIds = target_user_ids;
    } else if (batch_id) {
      // Batch-scoped: only enrolled students in that batch
      const { data: enrollments } = await admin
        .from("students_batches")
        .select("student_id")
        .eq("batch_id", batch_id)
        .eq("institute_code", institute_code);
      userIds = (enrollments || []).map((e: { student_id: string }) => e.student_id);
    }
    // else: institute-wide — no userId filter (fetch by institute_code only)

    // Fetch matching push subscriptions
    let query = admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key, user_id")
      .eq("institute_code", institute_code);

    if (userIds !== null) {
      if (userIds.length === 0) {
        return new Response(
          JSON.stringify({ sent: 0, message: "No target users" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      query = query.in("user_id", userIds);
    }

    const { data: subs, error } = await query;
    if (error) throw error;

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscribers matched" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title,
      body: bodyText || "",
      url: url || "/",
      icon: "/icons/pwa-192x192.png",
      badge: "/icons/pwa-192x192.png",
    });

    const results = await Promise.allSettled(
      subs.map((sub: { endpoint: string; p256dh: string; auth_key: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          payload
        )
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    // Log failures for debugging
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`[push] Failed sub ${i}:`, r.reason);
      }
    });

    return new Response(
      JSON.stringify({ sent, failed, total: results.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-push] Error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
