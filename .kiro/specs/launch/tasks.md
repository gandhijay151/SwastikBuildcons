# Launch Plan — Swastik Buildcons

Config + deploy checklist. The app is built; these are the steps to go live.

## 1. Fix stale config
- [ ] 1.1 Correct `backend/SwastikBuildcons.Api/.env.example` — it references MongoDB but the app uses SQLite via EF Core. Replace with the real keys.
  - _Requirements: 1.2, 1.5_

## 2. Set production secrets (on the host, not committed)
- [ ] 2.1 Set `AdminAuth__Password` to a strong password
  - _Requirements: 1.1_
- [ ] 2.2 Set `ConnectionStrings__DefaultConnection` to a writable SQLite path
  - _Requirements: 1.2_
- [ ] 2.3 Set SMTP (`Smtp__Host/Username/Password/FromEmail/ToEmail`) — or accept emails are skipped
  - _Requirements: 1.3_
- [ ] 2.4 Set `Cors__AllowedOrigins__0/1` to the real frontend domain(s)
  - _Requirements: 2.4_

## 3. Build & deploy
- [ ] 3.1 Build frontend with prod API URL: `VITE_API_BASE_URL=https://api.swastikbuildcons.com npm run build`, deploy `dist/`
  - _Requirements: 1.4, 2.2_
- [ ] 3.2 Publish & host the API over HTTPS (`dotnet publish -c Release`), `ASPNETCORE_ENVIRONMENT=Production`
  - _Requirements: 2.1, 2.5_
- [ ] 3.3 Point DNS: `swastikbuildcons.com` + `www` → frontend; API origin → API host
  - _Requirements: 2.3_

## 4. Smoke test the live site
- [ ] 4.1 `GET /health` returns healthy
  - _Requirements: 3.1_
- [ ] 4.2 Submit the contact form → lead stored (+ email if SMTP set)
  - _Requirements: 3.2_
- [ ] 4.3 Admin endpoint: valid creds → data, no creds → 401
  - _Requirements: 3.3_
- [ ] 4.4 Pages load over HTTPS, no mixed-content errors in console
  - _Requirements: 3.4_

## 5. Content check
- [ ] 5.1 Verify real phone / WhatsApp / email / address across the site
  - _Requirements: 4.1_

## Notes
- App auto-runs EF migrations on startup — no manual DB step.
- Startup refuses to boot in Production if admin password is blank/default or CORS points at localhost — these are guardrails, not bugs.
