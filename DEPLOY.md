# Deploy Guide — Swastik Buildcons

Stack: Cloudflare Pages (frontend) + MonsterASP.NET (API) + Neon Postgres (DB) + Brevo (email).
The database is already set up and live on Neon. This guide covers hosting + config.

---

## 0. Reset the Neon password first ⚠️
The connection-string password was shared in chat, so rotate it:
- Neon dashboard → **Roles** → reset password for `neondb_owner`
- Use the NEW password everywhere below.

---

## 1. Backend API → MonsterASP.NET (free)

1. Sign up at monsterasp.net (free plan, no card).
2. Create a site. Note its address — MonsterASP.NET assigns a `.runasp.net`
   domain (e.g. `swastikbuildcons-api.runasp.net`). Note: `admin.monsterasp.net`
   is just the control panel; your live site is served from `*.runasp.net`.
3. Publish locally (already done once; re-run to refresh):
   ```
   dotnet publish backend/SwastikBuildcons.Api -c Release -o publish
   ```
4. Upload the contents of the `publish/` folder (at the repo root:
   `d:\Project\swastikbuildcons\publish\`) via their control panel / FTP / web deploy.
   Upload the FOLDER CONTENTS into the site root (`wwwroot`), not the folder itself.
   Do NOT upload `appsettings.Development.json` (it holds the old DB password and
   has already been removed from the publish output).
5. Set these **environment variables** (or app settings) on the host:

   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__Default=Host=ep-empty-sound-ayjbi1ju-pooler.c-5.us-east-2.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=<NEW_NEON_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
   AdminAuth__Username=admin
   AdminAuth__Password=<A_STRONG_PASSWORD>
   Jwt__SigningKey=<A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS>
   Jwt__Issuer=SwastikBuildcons
   Jwt__Audience=SwastikBuildconsAdmin
   Jwt__ExpiryMinutes=480
   Cors__AllowedOrigins__0=https://swastikbuildcons.com
   Cors__AllowedOrigins__1=https://www.swastikbuildcons.com
   Smtp__Host=smtp-relay.brevo.com
   Smtp__Port=587
   Smtp__EnableSsl=true
   Smtp__Username=b7eaa0001@smtp-brevo.com
   Smtp__Password=<BREVO_SMTP_KEY>
   Smtp__FromEmail=<a verified sender in Brevo>
   Smtp__ToEmail=<inbox where leads should arrive>
   ```

   Notes:
   - The connection-string key MUST be `ConnectionStrings__Default` (the app reads
     the connection named "Default"). `DefaultConnection` will NOT work — the app
     throws "Connection string 'Default' is not configured" on startup.
   - `Jwt__SigningKey` is REQUIRED and must be at least 32 characters. The app
     refuses to start in Production without it.
   - The app runs EF migrations automatically at startup — no manual DB step.
   - It refuses to start in Production if `AdminAuth__Password` is blank/default, or if CORS points at localhost. These are guardrails.
   - Leave Smtp blank to disable email (leads still stored).
   - On MonsterASP.NET (IIS-based), set these under the site's **Application
     Settings / Environment Variables** in the control panel. The `__`
     (double-underscore) format maps to nested config keys.

---

## 2. DNS for the API (Cloudflare)

- Cloudflare → your zone → DNS → add a **CNAME**: `api` → your `*.runasp.net` address
  (e.g. `swastikbuildcons-api.runasp.net`).
- Result: `https://api.swastikbuildcons.com` → the API.
- In MonsterASP.NET, add `api.swastikbuildcons.com` as a custom domain / binding on
  the site so it accepts requests for that hostname (and issues HTTPS for it).

---

## 3. Frontend → Cloudflare Pages (free)

1. Cloudflare → **Workers & Pages → Create → Pages → connect your Git repo**.
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Environment variable:
   - `VITE_API_BASE_URL=https://api.swastikbuildcons.com`
4. After first build: Pages → **Custom domains** → add `swastikbuildcons.com` and `www`.

---

## 4. Smoke test (live)

- `https://api.swastikbuildcons.com/health` → healthy
- `https://swastikbuildcons.com` → submit the contact form:
  - lead saved (check via admin endpoint), and
  - Brevo email arrives at `Smtp__ToEmail`
- Admin: calling an admin endpoint with valid creds → data; with none → 401
- Browser console: no mixed-content / HTTPS errors

---

## Notes
- Frontend rebuilds/redeploys automatically on every Git push (Cloudflare Pages).
- To update the API: re-run `dotnet publish` and re-upload.
- Never commit secrets. `appsettings.Development.json` (local Neon string) is gitignored.
