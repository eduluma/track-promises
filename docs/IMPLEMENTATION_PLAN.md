# Implementation Handoff Plan

This document is written for an implementation agent or another LLM that will build the project from the planning docs.

## Build Principles

- Keep the app config-driven wherever practical.
- Keep business logic in reusable modules and services, not duplicated inside pages.
- Prefer a split `web + api + worker` runtime over keeping backend behavior embedded in Next.js route handlers long term.
- Keep UI reusable with shared components for repeated promise, voting, source, admin, moderation, and table patterns.
- Avoid storing government identity documents or sensitive government records for user verification in MVP.
- Design for tenant subdomains from the beginning around the canonical `tenantSlug.track-promises.com` pattern.
- Use Docker Compose for local development dependencies.
- Deploy to Kubernetes with Helm.

## Phase 0 Decisions Locked For Implementation

- Treat votes as public delivery-stage assessments rather than binary sentiment.
- Allow users to switch between delivery-stage assessments while the voting window is open, but do not support self-service vote removal in MVP.
- Resolve voting windows by specificity in this order: promise override, election or campaign override, tenant or jurisdiction default, then platform default.
- Use the MVP status set `planned`, `in_progress`, `fulfilled`, `delayed`, and `disputed`.
- Keep promise creation limited to admins and editors in MVP.
- Keep tenant data in shared platform tables with strict row-based tenant scoping.
- Use `tenantSlug.track-promises.com` for production tenants and `tenantSlug.track-promises.localhost` for local development.
- Treat tenant branding, locale, categories, voting windows, moderation thresholds, and safe feature flags as admin-editable; keep secrets, provider credentials, infrastructure wiring, and platform domains in code or environment config.
- Use verified email plus account state as the MVP voting gate; trust score informs moderation and future privileges rather than replacing account-state enforcement.
- Standard local dependencies are `web` plus `postgres` by default and optional `redis` under a Compose profile. Add a dedicated `api` service next and add a worker service once snapshot and reconciliation jobs move out of scripts.
- Standard Helm environments are base values plus `values-local.yaml`, `values-staging.yaml`, and `values-production.yaml`.
- Prefer JWT-based auth for the next implementation phase and do not bring in Keycloak until SSO or federation becomes a concrete requirement.

## Recommended MVP Stack

- Next.js App Router with TypeScript.
- Fastify API service with TypeScript and OpenAPI generation.
- Tailwind CSS and shadcn/ui-style components.
- PostgreSQL.
- Drizzle ORM and migrations.
- JWT auth with a lightweight in-product auth boundary for now.
- Zod for config, forms, and API validation.
- Docker Compose for local PostgreSQL and optional Redis.
- Helm for Kubernetes deployment.
- DigitalOcean Kubernetes as the initial app host, with Neon PostgreSQL and Upstash Redis as the first managed data providers.

## Suggested Repository Structure

```text
apps/
  web/
    src/
      app/
      components/
  api/
    src/
      routes/
      plugins/
      openapi/
  worker/
    src/
      jobs/
packages/
  config/
  db/
  modules/
  schemas/
tests/
docker-compose.yml
charts/
  track-promises/
```

The exact structure can change to match framework conventions, but keep the shared domain logic reusable and testable across web, API, and worker runtimes.

## Transition Strategy From The Current Monolith

1. Keep the current Next.js route handlers working while the API service is scaffolded.
2. Move vote, moderation, audit, and promise write paths behind the API first.
3. Generate `openapi.json` from the API service and have the web app consume typed clients or shared request schemas.
4. Move snapshot, reconciliation, and import scripts into the worker runtime.
5. Remove route-local business logic from the web app once the API owns those flows.

## Configuration Plan

1. Define platform defaults in source-controlled config.
2. Define Zod schemas for all editable config.
3. Store tenant overrides in PostgreSQL.
4. Resolve effective config as `platform defaults + tenant overrides`.
5. Cache resolved config with short TTLs.
6. Invalidate config cache after admin changes.

Config should cover:

- tenant name, slug, branding, locale, and domain/subdomain;
- election timelines and alliance definitions for each tenant;
- promise categories and statuses;
- voting windows and freeze rules;
- feature flags;
- moderation thresholds;
- trust-score thresholds;
- display and sorting defaults.

Security secrets, auth secrets, database URLs, and provider credentials must remain environment variables or Kubernetes secrets, not tenant-editable config.

## Tenant And Subdomain Plan

- Add a `tenants` table early.
- Add `tenant_id` to tenant-scoped records such as promises, sources, voting windows, votes, vote events, snapshots, moderation reviews, and audit logs where appropriate.
- Resolve tenant from hostname first.
- Support local development with hostnames such as `tamilnadu.localhost` or with a path/query fallback when local wildcard DNS is inconvenient.
- Seed a sample tenant with slug `tamilnadu`.
- Plan for hostnames such as `tamilnadu.track-promises.com` in production and `tamilnadu.track-promises.localhost` locally.
- Enforce tenant scoping in repository/query helpers and tests.

## Registration, Verification, And Moderation Plan

MVP should avoid government-document verification. Instead, start with layered trust:

1. Email verification before voting.
2. Rate limits for registration, login, voting, and search.
3. Account states: `pending`, `verified`, `limited`, `suspended`, `moderator_approved`.
4. Trust score fields and events for future reputation logic.
5. Moderation review queue for suspicious registrations or voting behavior.
6. Audit logs for moderator decisions.

Future StackOverflow-style trust signals can include account age, consistent activity, accepted source submissions, moderator approvals, rejected abuse reports, and low anomaly scores.

## Local Development Plan

- Create `docker-compose.yml` for the web app, PostgreSQL, and optional Redis, with room to add an API service next.
- Add `.env.example` with local database URL, JWT secret placeholder, app URL, and tenant host settings.
- Add seed scripts for `tamilnadu` and a few sample promises.
- Keep application commands simple: install dependencies, run migrations, seed, start dev server, run tests.

## Kubernetes And Helm Plan

- Add a Helm chart under `charts/track-promises`.
- Include templates for web deployment, API deployment, optional worker deployment, service, ingress, config map, secret references, service account, and autoscaling values.
- Use managed PostgreSQL and managed Redis in production rather than running them in the first app chart.
- Add values files for local-like, staging, and production.
- Configure readiness and liveness probes.
- Support wildcard ingress hosts for tenant subdomains after the domain is finalized.
- Keep secrets out of Git; reference Kubernetes secrets or an external secret operator.

## First Build Sequence

1. Scaffold Next.js + TypeScript.
2. Add Tailwind, component foundation, linting, formatting, and tests.
3. Add Docker Compose and `.env.example`.
4. Add Drizzle, PostgreSQL schema, and migrations.
5. Add tenant and config modules.
6. Add seed data for `tamilnadu`.
7. Add the initial auth boundary and account states, then transition that flow to JWT-based API authentication.
8. Add promise/source modules and public pages.
9. Add voting windows, delivery-stage assessment API, current vote table, and immutable vote events.
10. Add minimal moderation review queue.
11. Add tests for config resolution, tenant scoping, voting rules, and freeze behavior.
12. Add initial Helm chart skeleton.

## Alliance-Aware Data Guidance

- Model election timelines such as Tamil Nadu 2026 as a container that can hold multiple alliances.
- Link each promise to tenant, state or jurisdiction, election timeline, and alliance metadata.
- Prefer a first-class `alliance` concept over encoding alliance names only inside a generic `personParty` string.
- Keep sample and seed data rich enough to show at least two alliances in the same state-year election with multiple promises each.
- Preserve room for candidate-level promises later, but treat alliance-level grouping as the minimum campaign structure for multi-alliance elections.

## Recommended Next Architecture Sequence

1. Scaffold `apps/api` with Fastify, Zod-backed validation, and OpenAPI generation.
2. Move current Next.js API routes to the new API service behind shared modules.
3. Add a typed API client layer to the web app.
4. Move snapshot, reconciliation, and import scripts into `apps/worker`.
5. Replace local session assumptions with JWT-based API authentication.
6. Reevaluate Keycloak or Authentik only if SSO, federation, or delegated identity administration becomes necessary.

## Guardrails For The Implementer

- Do not hard-code Tamil Nadu or any single government into business logic; it should be seed/config data.
- Do not assume one alliance per election timeline; a single state-year election can contain several alliances with separate promises.
- Do not duplicate tenant filtering logic in every route; centralize it in repository helpers or middleware.
- Do not place long-running work in the synchronous voting request path.
- Do not store government identity documents in MVP.
- Do not make Redis the source of truth for votes; PostgreSQL remains canonical.
- Do not ship tenant admin config changes without validation and audit logs.
