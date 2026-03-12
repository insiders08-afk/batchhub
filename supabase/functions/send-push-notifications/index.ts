/**
 * send-push-notifications
 * Pure Deno WebCrypto VAPID implementation — no npm:web-push dependency.
 * Implements RFC 8292 (VAPID) + RFC 8291 (message encryption) from scratch
 * using the native SubtleCrypto API available in Deno edge runtime.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Base64url helpers ────────────────────────────────────────────────────────
function b64uEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64uDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const result = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) result[i] = raw.charCodeAt(i);
  return result;
}

// Standard base64 (with padding) decode — for p256dh / auth keys from browser
function b64Decode(str: string): Uint8Array {
  // Handle both regular and url-safe base64
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob(s + padding);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ─── HKDF ─────────────────────────────────────────────────────────────────────
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", ikm, { name: "HKDF" }, false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    keyMaterial,
    length * 8
  );
  return new Uint8Array(bits);
}

// ─── VAPID JWT sign (ES256, native WebCrypto) ─────────────────────────────────
async function signVapidJwt(
  audience: string,
  subject: string,
  vapidPublicKeyB64u: string,
  vapidPrivateKeyB64u: string
): Promise<{ authorization: string; vapidPublicKey: string }> {
  // Import private key — decode from base64url, strip any PKCS8 header
  let privateKeyBytes = b64uDecode(vapidPrivateKeyB64u);
  if (privateKeyBytes.length > 32) {
    // Strip PKCS8 header — raw P-256 private key is always 32 bytes
    privateKeyBytes = privateKeyBytes.slice(privateKeyBytes.length - 32);
  }

  // Build PKCS8 DER wrapper for P-256 EC private key dynamically
  // ECPrivateKey = SEQUENCE { version INTEGER(1), privateKey OCTET STRING(32 bytes) }
  // ecPrivateKeyDer = 0x30 0x25 0x02 0x01 0x01 0x04 0x20 <32 bytes>
  const ecPrivDer = new Uint8Array(39);
  ecPrivDer[0] = 0x30; ecPrivDer[1] = 0x25; // SEQUENCE 37
  ecPrivDer[2] = 0x02; ecPrivDer[3] = 0x01; ecPrivDer[4] = 0x01; // version = 1
  ecPrivDer[5] = 0x04; ecPrivDer[6] = 0x20; // OCTET STRING 32
  ecPrivDer.set(privateKeyBytes, 7);

  // AlgorithmIdentifier = SEQUENCE { OID id-ecPublicKey, OID secp256r1 }
  const algId = new Uint8Array([
    0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // ecPublicKey
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // P-256
  ]);

  // PrivateKeyInfo = SEQUENCE { version INTEGER(0), algId, OCTET STRING { ecPrivDer } }
  const octetString = new Uint8Array(2 + ecPrivDer.length);
  octetString[0] = 0x04; octetString[1] = ecPrivDer.length;
  octetString.set(ecPrivDer, 2);

  const innerLen = 3 + algId.length + octetString.length; // version(3) + algId + octetString
  const pkcs8 = new Uint8Array(4 + innerLen);
  pkcs8[0] = 0x30;
  pkcs8[1] = 0x82; pkcs8[2] = (innerLen >> 8) & 0xff; pkcs8[3] = innerLen & 0xff;
  // version INTEGER(0)
  pkcs8[4] = 0x02; pkcs8[5] = 0x01; pkcs8[6] = 0x00;
  pkcs8.set(algId, 7);
  pkcs8.set(octetString, 7 + algId.length);

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const header = { typ: "JWT", alg: "ES256" };
  const claims = {
    aud: audience,
    exp: now + 12 * 3600, // 12 hour expiry
    sub: subject,
  };

  const headerB64 = b64uEncode(new TextEncoder().encode(JSON.stringify(header)));
  const claimsB64 = b64uEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const signingInput = `${headerB64}.${claimsB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${b64uEncode(new Uint8Array(signature))}`;

  return {
    authorization: `vapid t=${jwt},k=${vapidPublicKeyB64u}`,
    vapidPublicKey: vapidPublicKeyB64u,
  };
}

// ─── RFC 8291 Web Push message encryption ────────────────────────────────────
async function encryptPayload(
  userPublicKeyB64: string,  // p256dh from subscription (standard base64)
  authSecretB64: string,     // auth from subscription (standard base64)
  plaintext: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const userPublicKeyBytes = b64Decode(userPublicKeyB64);  // 65 bytes uncompressed
  const authSecret = b64Decode(authSecretB64);              // 16 bytes

  // Generate ephemeral key pair
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Export server (ephemeral) public key
  const serverPublicKeyRaw = await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey);
  const serverPublicKey = new Uint8Array(serverPublicKeyRaw);

  // Import user public key
  const userPublicCryptoKey = await crypto.subtle.importKey(
    "raw",
    userPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: userPublicCryptoKey },
    ephemeralKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // RFC 8291 key derivation
  // PRK_key = HKDF(auth_secret, ecdh_secret, "WebPush: info\0" || receiver_pub || sender_pub, 32)
  const keyInfo = concat(
    new TextEncoder().encode("WebPush: info\0"),
    userPublicKeyBytes,
    serverPublicKey
  );
  const prkKey = await hkdf(authSecret, sharedSecret, keyInfo, 32);

  // IKM = HKDF(salt, PRK_key, "Content-Encoding: aes128gcm\0", 16) — content encryption key
  // Nonce = HKDF(salt, PRK_key, "Content-Encoding: nonce\0", 12)
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");

  const cek = await hkdf(salt, prkKey, cekInfo, 16);
  const nonce = await hkdf(salt, prkKey, nonceInfo, 12);

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);

  // Pad plaintext: add \x02 delimiter byte
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const paddedPlaintext = new Uint8Array(plaintextBytes.length + 1);
  paddedPlaintext.set(plaintextBytes);
  paddedPlaintext[plaintextBytes.length] = 2; // record delimiter

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPlaintext
  );

  return { ciphertext: new Uint8Array(encrypted), salt, serverPublicKey };
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function uint32BE(n: number): Uint8Array {
  return new Uint8Array([(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
}

// ─── Build aes128gcm encrypted push body (RFC 8188) ──────────────────────────
async function buildPushBody(
  p256dh: string,
  authKey: string,
  payloadStr: string,
  serverPublicKeyB64u: string
): Promise<Uint8Array> {
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(p256dh, authKey, payloadStr);

  // aes128gcm content-coding record header:
  // salt (16) | rs (4, big-endian uint32) | keyid_len (1) | keyid (65)
  const rs = 4096; // record size
  const header = concat(
    salt,
    uint32BE(rs),
    new Uint8Array([serverPublicKey.length]),
    serverPublicKey
  );

  return concat(header, ciphertext);
}

// ─── Send a single web push notification ─────────────────────────────────────
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  authKey: string,
  payload: string,
  vapidPublicKeyB64u: string,
  vapidPrivateKeyB64u: string,
  subject: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  // Audience = origin of endpoint URL
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const { authorization } = await signVapidJwt(audience, subject, vapidPublicKeyB64u, vapidPrivateKeyB64u);
  const body = await buildPushBody(p256dh, authKey, payload, vapidPublicKeyB64u);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "Authorization": authorization,
      "TTL": "86400",
      "Urgency": "normal",
    },
    body,
  });

  if (response.ok || response.status === 201) {
    return { ok: true, status: response.status };
  }
  const errText = await response.text().catch(() => "");
  return { ok: false, status: response.status, error: errText };
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

    const bodyJson = await req.json();
    const {
      institute_code,
      batch_id,
      title,
      body: bodyText,
      url,
      target_user_ids,
    } = bodyJson;

    if (!institute_code || !title) {
      return new Response(
        JSON.stringify({ error: "institute_code and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);
    let userIds: string[] | null = null;

    // Rule engine: resolve target users
    if (target_user_ids && Array.isArray(target_user_ids) && target_user_ids.length > 0) {
      userIds = target_user_ids;
    } else if (batch_id) {
      const { data: enrollments } = await admin
        .from("students_batches")
        .select("student_id")
        .eq("batch_id", batch_id)
        .eq("institute_code", institute_code);
      userIds = (enrollments || []).map((e: { student_id: string }) => e.student_id);
    }

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

    const { data: subs, error: subsError } = await query;
    if (subsError) throw subsError;

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscribers matched" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payloadStr = JSON.stringify({
      title,
      body: bodyText || "",
      url: url || "/",
      icon: "/icons/pwa-192x192.png",
      badge: "/icons/pwa-192x192.png",
    });

    const results = await Promise.allSettled(
      subs.map((sub: { endpoint: string; p256dh: string; auth_key: string }) =>
        sendWebPush(
          sub.endpoint,
          sub.p256dh,
          sub.auth_key,
          payloadStr,
          vapidPublicKey,
          vapidPrivateKey,
          "mailto:admin@batchhub.app"
        )
      )
    );

    let sent = 0;
    let failed = 0;
    const failures: Array<{ status?: number; error?: string }> = [];

    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value.ok) {
        sent++;
      } else {
        failed++;
        const err = r.status === "fulfilled" ? r.value : { error: String(r.reason) };
        console.warn(`[push] Sub ${i} failed:`, JSON.stringify(err));
        failures.push(err);
      }
    });

    console.log(`[push] Done: ${sent} sent, ${failed} failed out of ${results.length}`);

    return new Response(
      JSON.stringify({ sent, failed, total: results.length, failures }),
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
