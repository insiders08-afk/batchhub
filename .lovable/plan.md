
## The Real Problem

When the PWA launches from the home screen, the browser always opens at `start_url = "/"`, which renders `Index.tsx` — the public landing page. `Index.tsx` has zero auth awareness. It just renders the marketing page regardless of whether a logged-in session exists in `localStorage`. The user has to manually tap "Login" and navigate back.

The `DashboardLayout` fix was correct but it only protects dashboard routes — it can't help because the user never reaches a dashboard route in the first place.

## Fix: Add session-check redirect to Index.tsx

On mount, `Index.tsx` should call `supabase.auth.getSession()` (instant, reads from `localStorage`, no network). If a session exists, look up the user's profile role and redirect them straight to their dashboard. If no session, render the landing page normally.

This is a one-file fix.

### Logic flow
```
PWA opens → "/" → Index.tsx mounts
  → getSession() [instant, localStorage]
    → session found?
        YES → fetch profile.role → navigate to /admin, /teacher, /student, or /parent
        NO  → render landing page as normal
```

### Role → route mapping
```
admin    → /admin
teacher  → /teacher
student  → /student
parent   → /parent
superadmin → /superadmin
owner    → /owner
```

### What changes
- `src/pages/Index.tsx` — add a `useEffect` that calls `getSession()` on mount. If session exists, fetch the `profiles` table for `role`, then `navigate(roleToPath[role], { replace: true })`. While checking, show nothing (or a tiny spinner) to avoid a flash of the landing page. If no session or any error, just render normally.

### What does NOT change
- `DashboardLayout.tsx` — the existing `getSession()` + `onAuthStateChange` fix stays as-is. It's still needed to protect dashboard routes from direct URL access.
- No new files, no migrations, no edge functions needed.

### Why this is safe
- `getSession()` reads `localStorage` — it is synchronous-equivalent (resolves in <5ms). No risk of flashing wrong content for long.
- If the token is expired, Supabase auto-refreshes it silently. If refresh fails (offline start, revoked token), `session` will be `null` and the landing page renders normally — no broken state.
- `replace: true` means the back button won't loop back to landing after redirect.

### Files to edit
```
EDIT src/pages/Index.tsx   — add useEffect auth-redirect (10 lines added at top of component)
```
