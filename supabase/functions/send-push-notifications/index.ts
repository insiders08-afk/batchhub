import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── VAPID helper (Deno-native crypto) ───────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array(raw.split("").map((c) => c.charCodeAt(0)));
}

async function buildVapidJWT(
  audience: string,
  subject: string,
  privateKeyB64: string
): Promise<string> {
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject,
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const keyData = base64UrlDecode(privateKeyB64);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    enc.encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth_key: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<Response> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await buildVapidJWT(audience, vapidSubject, vapidPrivateKey);

  const headers: Record<string, string> = {
    "Content-Type": "application/octet-stream",
    TTL: "86400",
    Authorization: `vapid t=${jwt},k=${vapidPublicKey}`,
    Urgency: "normal",
  };

  // Encrypt the payload using Web Push encryption (RFC 8291 / RFC 8188)
  // For simplicity, send unencrypted if the payload is small and browser supports it
  // Full RFC 8291 encryption:
  const enc = new TextEncoder();
  const plaintext = enc.encode(payload);

  // Import recipient's public key (p256dh)
  const recipientPublicKey = await crypto.subtle.importKey(
    "raw",
    base64UrlDecode(subscription.p256dh),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Generate sender ephemeral key pair
  const senderKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: recipientPublicKey },
    senderKeyPair.privateKey,
    256
  );

  // Export sender public key
  const senderPublicKeyRaw = await crypto.subtle.exportKey("raw", senderKeyPair.publicKey);

  // Auth secret (from subscription)
  const authSecret = base64UrlDecode(subscription.auth_key);

  // HKDF to derive content encryption key and nonce (RFC 8291)
  const hkdfSalt = crypto.getRandomValues(new Uint8Array(16));

  const ikm = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, ["deriveBits"]);

  // PRK
  const prk = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: authSecret, info: new Uint8Array(0) },
    ikm,
    256
  );

  const prkKey = await crypto.subtle.importKey("raw", prk, "HKDF", false, ["deriveBits"]);

  // Info for content encryption key
  const keyInfoArr = [
    new Uint8Array([0x43, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x2d, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x3a, 0x20, 0x61, 0x65, 0x73, 0x31, 0x32, 0x38, 0x67, 0x63, 0x6d, 0x00]), // "Content-Encryption: aes128gcm\0"
    new Uint8Array([0x00, 0x00, 0x00, 0x41]), new Uint8Array(senderPublicKeyRaw),
    new Uint8Array([0x00, 0x00, 0x00, 0x41]), new Uint8Array(base64UrlDecode(subscription.p256dh)),
    new Uint8Array([0x01]),
  ];
  const keyInfo = new Uint8Array(keyInfoArr.reduce((acc, a) => acc + a.length, 0));
  let offset = 0;
  for (const a of keyInfoArr) { keyInfo.set(a, offset); offset += a.length; }

  const contentKeyBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: hkdfSalt, info: keyInfo },
    prkKey,
    128
  );
  const contentKey = await crypto.subtle.importKey("raw", contentKeyBits, "AES-GCM", false, ["encrypt"]);

  // Nonce info
  const nonceInfoArr = [
    new Uint8Array([0x43, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x2d, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x3a, 0x20, 0x61, 0x65, 0x73, 0x31, 0x32, 0x38, 0x67, 0x63, 0x6d, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x41]), new Uint8Array(senderPublicKeyRaw),
    new Uint8Array([0x00, 0x00, 0x00, 0x41]), new Uint8Array(base64UrlDecode(subscription.p256dh)),
    new Uint8Array([0x00, 0x01]),
  ];
  const nonceInfo = new Uint8Array(nonceInfoArr.reduce((acc, a) => acc + a.length, 0));
  offset = 0;
  for (const a of nonceInfoArr) { nonceInfo.set(a, offset); offset += a.length; }

  const nonceBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: hkdfSalt, info: nonceInfo },
    prkKey,
    96
  );
  const nonce = new Uint8Array(nonceBits);

  // Pad + encrypt
  const paddedLength = plaintext.length + 2 + 0; // no padding extra
  const padded = new Uint8Array(paddedLength);
  padded.set(plaintext);
  padded[plaintext.length] = 2; // delimiter

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, contentKey, padded);

  // Build RFC 8188 body: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const senderPubKeyBytes = new Uint8Array(senderPublicKeyRaw);
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);

  const body = new Uint8Array(16 + 4 + 1 + 65 + ciphertext.byteLength);
  body.set(hkdfSalt, 0);
  body.set(rs, 16);
  body[20] = 65;
  body.set(senderPubKeyBytes, 21);
  body.set(new Uint8Array(ciphertext), 86);

  headers["Content-Encoding"] = "aes128gcm";
  headers["Content-Length"] = body.byteLength.toString();

  return fetch(subscription.endpoint, {
    method: "POST",
    headers,
    body,
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

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

    const { institute_code, title, body: bodyText, url } = await req.json();
    if (!institute_code || !title) {
      return new Response(
        JSON.stringify({ error: "institute_code and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch all push subscriptions for this institute
    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("institute_code", institute_code);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscribers" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title,
      body: bodyText || "",
      url: url || "/student/announcements",
      icon: "/icons/pwa-192x192.png",
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        sendWebPush(
          sub,
          payload,
          vapidPublicKey,
          vapidPrivateKey,
          "mailto:admin@batchhub.app"
        )
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

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
