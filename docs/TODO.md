# Roadmap And TODOs

## Phase 0: Product And Architecture Definition

- [x] Capture initial product idea.
- [x] Draft PRD.
- [x] Draft technical foundation.
- [x] Decide MVP vote meaning: delivery-stage assessment rather than binary sentiment.
- [x] Decide if users can remove votes or only switch between delivery-stage assessments.
- [x] Decide voting-window scope rules.
- [x] Define MVP promise statuses.
- [x] Choose recommended near-term auth approach: JWT-based API auth, with the current Auth.js implementation treated as transitional.
- [x] Choose recommended MVP ORM: Drizzle.
- [x] Choose initial hosting/database/Redis providers.
- [x] Define config keys that must be admin-editable versus code/env-only.
- [x] Define tenant model and final subdomain pattern.
- [x] Define real-user verification and trust-score rules.
- [x] Decide moderation privileges and review workflow.
- [x] Decide Docker Compose service list for MVP.
- [x] Define Kubernetes/Helm deployment environments and values files.

## Phase 1: MVP Foundation

- [x] Scaffold Next.js + TypeScript app.
- [x] Add linting, formatting, test runner, and CI-friendly scripts.
- [x] Add Docker Compose for PostgreSQL and optional Redis.
- [x] Add `.env.example` for local development settings.
- [x] Add `Taskfile.yaml` for local build, validation, and Docker Compose workflows.
- [x] Add database migration setup.
- [x] Create initial schema for tenants, tenant config, users, promises, sources, voting windows, votes, vote events, snapshots, status history, moderation reviews, and audit logs.
- [x] Add seed data for a local tenant such as `tamilnadu` and a small promise set.
- [x] Implement tenant resolution from hostname and local fallback.
- [x] Implement validated config loading with platform defaults and tenant overrides.
- [x] Implement authentication.
- [x] Implement account states for pending, verified, limited, suspended, and moderator-approved users.
- [x] Implement admin/editor-only promise creation.
- [x] Build reusable promise card, vote controls, source list, status badge, table filter, and admin form components.
- [x] Implement promise list page.
- [x] Implement promise detail page.
- [x] Support timeline-aware public routes like `/{jurisdiction}/{timeline}` and promise detail URLs under that timeline.
- [x] Load optional jurisdiction-timeline overview content from repo-managed `README.md` or `index.html` files.
- [x] Implement voting API.
- [x] Enforce one current vote per user per promise.
- [x] Enforce voting freeze rules.
- [x] Append immutable vote events.
- [x] Show aggregate counts and current user's vote.
- [x] Add basic registration moderation queue for suspicious or limited accounts.
- [x] Add focused tests for vote create/change/freeze behavior.
- [x] Add tests for tenant scoping and config resolution.

## Phase 2: Auditability And History

- [x] Add vote snapshot worker.
- [x] Add reconciliation job for aggregate counters.
- [x] Add promise status history UI.
- [x] Add source verification metadata.
- [x] Add admin audit log views.
- [x] Add historical vote trend charts.
- [x] Add CSV import tooling for promises.
- [x] Add trust-score rules based on account age, verification, moderation decisions, and abuse signals.
- [x] Add moderator review workflow for registrations and suspicious voting patterns.

## Phase 3: Scale And Discovery

- [ ] Split the current Next.js runtime into separate `web`, `api`, and `worker` services.
- [x] Extract the existing vote, promise-admin, and moderation write handlers into shared API modules.
- [x] Add a separate Fastify API service for the existing write-path endpoints.
- [x] Generate `openapi.json` and API docs from the new API service.
- [x] Move current Next.js route handlers behind typed API clients.
- [x] Ensure `task up` applies database migrations before the local stack comes up.
- [x] Ensure Kubernetes production migration jobs also run the safe foundation seed so voting/audit persistence has required tenant data.
- [ ] Switch the web runtime from local API transport to the remote API service after read paths stop depending on process-local in-memory stores.
- [x] Eliminate all process-local in-memory stores: votes, vote events, vote snapshots, audit logs, and moderation reviews now write to and read from PostgreSQL.
- [ ] Add advanced filters for election year, timeline, alliance, jurisdiction, category, status, person/party, and source.
- [x] Add inline quick-vote controls and compact vote trends on timeline promise cards.
- [x] Add a reusable delivery-plan model for recurring and milestone-based promises.
- [x] Replace binary up/down voting with delivery-stage assessments and weighted completion snapshots.
- [x] Add timeline-level public progress scoring with term-length metadata and write-through recalculation.
- [x] Add timeline office-start and result-publication dates so public scoring uses the real promise clock.
- [x] Harden request-path PostgreSQL access with retry-safe client resets for long-running local dev servers.
- [x] Add normalized database tables for timelines, alliances, and timeline-alliance memberships.
- [x] Add source-backed research notes for 2026 Kerala, West Bengal, Assam, and Puducherry election material.
- [x] Add import-ready JSON datasets for Kerala 2026 front promises and Tamil Nadu 2026 TVK promises.
- [x] Add recent-election overview metadata to the active state promise datasets.
- [x] Add official 2026 recent-election overview files for Assam, Kerala, Puducherry, Tamil Nadu, and West Bengal under `docs/election/2026`.
- [x] Surface recent-election snapshots above state timeline promise lists.
- [x] Move active election datasets into `data/election/2026` and quarantine stale sample files under `to_delete/`.
- [x] Move 2026 constituency-level Tamil Nadu and Kerala result dumps into `data/election/2026/constituency-results` with canonical state-first filenames.
- [ ] Add first-class alliance modeling for multi-alliance elections within the same tenant timeline.
- [ ] Add PostgreSQL full-text search.
- [ ] Add Redis-backed rate limiting.
- [ ] Add Redis-backed hot vote counters if needed.
- [ ] Add CDN/framework caching strategy for public pages.
- [ ] Add background workers for snapshots and aggregate repairs.
- [ ] Run load tests for high-traffic promise pages and vote endpoints.
- [ ] Prepare read replica support for public browsing queries.
- [ ] Add wildcard subdomain support through ingress/CDN configuration.
- [ ] Add Helm chart for web app, worker, service, ingress, config maps, and secrets references.
- [ ] Add staging and production Helm values files.
- [x] Wire the production web deployment secret to include the Brevo email API key for signup and verification mail delivery.

## Phase 4: Trust, Moderation, And Public Accountability

- [x] Implement self-service user signup (email + password) with email verification flow.
- [ ] Replace in-memory demo users with real DB-backed authentication.
- [ ] Auto-assign `state: "pending"` on signup; transition to `verified` after email confirmation.
- [ ] Route suspicious or unverified signups to the moderation queue.
- [x] Add signup link in site header / login page.
- [ ] Add disputed-status workflow.
- [ ] Add editorial review queues.
- [ ] Add public methodology page.
- [ ] Add abuse detection signals for suspicious voting patterns.
- [ ] Add admin dashboard for moderation and operational health.
- [ ] Add richer source trails and evidence review.
- [ ] Add tenant admin screens for categories, statuses, voting windows, branding, and feature flags.

## Phase 5: Platform Maturity

- [ ] Add public API.
- [ ] Add embeddable widgets for media or civic partners.
- [ ] Add dedicated analytics warehouse if product usage justifies it.
- [ ] Partition large vote event and snapshot tables.
- [ ] Add multi-region read strategy if needed.
- [ ] Reevaluate dedicated identity services such as Keycloak or Authentik if SSO, federation, or delegated identity admin becomes necessary.
- [ ] Evaluate separate database/schema isolation for very large government tenants.

## First Implementation Slice

When implementation starts, build this vertical slice first:

1. Next.js + TypeScript project scaffold.
2. Docker Compose for PostgreSQL and optional Redis.
3. PostgreSQL migration setup with Drizzle.
4. Tenant, tenant config, promise, source, voting window, vote, vote event, moderation review, and audit schema.
5. Seed data for a `tamilnadu` tenant and a few promises.
6. Tenant resolution from hostname or local fallback.
7. Promise list and detail pages using reusable components.
8. Authenticated delivery-stage assessments with vote changes.
9. Basic freeze-date enforcement.
10. Account verification states and a minimal moderation queue.
11. Tests for voting rules, tenant scoping, and config resolution.
12. Initial Helm chart skeleton for deployment.
