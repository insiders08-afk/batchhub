
## The Real Problem — Diagnosed

### Finding 1: Missing `user_roles` rows for approved users (CRITICAL)

From the live DB query:
- `saman@gmail.com` — approved teacher, `profiles.status = approved`, **NO `user_roles` row**
- `akib1104@gmail.com` — approved teacher, **NO `user_roles` row**
- `shiv1104@gmail.com` — approved student, **NO `user_roles` row**

Because `get_my_institute_code()` reads ONLY from `user_roles`, these users get `NULL` → every RLS check that uses `get_my_institute_code()` fails for them. This is why:
- Creating a batch as these users → 403 (even though Waseem the admin can create fine)
- Teacher dashboard shows no batches
- Student dashboard shows nothing

The `AdminApprovals.tsx` approval silently swallows the `user_roles` INSERT error (line 139: `console.warn` instead of throwing). Previous RLS bugs caused the insert to fail but the toast showed "Approved!" anyway — so users appear approved in `profiles` but have no `user_roles` row.

### Finding 2: The RLS policies ARE correct and PERMISSIVE

The live DB query confirms all policies are PERMISSIVE. The "new row violates RLS on batches" error is thrown when a user WITHOUT a `user_roles` row tries to insert — because `get_my_institute_code()` returns NULL for them and `NULL = 'MISS077'` is false.

### Finding 3: AdminApprovals error swallowing must be fixed

The current code does:
```
if (roleError && !roleError.message?.includes("duplicate") && !roleError.code?.includes("23505")) {
  console.warn("user_roles insert note:", roleError.message)  // ← silently ignored!
}
```
This means RLS failures on `user_roles` INSERT get swallowed. Must throw for non-duplicate errors.

---

## Fix Plan

### Step 1: Migration — Backfill missing `user_roles` rows

For every approved profile that has NO corresponding `user_roles` row, insert it:

```sql
INSERT INTO public.user_roles (user_id, role, institute_code)
SELECT p.user_id, p.role::public.app_role, p.institute_code
FROM public.profiles p
WHERE p.status = 'approved'
  AND p.institute_code IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.user_id AND ur.role = p.role::public.app_role
  );
```

This is a DATA fix (not schema), so it uses the Supabase insert/data tool, not a migration.

### Step 2: Fix `AdminApprovals.tsx` — stop swallowing `user_roles` errors

Change the silent `console.warn` to actually surface the error so the admin knows when approval partially fails. Also add a retry mechanism: if `user_roles` INSERT fails with non-duplicate error, show a specific toast.

### Step 3: Add a "Fix Missing Roles" auto-repair in AdminApprovals

When the page loads, check if any approved profiles in the institute are missing `user_roles` rows. If so, silently backfill them. This prevents the problem from recurring.

---

## Files to change

| File | Change |
|---|---|
| DB data fix (migration tool) | INSERT missing `user_roles` for Saman, Akib, Shiv |
| `src/pages/AdminApprovals.tsx` | Stop swallowing `user_roles` errors; add auto-repair on load |

That's it — 2 targeted changes. The RLS policies themselves are fine. The batch creation code is fine. The only issue is missing data in `user_roles` for already-approved users.
