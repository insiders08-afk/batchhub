
## Two problems to solve

### Problem 1: Session lost when PWA is closed and reopened
The Supabase client is already configured with `persistSession: true` and `storage: localStorage` — this is correct. The real issue is in `DashboardLayout.tsx`: the auth check uses `supabase.auth.getUser()` which makes a network call. If the token is expired or the network is slow on cold start, it redirects to login before the session can refresh. The fix is to use `onAuthStateChange` + `getSession()` (local cache, instant) instead of just `getUser()` (network call). This way the app reads the locally stored session immediately and navigates correctly without asking for login again.

### Problem 2: Browser Push Notifications via Web Push API
When `notify_push = true` on a new announcement, teachers and students should receive a native browser push notification even when the app is closed. This requires:

1. **VAPID keys** — generated and stored as secrets (we already have `LOVABLE_API_KEY` etc., we'll generate VAPID keys via an edge function or use a fixed key pair)
2. **Service Worker** — handles `push` events and shows `showNotification()`
3. **Frontend permission + subscription** — ask user for notification permission, subscribe to push, save the subscription endpoint to database
4. **Edge function** — triggered after an announcement with `notify_push=true` is inserted, fetches all subscriptions for the institute, sends push to each via Web Push protocol
5. **Database table** — `push_subscriptions` to store device endpoints per user

## Plan

### Step A — Fix PWA session persistence (1 file change)
- In `DashboardLayout.tsx`, replace `getUser()` with `getSession()` for the auth guard, which reads from localStorage instantly without a network round-trip. Also add an `onAuthStateChange` listener as a safety net that redirects to login only on `SIGNED_OUT` events.

### Step B — Database: push_subscriptions table
- New migration: `push_subscriptions` table with columns: `id`, `user_id`, `institute_code`, `endpoint` (text), `p256dh` (text), `auth_key` (text), `created_at`
- RLS: users can insert/delete their own subscriptions; no read policy for others

### Step C — VAPID key generation + secret storage
- Generate a VAPID key pair via a one-time edge function call
- Store `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` as secrets

### Step D — Service Worker push handler
- Add push event listener to a custom service worker file `public/sw.js`
- Since vite-plugin-pwa uses Workbox, we use the `additionalManifestEntries` + `injectManifest` strategy OR add a `importScripts` in `vite.config.ts` with `additionalManifestEntries` pointing to a custom sw addition

The cleanest approach: use `strategies: 'injectManifest'` with a custom `src/sw.ts` that handles both Workbox caching AND push events.

### Step E — Frontend: permission + subscription hook
- New hook `src/hooks/use-push-notifications.ts`
- On first load inside logged-in dashboards: request Notification permission → subscribe via `serviceWorkerRegistration.pushManager.subscribe()` with VAPID public key → save endpoint to `push_subscriptions` table

### Step F — Edge function: send push on announcement
- `supabase/functions/send-push-notifications/index.ts`
- Listens via HTTP POST (called from a DB webhook, or we poll after insert) — simplest: call from frontend after posting announcement with `notify_push=true`
- Fetches all `push_subscriptions` for the institute
- Sends Web Push using the `web-push` protocol (manual VAPID signing in Deno since `web-push` npm package isn't available natively in Deno — we use the `std/crypto` approach)

### Files to create/edit
```
NEW  supabase/migrations/...push_subscriptions.sql
NEW  src/hooks/use-push-notifications.ts        (permission + subscribe + save)
NEW  public/sw-push.js                          (push event handler — imported by service worker)
EDIT vite.config.ts                             (injectManifest strategy + custom sw)
NEW  src/sw.ts                                  (custom service worker entry)
EDIT src/components/DashboardLayout.tsx         (fix session persistence + add push hook)
NEW  supabase/functions/send-push-notifications/index.ts
EDIT src/pages/AdminAnnouncements.tsx           (call edge fn after posting with notify_push)
```

### Session Fix Detail
```typescript
// Replace this:
const { data: { user } } = await supabase.auth.getUser();
if (!user) { navigate(...); return; }

// With this:
const { data: { session } } = await supabase.auth.getSession();
if (!session) { navigate(...); return; }
const user = session.user;
```
And add a listener:
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') navigate(roleAuthPaths[role], { replace: true });
});
return () => subscription.unsubscribe();
```

### Push Notification Flow
```
Admin posts announcement (notify_push=true)
  → AdminAnnouncements.tsx calls edge function with institute_code + title + body
  → Edge function queries push_subscriptions WHERE institute_code = X
  → For each subscription, sends Web Push (VAPID signed) HTTP request to endpoint
  → Browser/OS delivers notification to device even if app is closed
  → Service worker push event shows showNotification()
  → User taps → opens /student/announcements or /teacher/announcements
```

### Credit estimate
This is the most complex feature in the project. Expect ~3-5 credits total:
- Migration + edge function setup: ~1 credit
- Service worker + vite config changes: ~1 credit  
- Hook + dashboard integration + announcement page wiring: ~1-2 credits
- Testing/fixes: ~1 credit

I'll implement all of it in one go to minimize credit waste.
