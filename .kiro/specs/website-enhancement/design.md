# Design — Swastik Buildcons Website Enhancement

## Overview

This design extends the existing system without changing its core stack. The frontend stays a React 19 + Vite + Tailwind app; the backend stays a .NET 9 Web API with EF Core + SQLite. The work is additive: new public read endpoints, new admin UI, new content types (testimonials, team), SEO infrastructure, and auth hardening.

Guiding principles:
- **Reuse the existing backend.** Projects, leads, validation, rate limiting, and email already exist — expose and manage them rather than rebuild.
- **Separate public (read-only, anonymous) from admin (authenticated, full CRUD)** at the API boundary.
- **Incremental and reversible.** Each phase builds on the last and can ship independently.

## Architecture

```
┌─────────────────────────── Frontend (React + Vite) ───────────────────────────┐
│  Public site (react-router)          │   Admin app (react-router /admin/*)      │
│  - Home / About / Services           │   - Login                                │
│  - Projects (list + detail)  ◄── GET │   - Leads dashboard                      │
│  - Testimonials / Team               │   - Projects manager                     │
│  - Contact form ─── POST ──►         │   - Testimonials manager                 │
│  - SEO: meta, JSON-LD, sitemap       │   (auth token stored client-side)        │
└──────────────────┬────────────────────────────────┬────────────────────────────┘
                   │ fetch                            │ fetch + Authorization
                   ▼                                  ▼
┌─────────────────────────── Backend (.NET 9 Web API) ───────────────────────────┐
│  Public controllers (AllowAnonymous)   │  Admin controllers ([Authorize Admin]) │
│  - GET /api/projects                   │  - /api/admin/leads (+ export, paging) │
│  - GET /api/projects/{id}              │  - /api/admin/industrial-projects CRUD │
│  - GET /api/testimonials               │  - /api/admin/testimonials CRUD        │
│  - POST /api/leads (rate-limited)      │  - /api/auth/login (JWT issue)         │
│  - GET /health                         │                                        │
├─────────────────────────────────────────────────────────────────────────────── │
│  Services: LeadService, IndustrialProjectService, TestimonialService,           │
│            EmailNotificationService (company + customer), AuthService (JWT)      │
│  Data: AppDbContext (EF Core migrations) → SQLite                               │
└─────────────────────────────────────────────────────────────────────────────── ┘
```

## Components and Interfaces

### Backend

#### Public Projects API (Req 1)
- `GET /api/projects` — returns published projects, supports `?type=` and `?status=` query filters.
- `GET /api/projects/{id}` — returns a single published project's public detail.
- New response DTO `PublicProjectResponse` that **excludes financial fields** (BudgetAmount, ActualCostToDate) to satisfy Req 1.7. Public fields: name, client, location, type, status, progress, description, scope, timeline dates.
- `IndustrialProject` model gains an `IsPublished` boolean (default false). New migration.
- `IIndustrialProjectService` gains `GetPublishedAsync(filter)` and `GetPublishedByIdAsync(id)`.

#### Admin Leads enhancements (Req 3)
- Extend `GET /api/admin/leads` with pagination (`?page=&pageSize=`) returning a paged envelope (items + total).
- Add `GET /api/admin/leads/export` returning `text/csv`.

#### Testimonials (Req 5)
- New `Testimonial` model: Id, ClientName, Company?, Quote, Rating?, ProjectId?, IsPublished, CreatedAtUtc.
- `TestimonialService` + `ITestimonialService`.
- Public: `GET /api/testimonials` (published only). Admin: full CRUD under `/api/admin/testimonials`.
- New migration.

#### Auth (Req 2, 9)
- Add `POST /api/auth/login` that validates admin credentials and issues a **JWT** (HS256, signing key from config/secret).
- Keep `BasicAuthenticationHandler` initially for backward compatibility, then switch admin controllers to JWT bearer authentication. Both can coexist during transition.
- JWT contains the `Admin` role claim; existing `[Authorize(Roles = "Admin")]` attributes keep working.

#### Customer auto-reply email (Req 8.5)
- Extend `IEmailNotificationService` with `SendLeadConfirmationAsync(lead)` — sends a thank-you to the inquirer's email when present. Reuses existing SMTP config; no-op when SMTP unconfigured (matches current behavior).

#### Audit fields (Req 9.4)
- Add nullable `UpdatedBy` / `UpdatedAtUtc` handling on admin-modified entities where practical.

### Frontend

#### Routing (Req 7.1)
- Introduce `react-router-dom`. Public routes: `/`, `/about`, `/services`, `/projects`, `/projects/:id`, `/contact`. Admin routes under `/admin/*` behind a route guard.
- The current single-page section layout can remain for the homepage; dedicated routes added for Projects detail and Admin.

#### Public Projects (Req 1)
- `Projects.jsx` fetches `/api/projects`, renders `ProjectCard` grid with type/status filters.
- New `ProjectDetail.jsx` route for `/projects/:id`.
- Replace hardcoded `src/data` project source with API data (keep a typed mapping layer).

#### Admin app (Req 2, 3, 4, 5)
- New `src/admin/` area: `Login`, `AdminLayout` (nav + logout), `LeadsDashboard`, `ProjectsManager`, `TestimonialsManager`.
- A small API client module that attaches the JWT `Authorization` header and handles 401 → redirect to login.
- Route guard component that checks for a valid token.

#### Trust content (Req 5, 6)
- `Testimonials.jsx` section (hidden when empty). `Team.jsx` and `Credentials.jsx` sections (static-first, DB-backed later).

#### SEO (Req 7)
- Per-route meta/title/OG via a lightweight head manager (e.g., a small helper or `react-helmet`-style approach compatible with React 19).
- Static `public/robots.txt` and generated `public/sitemap.xml`.
- JSON-LD `LocalBusiness` on home and `Project` on project detail.
- `loading="lazy"` on non-hero images.

#### Contact form UX (Req 8)
- Add submit spinner, success/error toast, form reset on success, and a hidden honeypot field (bots fill it → silently reject).

## Data Models

### IndustrialProject (modified)
```
+ IsPublished: bool (default false)
+ UpdatedBy: string? (audit)
```

### Testimonial (new)
```
Id: int (PK)
ClientName: string (required, <=120)
Company: string? (<=120)
Quote: string (required, <=1000)
Rating: int? (1..5)
ProjectId: int? (FK -> IndustrialProject, optional)
IsPublished: bool (default false)
CreatedAtUtc: DateTimeOffset (default CURRENT_TIMESTAMP)
```

### TeamMember (new, optional / Phase 2)
```
Id: int (PK)
Name: string (required)
Role: string (required)
PhotoUrl: string?
Bio: string? (<=1000)
DisplayOrder: int
IsPublished: bool
```

### DTOs
- `PublicProjectResponse` (no financials).
- `PagedResult<T>` { Items: T[], Total: int, Page: int, PageSize: int }.
- `TestimonialResponse`, `CreateTestimonialRequest`.
- `LoginRequest` { Username, Password }, `LoginResponse` { Token, ExpiresAtUtc }.

## Error Handling

- Public endpoints return 404 for unpublished/nonexistent resources (never leak existence of unpublished items with a different code).
- Admin endpoints return 401 for missing/invalid token, 403 for wrong role.
- Validation failures return 400 with `ProblemDetails` (already configured).
- Frontend API client centralizes error mapping and surfaces user-friendly messages; 401 triggers logout/redirect.
- SMTP/email failures are logged and do not fail the lead submission (preserve current behavior).

## Security Considerations

- JWT signing key, admin password, and SMTP credentials come from environment/secret config; production startup validation already enforces non-default admin password and non-localhost CORS.
- Public project DTO omits financial data.
- Honeypot reduces spam; existing per-IP rate limiting remains on lead submission.
- Keep HTTPS redirection and restricted CORS.

## Testing Strategy

- **Backend unit tests:** services (project publishing filter, testimonial CRUD, CSV export, JWT issue/validate).
- **API/integration tests:** public endpoints return only published data and omit financials; admin endpoints enforce auth; pagination envelope shape.
- **Frontend E2E (Playwright, already installed):** contact form happy/error path + honeypot; projects list/detail render from API; admin login → leads status update → projects publish toggle.
- **Manual/accessibility:** keyboard navigation and ARIA on forms and admin tables.

## Rollout / Phasing

1. **Phase 1:** Public projects endpoint + `IsPublished` migration + Projects page wiring + Admin UI (login, leads, projects). Auth may start on Basic Auth, JWT can land within this phase or Phase 4.
2. **Phase 2:** Testimonials (model + CRUD + admin + public) and Team/Credentials sections.
3. **Phase 3:** SEO + routing polish + lazy-loading + structured data.
4. **Phase 4:** JWT auth, pagination, CSV export, customer auto-reply, honeypot, audit fields.
5. **Phase 5 (out of scope for tasks below unless requested):** blog, video hero, analytics, full accessibility audit.
