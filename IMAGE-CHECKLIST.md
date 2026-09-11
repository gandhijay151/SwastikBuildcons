# Image Checklist — Swastik Buildcons Website

All copyright-risky photos have been removed. The site works and builds with
**zero photos** right now (sections fall back to clean branded placeholders).
Add images back only when they are **licensed or your own**.

## How many photos you need

| Section | Where it shows | Photos needed | Priority | Status when empty |
|---|---|---|---|---|
| Homepage hero background | Home page, top | 1 | High | Falls back to brand pattern |
| Equipment fleet | Services page | 7 (one per item) | Low | Shows brand icon placeholder |
| Industrial work showcase | Services page ("How We Work") | 3–4 | Low | Shows solid brand panel |

**Recommended total: about 11–12 photos.**
**Bare minimum to look complete: 1 (hero).** Everything else degrades cleanly.

> The Design Inspiration gallery was removed (a new firm has no portfolio yet),
> so no gallery photos are needed. The Projects page now shows the Vision section only.

Suggested phased approach:
1. **Phase 1 (1 photo):** Homepage hero. Biggest visual impact.
2. **Phase 2 (7 photos):** Equipment fleet images (only if you actually have/rent this equipment — otherwise leave the icon placeholders or remove the section).
3. **Phase 3 (3–4 photos):** Industrial showcase rotator.

## Image specs
- Format: `.webp` preferred (smaller). `.jpg`/`.png` also work.
- Hero: landscape, ~1920×1080, under ~400 KB after compression.
- Gallery / equipment / showcase: landscape, ~1200×800, under ~250 KB each.
- Compress before adding (e.g. squoosh.app) — the removed stock JPGs were 2–4 MB each and slowed the page.

## Where images are wired (add them here)
- `src/data/site.js`
  - `homeHeroImage` — import a photo and assign it (currently `null`).
  - `equipmentFleet[].image` — set each from `null` to an imported photo.
- `src/pages/Services.jsx`
  - `industrialImages` array — add `{ src, alt, transform }` entries (currently `[]`).

## Licensing rules (must follow)
Only use photos that are:
- Taken by you or your team, OR
- Purchased with a commercial license, OR
- From a free-for-commercial-use source: **Pexels, Unsplash, Pixabay**.

Do NOT reuse images copied from other companies' websites or random web pages.
For each image you add, record its source URL and license below.

## Sourced images log
| File | Section | Source URL | License |
|---|---|---|---|
| _(none yet)_ | | | |
