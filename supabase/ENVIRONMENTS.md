# Supabase Environments Guide for Kubes

Per **SOP §12**, Kubes uses three isolated Supabase environments:

- **Development**: Local testing and feature development
- **Staging**: Pre-release smoke testing on web, iOS, and Android
- **Production**: Live application serving end users

A development build must never be able to read or write production data under any configuration.

---

## 1. Environment Variables

Each environment has its own corresponding `.env` configuration:

| Environment | Env Template               | Purpose                    |
| ----------- | -------------------------- | -------------------------- |
| Development | `.env.development.example` | Local builds & dev testing |
| Staging     | `.env.staging.example`     | Staging preview builds     |
| Production  | `.env.production.example`  | Production releases        |

Copy the template to `.env` or set the environment variables in your EAS / deployment system:

- `EXPO_PUBLIC_APP_ENV`: `development` | `staging` | `production`
- `EXPO_PUBLIC_SUPABASE_URL`: The project URL (e.g. `https://xyzcompany.supabase.co`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key (safe for client bundles)

---

## 2. Applying the Schema to a Project

The base schema is located at:
`supabase/migrations/20260920000000_base_schema.sql`

It creates all 12 tables, indexes, auth triggers, and enables **Row-Level Security (RLS)** on every single table.

### Option A: Via Supabase Dashboard (Recommended for Non-Technical Founder)

1. Open [database.new](https://database.new) or your Supabase Dashboard.
2. Select your project (Dev, Staging, or Prod).
3. Navigate to **SQL Editor** in the left sidebar.
4. Click **New query**.
5. Paste the entire contents of `supabase/migrations/20260920000000_base_schema.sql`.
6. Click **Run**.
7. Confirm that all 12 tables appear in **Table Editor** with RLS badges visible.

### Option B: Via Supabase CLI

To link and push migrations using the CLI:

```bash
# Login to Supabase
npx supabase login

# Link to your project (e.g. dev)
npx supabase link --project-ref <dev-project-ref>

# Push the migration
npx supabase db push
```

Repeat for staging and production using their respective project reference IDs.
