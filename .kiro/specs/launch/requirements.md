# Requirements — Launch Swastik Buildcons

## Introduction

The site (React frontend + .NET 9 API on SQLite) is built and passes clean builds. Launching is now a matter of configuration, deployment, and content — not new code. This spec captures what must be true to go live safely.

No separate design doc: the application already exists. This is a config + deploy checklist.

## Requirement 1: Production secrets configured

**User Story:** As the site owner, I want all production secrets set outside source control, so the app runs securely.

### Acceptance Criteria
1. THE `AdminAuth:Password` SHALL be set to a strong value (the app refuses to start in Production if blank or the default).
2. THE `ConnectionStrings:DefaultConnection` SHALL point to a writable SQLite path on the host (e.g. `Data Source=/var/app/swastikbuildcons.db`).
3. THE SMTP settings (Host, Username, Password, FromEmail, ToEmail) SHALL be configured, OR the owner SHALL accept that lead emails are silently skipped.
4. THE frontend SHALL be built with `VITE_API_BASE_URL` set to the production HTTPS API origin.
5. NO secret SHALL be committed to source control.

## Requirement 2: Deploy target ready

**User Story:** As the site owner, I want the app hosted on HTTPS with the correct domains, so users reach it securely.

### Acceptance Criteria
1. THE .NET API SHALL be hosted and reachable over HTTPS.
2. THE static frontend SHALL be built (`npm run build`) and served.
3. THE domains SHALL resolve: `swastikbuildcons.com` (+ `www`) to the frontend, and the API origin used in `VITE_API_BASE_URL`.
4. THE production CORS `AllowedOrigins` SHALL list the real frontend domain(s) and NOT localhost (the app enforces this at startup).
5. THE database SHALL be created/migrated on first run (the app runs EF migrations at startup).

## Requirement 3: Launch smoke test passes

**User Story:** As the site owner, I want to confirm the live site works before announcing it.

### Acceptance Criteria
1. WHEN the API is deployed THEN `GET /health` SHALL return healthy.
2. WHEN a visitor submits the contact form on the live site THEN a lead SHALL be stored and (if SMTP configured) an email SHALL arrive.
3. WHEN an admin calls an admin endpoint with valid credentials THEN it SHALL return data; with none, it SHALL return 401.
4. THE public pages SHALL load over HTTPS with no mixed-content errors.

## Requirement 4: Content correct

**User Story:** As the site owner, I want accurate company info shown, so visitors trust the site.

### Acceptance Criteria
1. THE company phone, WhatsApp, email, and address shown SHALL be the real values.
2. THE placeholder/stock project images MAY remain for launch, but the owner SHALL be aware they are not real project photos.

## Out of scope
Admin UI, testimonials, SEO polish, JWT — tracked in the `website-enhancement` spec. Not launch blockers.
