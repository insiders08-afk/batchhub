
## What's needed

The user wants:
1. **City field on the Super Admin login page** — so city-level super admins can log in identifying their city
2. **`city` column in `user_roles`** — so each super_admin row knows which city they manage
3. **`city` column in `institutes`** — so when an admin registers their institute, they pick a city, and it gets assigned to the right city-level super admin
4. **Create a `SuperAdminAuth.tsx` login page** at `/auth/superadmin` (email + password + city display) — this was planned but never built
5. **Seed the user's `super_admin` role** — BUT the DB is currently empty (no accounts). So the flow is:
   - User registers at `/auth/admin` → gets a user ID
   - I seed their `user_id` as `super_admin` for city = "Bareilly" via a migration
   - I also delete the dummy institute row they created

Since the database is empty, the user hasn't registered yet. The plan is:

### Step 1: Database changes (migration)
- Add `city` column to `user_roles` (nullable text — super_admins have a city, regular roles don't need it)
- Add `city` column to `institutes` (nullable text — institute registration will include city)

### Step 2: Create `src/pages/auth/SuperAdminAuth.tsx`
A clean, hidden login page at `/auth/superadmin`:
- **Only email + password** — no registration form
- On successful login → checks `user_roles` for `super_admin` role
- Reads the `city` from their `user_roles` row
- Displays their city scope in the dashboard header (e.g., "Bareilly Region")
- If not super_admin → shows "Unauthorized" error, signs them out
- Redirects to `/superadmin` on success

### Step 3: Update `SuperAdminDashboard.tsx`
- Read the super_admin's `city` from their `user_roles` row
- Show it in the header: "Institute Control Panel — Bareilly"
- **Filter institutes by city** — a city-level super admin only sees institutes in their city
- Platform-wide super admin (city = null or 'all') sees everything

### Step 4: Add `city` field to `AdminAuth.tsx` registration form
- When an institute admin registers, they pick their city
- This city is stored in `institutes.city`
- When a city-level super admin logs in, they see only institutes matching their city

### Step 5: Update `App.tsx`
- Add `/auth/superadmin` route

### Step 6: Seed the user
After the user registers at `/auth/admin`:
- I query `profiles` to find their `user_id`
- Run a data insert to `user_roles`: `{ user_id: <their_id>, role: 'super_admin', city: 'Bareilly' }`
- Delete the dummy `institutes` row they created
- Update their `profiles` status to 'approved' so there's no pending record

### File changes summary:
| File | Change |
|---|---|
| Migration | Add `city` to `user_roles` and `institutes` |
| `src/pages/auth/SuperAdminAuth.tsx` | New: email+password+city login, role check |
| `src/pages/SuperAdminDashboard.tsx` | Show city in header; filter institutes by city |
| `src/pages/auth/AdminAuth.tsx` | Add city dropdown to registration form |
| `src/App.tsx` | Add `/auth/superadmin` route |

### The exact flow for you (the owner):
1. I build all this now
2. You go to `/auth/admin` and register with any dummy institute details (put Bareilly as city)
3. Tell me "done" — I look up your user_id from the DB and seed your `super_admin` role for Bareilly, then clean up the dummy institute row
4. You go to `/auth/superadmin`, enter your email + password → land on your control panel showing Bareilly institutes
