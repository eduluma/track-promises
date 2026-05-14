# Localization Rollout Plan

This document tracks the practical rollout plan for multilingual support across the product.

## Principles

- Keep UI copy in translation catalogs.
- Keep civic content translation separate from UI translation.
- Add localized public URLs only where the page copy is actually localized.
- Translate reusable shared components before translating more route shells.

## Rollout Stages

- [x] Build locale foundations: locale resolution, locale-prefixed URLs, language switcher, and multilingual fonts.
- [x] Translate template-heavy account and auth surfaces: login, signup, account, and admin route shells.
- [x] Translate fixed-copy shared public components used by timeline and promise pages.
- [x] Translate remaining page-specific public shells such as timeline overview sections and promise-detail-only labels.
- [x] Move repo-managed long-form content into localized content files where needed.
- [x] Add a localized content model for promises, source excerpts, and timeline summaries.
- [x] Add localized slugs for tenant, timeline, and promise content pages where product value justifies it.
- [ ] Add SEO alternates such as `hreflang` and localized sitemap entries.

## Current Scope Notes

- Shared public component translation now covers reusable cards, vote panels, source panels, trend panels, filters, status badges, and timeline hero summaries.
- Promise titles, descriptions, source excerpts, and timeline summaries now support locale-specific content records with fallback to the base content when translations are missing.
- Repo-managed long-form timeline context can now load locale-specific sidecar files such as `README.ta.md` before falling back to the shared default file.
- Tenant, timeline, and selected promise detail routes can now expose localized public slugs while middleware rewrites them back to canonical internal params.
- Malayalam and Hindi continue to fall back to English for the newer public-component copy until those translations are added.

## Next Recommended Slice

1. Add SEO alternates such as `hreflang` and localized sitemap entries once route/content coverage is explicit.
2. Expand localized slug coverage only where the matching domain content has real translations instead of fallback copy.
3. Continue filling higher-value promise datasets and source excerpts with real localized content records.
