# Roadmap And TODOs

## Phase 0: Product And Architecture Definition

- [x] Capture initial product idea.
- [x] Draft PRD.
- [x] Draft technical foundation.
- [ ] Decide MVP vote meaning: fulfillment sentiment, agreement, trust, or another label.
- [ ] Decide if users can remove votes or only switch between up/down.
- [ ] Decide voting-window scope rules.
- [ ] Define MVP promise statuses.
- [x] Choose recommended MVP auth provider: Auth.js.
- [x] Choose recommended MVP ORM: Drizzle.
- [ ] Choose initial hosting/database/Redis providers.
- [ ] Define config keys that must be admin-editable versus code/env-only.
- [ ] Define tenant model and final subdomain pattern.
- [ ] Define real-user verification and trust-score rules.
- [ ] Decide moderation privileges and review workflow.
- [ ] Decide Docker Compose service list for MVP.
- [ ] Define Kubernetes/Helm deployment environments and values files.

## Phase 1: MVP Foundation

- [ ] Scaffold Next.js + TypeScript app.
- [ ] Add linting, formatting, test runner, and CI-friendly scripts.
- [ ] Add Docker Compose for PostgreSQL and optional Redis.
- [ ] Add `.env.example` for local development settings.
- [ ] Add database migration setup.
- [ ] Create initial schema for tenants, tenant config, users, promises, sources, voting windows, votes, vote events, snapshots, status history, moderation reviews, and audit logs.
- [ ] Add seed data for a local tenant such as `tamilnadu` and a small promise set.
- [ ] Implement tenant resolution from hostname and local fallback.
- [ ] Implement validated config loading with platform defaults and tenant overrides.
- [ ] Implement authentication.
- [ ] Implement account states for pending, verified, limited, suspended, and moderator-approved users.
- [ ] Implement admin/editor-only promise creation.
- [ ] Build reusable promise card, vote controls, source list, status badge, table filter, and admin form components.
- [ ] Implement promise list page.
- [ ] Implement promise detail page.
- [ ] Implement voting API.
- [ ] Enforce one current vote per user per promise.
- [ ] Enforce voting freeze rules.
- [ ] Append immutable vote events.
- [ ] Show aggregate counts and current user's vote.
- [ ] Add basic registration moderation queue for suspicious or limited accounts.
- [ ] Add focused tests for vote create/change/freeze behavior.
- [ ] Add tests for tenant scoping and config resolution.

## Phase 2: Auditability And History

- [ ] Add vote snapshot worker.
- [ ] Add reconciliation job for aggregate counters.
- [ ] Add promise status history UI.
- [ ] Add source verification metadata.
- [ ] Add admin audit log views.
- [ ] Add historical vote trend charts.
- [ ] Add CSV import tooling for promises.
- [ ] Add trust-score rules based on account age, verification, moderation decisions, and abuse signals.
- [ ] Add moderator review workflow for registrations and suspicious voting patterns.

## Phase 3: Scale And Discovery

- [ ] Add advanced filters for election, jurisdiction, category, status, person/party, and source.
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

## Phase 4: Trust, Moderation, And Public Accountability

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
8. Authenticated up/down voting with vote changes.
9. Basic freeze-date enforcement.
10. Account verification states and a minimal moderation queue.
11. Tests for voting rules, tenant scoping, and config resolution.
12. Initial Helm chart skeleton for deployment.
