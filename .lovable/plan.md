
## What the user described — full platform hierarchy

```
APP OWNER (you — kjais1104@gmail.com)
  └── Approves/rejects City Super Admin applications
  └── Hidden login at a secret URL only you know
  └── Separate dashboard showing all super admin applications + platform stats

CITY SUPER ADMIN (one per city, e.g. Bareilly)
  └── Applied via landing page form (name, email, phone, position, city, face photo)
  └── Approved by the App Owner
  └── Approves/rejects institute registrations in their city
  └── Login stays at /auth/superadmin

INSTITUTE ADMIN (one per institute)
  └── Registers at /auth/admin with city
  └── Request goes to the city's super admin for approval
  └── Institute goes live after super admin approves
  └── Manages teachers, students, parents within their institute

TEACHERS / STUDENTS / PARENTS
  └── Belong to one institute only
  └── Login via /auth/teacher, /auth/student, /auth/parent
```

---

## "Email confirmation disabled" — clarification for the user

This was a technical setting I turned on so that when institute admins, teachers, students, and parents sign up, they don't get stuck waiting for an email confirmation link. They can log in immediately after registering. It's fine for this type of app — coaching institutes don't want users to get blocked by email verification steps. Your account was already fixed separately.

---

## What needs to be built

### 1. New database additions
- Add `app_owner` to the `app_role` enum
- Create a `super_admin_applications` table:
  - id, full_name, email, phone, position, city, facial_image_url, status (pending/approved/rejected), notes, created_at
- Add a storage bucket for facial images of super admin applicants
- Seed your user_id as `app_owner` role (you already have `super_admin` for Bareilly — keep that, add a separate `app_owner` role entry)

### 2. App Owner login + dashboard (brand new)
- Hidden login at `/auth/owner` — email + password, verifies `app_owner` role
- Dashboard at `/owner`:
  - Shows ALL super admin applications (pending/approved/rejected)
  - Can view applicant's face photo, name, phone, city, position
  - Approve → inserts `super_admin` role with that city into `user_roles`, sends a notification
  - Reject → marks application rejected
  - Also shows platform-wide stats (total institutes, total super admins, total cities)
- Footer gets a small, very hidden "Owner Access" link (or you can bookmark `/auth/owner` directly — no link needed)

### 3. Super admin application form (update landing page)
- The existing "City Partner Login" footer link splits into two things:
  - "Apply as City Partner" → `/apply/city-partner` — a form with: Full Name, Email, Phone, Position/Role, City, Facial Photo upload
  - "City Partner Login" → `/auth/superadmin` — existing login for already-approved super admins
- The landing page "scroll down" section gets a card section: "Become a City Partner — Manage all institutes in your city"

### 4. Update /auth/superadmin login
The current page is just email+password. The person applying is a separate flow. The login page stays clean — once you (the owner) approve their application, they receive notification and log in with the email/password they set in the application form.

### 5. Update institute approval flow (the pending screen)
Current: "Request pending — platform team reviewing"
New text should clarify the two-stage process doesn't need to be exposed in the UI. Keep it simple: "Your city's Lamba partner will review your institute."

### 6. Footer restructure on landing page
Currently has: Privacy | Terms | Contact | City Partner Login
New: Privacy | Terms | Contact | City Partner Login | Become a City Partner

---

## Files to create/edit

| File | What changes |
|---|---|
| Migration | Add `app_owner` to enum; create `super_admin_applications` table; storage bucket for face photos |
| Data seed | Insert `app_owner` role for your user_id (5dc7ea0f...) |
| `src/pages/auth/OwnerAuth.tsx` | NEW — hidden owner login page |
| `src/pages/OwnerDashboard.tsx` | NEW — app owner dashboard with super admin application management |
| `src/pages/CityPartnerApply.tsx` | NEW — public application form (name, email, phone, position, city, face photo) |
| `src/pages/Index.tsx` | Update footer + add "Become a City Partner" section near footer |
| `src/App.tsx` | Add routes: /auth/owner, /owner, /apply/city-partner |

---

## Your login situation right now

Your account (`kjais1104@gmail.com`, password `Krishna@1104()`) is confirmed. The edge function just ran successfully. You should be able to log in at `/auth/superadmin` right now for the Bareilly dashboard. After this plan is built, you'll also have `/auth/owner` for your App Owner control panel.

---

## Note on "email confirmation disabled"

This is a global setting — it means NO user (admin, teacher, student, parent) will need to click a link in their email to activate their account. They sign up → they can log in immediately. This is the right behavior for a coaching app. It's not a security risk here since the admin approval workflow already controls who can access what.
