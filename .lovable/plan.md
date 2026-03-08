
## What needs to change

Just **one file**: `src/pages/Index.tsx`

### The change
- **Remove** the `·` dot hidden link from the footer (lines 485-488)
- **Wrap the "Why Lamba" Badge** (line 264) with a `<Link to="/auth/owner">` so clicking that badge navigates to the owner portal

The badge already looks like a button/tag, so it's a natural hidden trigger — only you know what it does. Visitors see it as a section label, not as a login link.

### Footer after the change
```
Privacy | Terms | Contact | City Partner Login | Become a City Partner
```
(dot `·` removed)

### Why Lamba section — the badge becomes a secret link
```jsx
<Link to="/auth/owner">
  <Badge className="mb-4 bg-primary-light text-primary border-primary/20 cursor-pointer">
    Why Lamba
  </Badge>
</Link>
```

---

## Answers to your questions (no code needed)

**What is a database?**
Think of it like an Excel file that lives on the internet, always on, always safe. Your app has tables (like sheets): `profiles`, `institutes`, `batches`, `attendance`, `fees`, etc. Every time an institute registers, a new row is added to the `institutes` table. Every time a student is marked present, a row goes into `attendance`.

**How to see your database (Cloud button)?**
1. Look at the top-right area above your app preview — there's a **Cloud** icon
2. Click it → you'll see **Database**, **Users**, **Storage**, **Edge Functions**
3. Under **Database → Tables** you can see all your tables and browse every row of real data
4. Under **Users** you can see every account that signed up, confirm emails manually, reset passwords

**How to publish/deploy the app?**
1. Click the **Publish** button (top-right globe icon on desktop, or `...` on mobile → Publish)
2. Your app goes live at a free Lovable URL like `yourapp.lovable.app`
3. The database is already live — it works for real users the moment you publish
4. If any institute registers right now, their data actually saves — no extra setup needed

**Custom domain (your own URL like lamba.in)?**
1. Buy a domain from GoDaddy, Namecheap, or Google Domains (costs ~₹800–₹1500/year)
2. In Lovable: click project name (top-left) → Settings → Domains → Connect Domain
3. Enter your domain name, Lovable shows you DNS records to copy
4. Go to your domain registrar, paste those DNS records
5. Wait a few hours → your app runs on your own URL

**Will existing data stay safe when you add new features?**
Yes, 100%. Adding a new column or new table never deletes old data. Old rows just have `null` (empty) for new columns, which is fine. The database grows forward, never backwards.

---

## Files to edit

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Remove `·` dot link from footer; wrap "Why Lamba" badge with Link to /auth/owner |
