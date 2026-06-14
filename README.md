# Μάζωξη πριν τον γάμο — RSVP App

Mobile-first RSVP web app for a bachelor party event. Guests validate their Cyprus mobile number, then submit or update their availability.

**Stack:** React + Vite (frontend on GitHub Pages) · Supabase (PostgreSQL + Edge Functions)

## Architecture

```
Browser (GitHub Pages)
    │
    ├─► validate-phone   ──► Check phone against allowed_guests (server-side only)
    ├─► submit-rsvp      ──► Upsert response in rsvps table
    └─► admin-data       ──► Totals + export (protected by ADMIN_SECRET)

Supabase PostgreSQL
    ├── allowed_guests   (name + phone_normalized) — NOT exposed to frontend
    └── rsvps            (one row per guest, upsert on guest_id)
```

Phone numbers are **never** stored in frontend code. Row Level Security is enabled with no public policies — all DB access goes through Edge Functions using the service role key.

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/) (for local dev/build)
- [Git](https://git-scm.com/)
- Free [Supabase](https://supabase.com/) account
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for deploying Edge Functions)
- GitHub account (for Pages hosting)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Choose a name, password, and region (EU recommended for Cyprus)
3. Wait for the project to finish provisioning

Note your **Project URL** and keys from **Settings → API**:
- `Project URL` → e.g. `https://abcdefgh.supabase.co`
- `anon public` key
- `service_role` key (keep secret — server only)

---

## Step 2: Set Up Database

### Option A: Supabase SQL Editor (easiest)

1. Open **SQL Editor** in the Supabase dashboard
2. Run the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the contents of `supabase/seed.sql` (edit guest names/numbers first!)

### Option B: Supabase CLI

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Then run `supabase/seed.sql` in the SQL Editor.

### Add your guest list

Edit `supabase/seed.sql` or insert directly in SQL Editor:

```sql
INSERT INTO allowed_guests (name, phone_normalized) VALUES
  ('Charalampos', '99949434'),
  ('Chrysovalantis', '99999999'),
  ('Όνομα Τρίτου', '99123456');
```

**Rules:** `phone_normalized` must be exactly **8 digits** (no spaces, no +357).

---

## Step 3: Deploy Edge Functions

Install Supabase CLI if needed:

```bash
npm install -g supabase
```

Login and link your project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Set secrets for Edge Functions (service role key + admin password):

```bash
supabase secrets set \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  ADMIN_SECRET=choose-a-strong-random-password
```

Deploy all three functions:

```bash
supabase functions deploy validate-phone
supabase functions deploy submit-rsvp
supabase functions deploy admin-data
```

Your API base URL will be:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1
```

---

## Step 4: Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_BASE_PATH=/
```

### Local development

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

**Admin panel:** http://localhost:5173/#admin

---

## Step 5: Deploy to GitHub Pages

### 5a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial RSVP app"
git remote add origin https://github.com/YOUR_USERNAME/bachelor_party.git
git push -u origin main
```

### 5b. Enable GitHub Pages

1. Repo → **Settings → Pages**
2. Source: **GitHub Actions**

### 5c. Set GitHub Secrets & Variables

**Settings → Secrets and variables → Actions → Secrets:**

| Secret | Value |
|--------|-------|
| `VITE_API_URL` | `https://YOUR_PROJECT_REF.supabase.co/functions/v1` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

**Variables** (optional, for project pages):

| Variable | Value |
|----------|-------|
| `VITE_BASE_PATH` | `/bachelor_party/` (your repo name with slashes) |

If deploying to `username.github.io` (user site), leave `VITE_BASE_PATH` as `/`.

### 5d. Deploy

Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

Your site will be at:
- `https://YOUR_USERNAME.github.io/bachelor_party/` (project page)
- or `https://YOUR_USERNAME.github.io/` (user site)

---

## Admin Panel

Visit your deployed URL with `#admin` appended:

```
https://YOUR_USERNAME.github.io/bachelor_party/#admin
```

Enter the `ADMIN_SECRET` you set in Step 3. You can:

- See totals per RSVP option
- View each person's response
- Export all answers to CSV

---

## Environment Variables Reference

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Supabase Edge Functions URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `VITE_BASE_PATH` | Build only | GitHub Pages base path (default `/`) |

### Supabase Edge Function Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `SUPABASE_URL` | Yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (never in frontend) |
| `ADMIN_SECRET` | Yes | Password for admin panel |

---

## Phone Validation

Accepted input formats (all normalize to 8 digits):

- `99949434`
- `+357 99949434`
- `00357 99949434`
- `99 949434`

Invalid numbers or numbers not in `allowed_guests` receive a friendly Greek error message.

---

## RSVP Options

| Field | Label |
|-------|-------|
| `friday_dinner` | Παρασκευή βραδινό |
| `friday_sleep` | Παρασκευή διανυκτέρευση |
| `saturday_breakfast` | Σάββατο πρωινό |
| `saturday_lunch` | Σάββατο μεσημεριανό |
| `saturday_dinner` | Σάββατο βραδινό |
| `saturday_sleep` | Σάββατο διανυκτέρευση |
| `sunday_breakfast` | Κυριακή πρωινό |

Each guest can submit once and update anytime (upsert on `guest_id`).

---

## Project Structure

```
bachelor_party/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── api.js             # Edge Function client
│   │   ├── components/        # PhoneGate, RsvpForm, Confirmation, Admin
│   │   └── utils/phone.js     # Client-side normalization (display only)
│   └── .env.example
├── supabase/
│   ├── migrations/            # Database schema
│   ├── seed.sql               # Example guest list
│   └── functions/
│       ├── validate-phone/    # Phone → guest lookup
│       ├── submit-rsvp/       # Save/update RSVP
│       ├── admin-data/        # Admin stats + export data
│       └── _shared/phone.ts   # Server-side normalization
├── .github/workflows/deploy.yml
└── README.md
```

---

## Security Notes

- Allowed phone numbers live only in `allowed_guests` — queried server-side
- RLS enabled with no public read policies
- Edge Functions use `service_role` key (set as secret, never in repo)
- `submit-rsvp` re-verifies phone matches `guestId` before saving
- Admin endpoint requires `ADMIN_SECRET`
- Do not commit `.env` files or service role keys

---

## Cost

**Free tier covers this easily:**

- Supabase Free: 500 MB database, 500K Edge Function invocations/month
- GitHub Pages: Free for public repos

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Το API δεν έχει ρυθμιστεί" | Check `VITE_API_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` or GitHub Secrets |
| Phone not found | Verify number is in `allowed_guests` as 8 digits |
| CORS errors | Redeploy Edge Functions; CORS headers are included |
| Blank page on GitHub Pages | Set correct `VITE_BASE_PATH` (e.g. `/repo-name/`) |
| Admin access denied | Check `ADMIN_SECRET` matches what you set via `supabase secrets set` |
| Functions return 401 | Ensure `Authorization: Bearer <anon_key>` header is sent (handled in `api.js`) |

---

## Manual Tasks Checklist

- [ ] Create Supabase project
- [ ] Run database migration
- [ ] Add real guest phone numbers to `allowed_guests`
- [ ] Set Edge Function secrets (`SUPABASE_URL`, `SERVICE_ROLE_KEY`, `ADMIN_SECRET`)
- [ ] Deploy Edge Functions
- [ ] Configure `frontend/.env` for local dev
- [ ] Push to GitHub
- [ ] Set GitHub Actions secrets
- [ ] Enable GitHub Pages (GitHub Actions source)
- [ ] Share RSVP link in group chat
- [ ] Bookmark admin URL (`#admin`) for organizers

---

Καλή μάζωξη! 💍
