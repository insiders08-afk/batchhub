
## Complete Data Audit — What Exists

**KEEP (kjais1104@gmail.com, user_id: 5dc7ea0f-...):**
- `profiles` row: Super Admin (super_admin, status: approved)
- `user_roles` rows: super_admin (Bareilly) + app_owner (India) — both on same user_id

**DELETE — Institute MISS077 (Mission, Bareilly, owner: Waseem):**

| Table | Rows to delete |
|---|---|
| `institutes` | 1 row (MISS077 — Mission institute) |
| `profiles` | 6 rows: Waseem (admin), Akib, Saman, Lavi, Kavi (teachers), Shiv (student) |
| `user_roles` | 6 rows: same 6 users' role entries |
| `pending_requests` | 5 rows: Akib, Saman, Lavi, Kavi, Shiv approval records |
| `batches` | 1 row: "King" batch |
| `batch_teacher_requests` | 1 row: King→Saman accepted request |
| `batch_applications` | 1 row: Shiv's application to King batch |
| `students_batches` | 1 row: Shiv enrolled in King batch |

**Tables already empty for MISS077:** attendance (0), announcements (0), fees (0), test_scores (0), homeworks (0), batch_messages (0)

**Auth users** (in `auth.users`): The 6 test users (Waseem, Akib, Saman, Lavi, Kavi, Shiv) need to be deleted from auth too. This requires an edge function since auth deletion requires the service role key.

---

## Plan

### Step 1: Delete all MISS077 data via SQL (data operations — no migration needed)

Run these DELETE statements in order (child → parent to avoid FK issues):

```sql
-- 1. students_batches
DELETE FROM public.students_batches WHERE institute_code = 'MISS077';

-- 2. batch_applications
DELETE FROM public.batch_applications WHERE institute_code = 'MISS077';

-- 3. batch_teacher_requests
DELETE FROM public.batch_teacher_requests WHERE institute_code = 'MISS077';

-- 4. batches
DELETE FROM public.batches WHERE institute_code = 'MISS077';

-- 5. pending_requests
DELETE FROM public.pending_requests WHERE institute_code = 'MISS077';

-- 6. user_roles for MISS077 users
DELETE FROM public.user_roles WHERE institute_code = 'MISS077';

-- 7. profiles for MISS077 users
DELETE FROM public.profiles WHERE institute_code = 'MISS077';

-- 8. institute record itself
DELETE FROM public.institutes WHERE institute_code = 'MISS077';
```

### Step 2: Delete auth users via existing edge function infrastructure

Use the `fix-superadmin` edge function pattern to build a one-time `cleanup-test-users` edge function that calls `supabase.auth.admin.deleteUser()` for each of the 6 user IDs:
- `17ef1e93` (Waseem/admin)
- `6f6d9183` (Akib)
- `77c0aaf4` (Saman)
- `53d519e2` (Lavi)
- `87cc7d62` (Kavi)
- `cdf047e4` (Shiv)

This edge function is called once and then can be deleted.

---

## Files to change

| Action | Detail |
|---|---|
| Run data DELETE SQL (via insert tool) | 8 DELETE statements covering all MISS077 data |
| Create + deploy `supabase/functions/cleanup-test-users/index.ts` | Deletes 6 auth users using service role |
| Call the edge function once | Cleans auth.users entries |
| Delete the edge function file | Cleanup after use |

After this, the database will have only:
- `kjais1104@gmail.com` as super_admin + app_owner
- Zero test institute data
- Clean slate for real onboarding
