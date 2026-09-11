# Requirements — Swastik Buildcons Website Enhancement

## Introduction

Swastik Buildcons has a working public marketing site (React SPA) and a .NET 9 Web API with a database, admin API endpoints (Basic Auth), lead capture, and industrial-project CRUD. However, the admin functionality has no UI, the database projects are not shown on the public site (projects are hardcoded), and the site lacks common trust and SEO features that competitor construction websites treat as table-stakes in 2026.

This spec covers the work to (1) activate the existing backend by exposing projects publicly and building an admin UI, (2) add trust-building content (testimonials, team), (3) improve SEO and routing, and (4) harden the platform (auth, spam protection, exports, customer emails).

The goal is to reach competitive parity with modern construction websites while leveraging the backend that already exists.

## Glossary

- **Lead**: An inquiry submitted through the public contact form.
- **Industrial Project**: A construction project record managed in the backend (client, location, budget, scope, progress, dates).
- **Published**: A project/testimonial explicitly marked by an admin as visible on the public site.
- **Admin**: An authenticated user with the `Admin` role who manages leads, projects, and testimonials.

---

## Requirement 1: Public Projects Display

**User Story:** As a prospective client, I want to browse the company's completed and ongoing projects, so that I can evaluate their capability before contacting them.

### Acceptance Criteria

1. WHEN a visitor opens the Projects page THEN the system SHALL display projects retrieved from the backend database (not hardcoded data).
2. THE system SHALL only display projects that an admin has marked as published.
3. WHEN a visitor views the projects list THEN the system SHALL allow filtering by project type and status.
4. WHEN a visitor selects a project THEN the system SHALL display a detail view including project name, location, type, status, progress, scope of work, and completion timeline.
5. IF no published projects exist THEN the system SHALL display a friendly empty state rather than an error.
6. THE public projects endpoint SHALL be read-only and accessible without authentication.
7. THE public projects endpoint SHALL NOT expose internal-only fields (e.g., budget amount, actual cost) unless explicitly designated public.

## Requirement 2: Admin Authentication & Login UI

**User Story:** As an admin, I want to log in through a dedicated screen, so that I can access management tools without manually sending API credentials.

### Acceptance Criteria

1. WHEN an unauthenticated user visits an admin route THEN the system SHALL redirect them to an admin login screen.
2. WHEN an admin submits valid credentials THEN the system SHALL grant access to the admin area.
3. WHEN an admin submits invalid credentials THEN the system SHALL display an error message and deny access.
4. WHILE an admin session is active THE system SHALL keep the admin authenticated across admin pages.
5. WHEN an admin logs out THEN the system SHALL clear the session and require re-authentication.
6. THE admin area SHALL be protected such that all admin API calls require the `Admin` role.

## Requirement 3: Admin Leads Management UI

**User Story:** As an admin, I want to view and manage submitted leads, so that I can follow up with prospective clients.

### Acceptance Criteria

1. WHEN an admin opens the leads dashboard THEN the system SHALL display a list of all leads with name, phone, project type, status, and submission date.
2. WHEN an admin searches or filters leads THEN the system SHALL show only matching leads (by status and/or text).
3. WHEN an admin selects a lead THEN the system SHALL display full lead details.
4. WHEN an admin changes a lead's status THEN the system SHALL persist the new status and reflect it in the list.
5. WHERE the number of leads is large THE system SHALL paginate the list.
6. WHEN an admin requests an export THEN the system SHALL provide the leads as a downloadable CSV file.

## Requirement 4: Admin Projects Management UI

**User Story:** As an admin, I want to create, edit, delete, and publish projects, so that the public portfolio stays current without developer involvement.

### Acceptance Criteria

1. WHEN an admin opens the projects manager THEN the system SHALL display all projects with key fields and publish status.
2. WHEN an admin creates a project with valid data THEN the system SHALL save it and show it in the list.
3. WHEN an admin submits invalid project data THEN the system SHALL display validation errors and SHALL NOT save.
4. WHEN an admin edits a project THEN the system SHALL persist the changes.
5. WHEN an admin deletes a project THEN the system SHALL remove it after a confirmation step.
6. WHEN an admin toggles a project's published state THEN the system SHALL control its visibility on the public site accordingly.

## Requirement 5: Testimonials

**User Story:** As a prospective client, I want to read testimonials from past clients, so that I can trust the company's track record.

### Acceptance Criteria

1. WHEN a visitor views the site THEN the system SHALL display published client testimonials (client name, quote, and optionally company/rating).
2. THE system SHALL only display testimonials marked as published.
3. WHEN an admin creates, edits, deletes, or publishes a testimonial THEN the system SHALL persist the change and reflect it on the public site.
4. IF no published testimonials exist THEN the system SHALL hide the testimonials section rather than show an empty block.

## Requirement 6: Team & Credibility Content

**User Story:** As a prospective client, I want to see the team and company credentials, so that I feel confident in their expertise.

### Acceptance Criteria

1. THE system SHALL provide a team/"Our People" section with member name, role, and optional photo and bio.
2. THE system SHALL provide a section for certifications, awards, or safety credentials.
3. WHERE team or credential content is not yet available THE system SHALL omit the section gracefully.

## Requirement 7: SEO & Routing

**User Story:** As a marketing owner, I want the site to be discoverable on search engines, so that we attract organic leads.

### Acceptance Criteria

1. THE system SHALL provide distinct, linkable URLs for the main sections (home, about, services, projects, contact).
2. THE system SHALL set page-appropriate meta title, description, and Open Graph tags.
3. THE system SHALL provide a sitemap.xml and robots.txt.
4. THE system SHALL include structured data (JSON-LD) describing the business and, where applicable, projects.
5. WHEN a project detail page is shared THEN the system SHALL present accurate title and preview metadata.
6. THE system SHALL lazy-load non-critical images.

## Requirement 8: Contact Form UX & Spam Protection

**User Story:** As a visitor, I want clear feedback when I submit an inquiry, so that I know it was received; and as the owner, I want protection from spam.

### Acceptance Criteria

1. WHEN a visitor submits the contact form THEN the system SHALL show a loading indicator during submission.
2. WHEN submission succeeds THEN the system SHALL show a success confirmation and reset the form.
3. WHEN submission fails THEN the system SHALL show an error message and preserve the entered data.
4. THE system SHALL include a spam-mitigation mechanism (e.g., honeypot field) on the contact form.
5. WHEN a lead is submitted THEN the system SHALL send a confirmation/auto-reply email to the inquirer (when an email was provided).

## Requirement 9: Platform Hardening

**User Story:** As the site owner, I want the platform to be secure and maintainable, so that it operates reliably in production.

### Acceptance Criteria

1. THE admin authentication SHALL use a token-based session (e.g., JWT) suitable for a login UI.
2. THE system SHALL preserve existing protections: per-IP rate limiting on lead submission, HTTPS redirection, and CORS restricted to configured origins in production.
3. THE system SHALL manage database schema exclusively through EF Core migrations.
4. WHERE admin actions modify data THE system SHOULD record who made the change and when (audit fields).

## Non-Functional Requirements

- **Performance:** Public pages SHALL load efficiently (image compression, lazy-loading, code-splitting already in place).
- **Accessibility:** Interactive elements SHALL be keyboard-navigable with appropriate ARIA labeling.
- **Compatibility:** The frontend SHALL remain on the current stack (React 19 + Vite + Tailwind); the backend on .NET 9 + EF Core + SQLite.
- **Security:** Secrets (admin password, SMTP, JWT signing key) SHALL be provided via environment/secret configuration, never committed.
