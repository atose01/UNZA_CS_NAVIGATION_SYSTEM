# UNZA CS Navigation System

React + Vite + TypeScript application for the University of Zambia Computer Science Department. The existing UI uses the official Supabase JavaScript client for authentication and database access while keeping the existing navigation, maps, lecturer directory, events, timetable, and announcement interfaces.

## Local setup

1. Install Node.js and run `npm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable/anonymous key.
3. Add a browser-restricted Google Maps key if outdoor maps are required.
4. Apply the migrations and seed data with the Supabase CLI or SQL editor:

```bash
supabase db push
supabase db seed
```

5. Start the app with `npm run dev`.

## Environment variables

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy VITE_SUPABASE_ANON_KEY)
VITE_GOOGLE_MAPS_API_KEY (only required for outdoor Google Maps)
```

Never put a Supabase service-role key in `.env`, `.env.local`, or any `VITE_*` variable. The frontend only uses the publishable/anonymous key.

## Authentication and provisioning

Email sign-in uses Supabase Auth directly. Student computer-number sign-in uses the protected `login-with-computer-id` Edge Function, which resolves a computer number server-side and never returns the associated Auth email. Password reset requests use the protected `request-password-reset` function and return the same response for known and unknown identifiers.

The `provision-account` function is the protected workflow for authorised student, lecturer, and developer accounts. Deploy it and set its server-only secret:

```bash
supabase functions deploy provision-account
supabase secrets set ACCOUNT_PROVISIONING_TOKEN="choose-a-long-random-token"
```

Call it only from a secure administrator terminal. Do not put the provisioning token in the frontend. A lecturer request must contain the confirmed real `@cs.unza.zm` address; the function rejects made-up lecturer email addresses. If no password is supplied, it generates a temporary password and returns it once to the protected caller. The account is marked `password_change_required` and the app requires a password change after the first successful login.

Example lecturer request:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/provision-account" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "x-provisioning-token: YOUR_ACCOUNT_PROVISIONING_TOKEN" \
  -H "content-type: application/json" \
  -d '{"account_type":"lecturer","full_name":"Dr E. Lampi","email":"CONFIRMED_EMAIL@cs.unza.zm","email_confirmed":false,"office_room_id":"cs-r2"}'
```

Use `email_confirmed: true` only after the department has verified that the address belongs to the lecturer. Do not commit the response containing the temporary password. The same workflow accepts a 10-digit authorised student `computer_id`; if no student email is provided, it creates an internal Auth alias used only for computer-number login.

For this isolated academic prototype, the supplied sample accounts are listed in the local-only ignored helper `supabase/provision-demo-accounts.ps1`. After deploying `provision-account`, set the provisioning token in the current terminal and run:

```powershell
$env:UNZA_ACCOUNT_PROVISIONING_TOKEN = "your-server-only-token"
.\supabase\provision-demo-accounts.ps1
```

That helper creates the five student accounts, seven provisional lecturer accounts, and one developer test account supplied for the prototype. It must not be used for real UNZA accounts, and its plaintext test passwords must not be committed or reused outside the isolated project.

## Database and security

- `supabase/migrations/202609220001_initial_schema.sql` creates the core schema and baseline RLS policies.
- `supabase/migrations/202609220002_allow_service_role_role_provisioning.sql` permits only the service-role provisioning function to assign protected roles.
- `supabase/migrations/202609220003_security_account_workflows.sql` adds specialization and temporary-password state, hardens lecturer and event policies, and limits map writes to developers.
- `supabase/seed.sql` loads the supplied seven lecturer names and room assignments with unverified email, phone, specialization, and course fields left blank. It also seeds the existing map data and public sample content.

Public reads expose only directory/event/map content intended for visitors. Authenticated profile rows and account identifiers are protected by RLS. Students cannot edit lecturer, event, or map data. Lecturers can update their linked profile and their own events. Developers can manage authorised lecturer and map content.

The floor-plan image remains a frontend asset by default. If it is later uploaded to Supabase Storage, update `floors.map_asset_path` after verifying the asset and access policy.

## Verification

```bash
npm run build
npm test
```

The build can be verified locally, but end-to-end authentication, RLS, provisioning, and database loading require the migrations, seed data, valid environment variables, deployed Edge Functions, confirmed lecturer emails, and configured Supabase Auth redirect URLs.
