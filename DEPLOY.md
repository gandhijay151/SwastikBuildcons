# Deployment Guide — Swastik Buildcons

Stack: Cloudflare Pages (frontend) + MonsterASP.NET (API, free) + Neon Postgres (DB) + Brevo (email).
Frontend is already deployed on Cloudflare Pages. This guide covers the remaining steps.

---

## STEP 1 — Redeploy frontend (fixes the /admin 404)

The `dist/` folder now includes a `public/_redirects` file (`/*  /index.html  200`)
so client-side routes like /admin, /about, /projects no longer 404.

In the VS Code terminal (use your REAL Cloudflare token):

    $env:CLOUDFLARE_API_TOKEN = "your-real-cloudflare-token"
    npx wrangler pages deploy dist --project-name=swastikbuildcons

Or via dashboard: Workers & Pages -> swastikbuildcons -> Create deployment -> drag the `dist` folder.

After this: swastikbuildcons.com/admin loads the login page (no 404). Login works after Steps 2-4.

---

## STEP 2 — Host the API on MonsterASP.NET (free)

1. monsterasp.net -> sign up (free plan, no card).
2. Create a new site; note its URL (e.g. swastikbuildcons.runasp.net).
3. Note the FTP details or Web Deploy publish profile.
4. Set the runtime to .NET 9 if asked.

---

## STEP 3 — Upload the API + set secrets

Upload everything inside:
    backend/SwastikBuildcons.Api/publish/
to the site root (FileZilla for FTP, or the host's file manager).

Set these environment variables / app settings on the host:

    ASPNETCORE_ENVIRONMENT=Production
    ConnectionStrings__DefaultConnection=Host=ep-empty-sound-ayjbi1ju-pooler.c-5.us-east-2.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=YOUR_NEW_NEON_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
    AdminAuth__Username=admin
    AdminAuth__Password=CHOOSE_A_STRONG_PASSWORD
    Cors__AllowedOrigins__0=https://swastikbuildcons.com
    Cors__AllowedOrigins__1=https://www.swastikbuildcons.com
    Smtp__Host=smtp-relay.brevo.com
    Smtp__Port=587
    Smtp__EnableSsl=true
    Smtp__Username=b7eaa0001@smtp-brevo.com
    Smtp__Password=YOUR_BREVO_SMTP_KEY
    Smtp__FromEmail=YOUR_VERIFIED_BREVO_SENDER
    Smtp__ToEmail=WHERE_LEADS_SHOULD_ARRIVE

Optional (enable later, not required to launch):
    Ai__ApiKey=YOUR_GEMINI_KEY          # AI lead triage
    Ai__Model=gemini-flash-latest
    Turnstile__SecretKey=YOUR_TURNSTILE_SECRET   # CAPTCHA (also set VITE_TURNSTILE_SITE_KEY in the frontend build)

Notes:
- The app runs EF Core migrations automatically at startup (no manual DB step).
- It refuses to start in Production if AdminAuth__Password is blank/default or CORS points at localhost (guardrails).
- Admin login = admin / whatever you set for AdminAuth__Password.
- Use the NEW Neon password (rotate the one exposed in chat).

---

## STEP 4 — Point api.swastikbuildcons.com at the API (Cloudflare DNS)

Cloudflare -> your domain -> DNS -> Add record:
- Type: CNAME
- Name: api
- Target: your MonsterASP URL (e.g. swastikbuildcons.runasp.net)

Result: https://api.swastikbuildcons.com routes to the API.

---

## STEP 5 — Smoke test

1. https://api.swastikbuildcons.com/health  -> Healthy
2. https://swastikbuildcons.com/admin -> log in (admin / your password) -> dashboard loads
3. https://swastikbuildcons.com -> submit the contact form -> lead saved + Brevo email arrives
4. Browser console: no mixed-content / HTTPS errors

---

## Updating later
- Frontend: re-run `npm run build` (with VITE_API_BASE_URL set) and redeploy dist.
- API: re-run `dotnet publish -c Release -o publish` and re-upload.
