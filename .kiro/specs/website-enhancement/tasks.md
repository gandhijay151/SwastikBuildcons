# Implementation Plan — Swastik Buildcons Website Enhancement

## Phase 1 — Activate the backend (public projects + admin UI)

- [x] 1. Add `IsPublished` to the project model and expose published projects publicly
  - [x] 1.1 Add `IsPublished` (default false) and optional audit field to `IndustrialProject`; create EF migration
    - _Requirements: 1.2, 4.6, 9.3, 9.4_
  - [x] 1.2 Create `PublicProjectResponse` DTO that excludes financial fields (budget, actual cost)
    - _Requirements: 1.4, 1.7_
  - [x] 1.3 Add `GetPublishedAsync(type, status)` and `GetPublishedByIdAsync(id)` to the project service
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.4 Add public `ProjectsController`: `GET /api/projects` (with type/status filters) and `GET /api/projects/{id}`, both `AllowAnonymous`, returning 404 for unpublished/missing
    - _Requirements: 1.1, 1.3, 1.5, 1.6, 1.7_
  - [x] 1.5 Add integration tests asserting only published projects return and financials are omitted
    - _Requirements: 1.2, 1.7_

- [x] 2. Wire the public Projects page to the API
  - [x] 2.1 Add `react-router-dom` and define public routes (`/`, `/about`, `/services`, `/projects`, `/projects/:id`, `/contact`)
    - _Requirements: 7.1_
  - [x] 2.2 Replace hardcoded project data in `Projects.jsx` with a fetch from `/api/projects`; add type/status filter UI and empty state
    - _Requirements: 1.1, 1.3, 1.5_
  - [x] 2.3 Build `ProjectDetail.jsx` for `/projects/:id` showing name, location, type, status, progress, scope, timeline
    - _Requirements: 1.4_

- [x] 3. Build the admin application shell and authentication UI
  - [x] 3.1 Create admin route area `/admin/*` with a route guard that redirects unauthenticated users to `/admin/login`
    - _Requirements: 2.1, 2.6_
  - [x] 3.2 Build `Login` screen; on success store session and grant access; on failure show error
    - _Requirements: 2.2, 2.3, 2.4_
  - [x] 3.3 Build `AdminLayout` with navigation and logout that clears the session
    - _Requirements: 2.5_
  - [x] 3.4 Create a shared admin API client that attaches the auth header and redirects to login on 401
    - _Requirements: 2.4, 2.6_

- [x] 4. Build the admin Leads dashboard
  - [x] 4.1 Add pagination to `GET /api/admin/leads` (paged envelope: items + total)
    - _Requirements: 3.5_
  - [x] 4.2 Build leads list UI with columns (name, phone, type, status, date), search/filter
    - _Requirements: 3.1, 3.2_
  - [x] 4.3 Build lead detail view and status-update control that persists changes
    - _Requirements: 3.3, 3.4_
  - [x] 4.4 Add `GET /api/admin/leads/export` (CSV) and a download action in the UI
    - _Requirements: 3.6_

- [x] 5. Build the admin Projects manager
  - [x] 5.1 Build projects list UI showing key fields and publish status
    - _Requirements: 4.1_
  - [x] 5.2 Build create/edit forms with client + server validation and error display
    - _Requirements: 4.2, 4.3, 4.4_
  - [x] 5.3 Add delete with confirmation and a publish toggle wired to `IsPublished`
    - _Requirements: 4.5, 4.6_

## Phase 2 — Trust & credibility content

- [x] 6. Implement Testimonials end to end
  - [x] 6.1 Add `Testimonial` model + migration; `ITestimonialService`/`TestimonialService`
    - _Requirements: 5.1, 5.3, 9.3_
  - [x] 6.2 Add public `GET /api/testimonials` (published only) and admin CRUD under `/api/admin/testimonials`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 6.3 Build public Testimonials section (hidden when empty) and admin Testimonials manager
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Add Team and Credentials sections
  - [x] 7.1 Build a Team/"Our People" section (static content first; graceful omission when empty)
    - _Requirements: 6.1, 6.3_
  - [x] 7.2 Build a Certifications/awards/safety section
    - _Requirements: 6.2, 6.3_

## Phase 3 — SEO & routing

- [x] 8. Add SEO infrastructure
  - [x] 8.1 Add per-route meta title/description/Open Graph tags
    - _Requirements: 7.2, 7.5_
  - [x] 8.2 Add `public/robots.txt` and generate `public/sitemap.xml`
    - _Requirements: 7.3_
  - [x] 8.3 Add JSON-LD structured data (`LocalBusiness` on home, `Project` on detail pages)
    - _Requirements: 7.4_
  - [x] 8.4 Apply `loading="lazy"` to non-critical images
    - _Requirements: 7.6_

## Phase 4 — UX & platform hardening

- [x] 9. Improve contact form UX and add spam protection
  - [x] 9.1 Add loading spinner, success/error toasts, and form reset on success
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 9.2 Add a honeypot field and reject submissions that fill it
    - _Requirements: 8.4_
  - [x] 9.3 Add customer confirmation/auto-reply email via `IEmailNotificationService.SendLeadConfirmationAsync`
    - _Requirements: 8.5_

- [x] 10. Harden authentication and auditing
  - [x] 10.1 Add `POST /api/auth/login` issuing a JWT; wire JWT bearer auth for admin controllers (keep Basic Auth during transition)
    - _Requirements: 2.2, 9.1_
  - [x] 10.2 Switch the admin frontend to the JWT login flow
    - _Requirements: 2.2, 2.4, 9.1_
  - [x] 10.3 Confirm rate limiting, HTTPS redirection, and production CORS remain enforced; add audit fields on admin edits
    - _Requirements: 9.2, 9.4_

## Notes

- Phase 5 items from the design (blog, video hero, analytics, full accessibility audit) are intentionally excluded from this plan and can be added later on request.
- Each task should be verified by building both projects (`dotnet build`, `npm run build`) and running relevant tests before marking complete.
