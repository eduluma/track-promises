# Implementation Handoff Plan

This document is written for an implementation agent or another LLM that will build the project from the planning docs.

## Build Principles

- Keep the app config-driven wherever practical.
- Keep business logic in reusable modules and services, not duplicated inside pages.
- Keep UI reusable with shared components for repeated promise, voting, source, admin, moderation, and table patterns.
- Avoid storing government identity documents or sensitive government records for user verification in MVP.
- Design for tenant subdomains from the beginning, even if the final domain is not confirmed.
- Use Docker Compose for local development dependencies.
- Deploy to Kubernetes with Helm.

## Recommended MVP Stack

- Next.js App Router with TypeScript.
- Tailwind CSS and shadcn/ui-style components.
- PostgreSQL.
- Drizzle ORM and migrations.
- Auth.js.
- Zod for config, forms, and API validation.
- Docker Compose for local PostgreSQL and optional Redis.
- Helm for Kubernetes deployment.

## Suggested Repository Structure

```text
src/
  app/
    (public)/
    admin/
    api/
  components/
    ui/
    promises/
    voting/
    sources/
    moderation/
    admin/
  config/
    defaults.ts
    schemas.ts
    resolve-config.ts
  db/
    schema/
    migrations/
    client.ts
  modules/
    tenants/
    promises/
    sources/
    voting/
    moderation/
    audit/
    auth/
  lib/
    permissions.ts
    rate-limit.ts
    tenant-context.ts
    logger.ts
tests/
docker-compose.yml
charts/
  track-promises/
```

The exact structure can change to match framework conventions, but keep domain logic reusable and testable.

## Configuration Plan

1. Define platform defaults in source-controlled config.
2. Define Zod schemas for all editable config.
3. Store tenant overrides in PostgreSQL.
4. Resolve effective config as `platform defaults + tenant overrides`.
5. Cache resolved config with short TTLs.
6. Invalidate config cache after admin changes.

Config should cover:

- tenant name, slug, branding, locale, and domain/subdomain;
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
- Plan for a future hostname such as `tamilnadu.track-promises.com`; final domain is TBD.
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

- Create `docker-compose.yml` for PostgreSQL and optional Redis.
- Add `.env.example` with local database URL, Auth.js secret placeholder, app URL, and tenant host settings.
- Add seed scripts for `tamilnadu` and a few sample promises.
- Keep application commands simple: install dependencies, run migrations, seed, start dev server, run tests.

## Kubernetes And Helm Plan

- Add a Helm chart under `charts/track-promises`.
- Include templates for web deployment, optional worker deployment, service, ingress, config map, secret references, service account, and autoscaling values.
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
7. Add Auth.js and account states.
8. Add promise/source modules and public pages.
9. Add voting windows, vote API, current vote table, and immutable vote events.
10. Add minimal moderation review queue.
11. Add tests for config resolution, tenant scoping, voting rules, and freeze behavior.
12. Add initial Helm chart skeleton.

## Guardrails For The Implementer

- Do not hard-code Tamil Nadu or any single government into business logic; it should be seed/config data.
- Do not duplicate tenant filtering logic in every route; centralize it in repository helpers or middleware.
- Do not place long-running work in the synchronous voting request path.
- Do not store government identity documents in MVP.
- Do not make Redis the source of truth for votes; PostgreSQL remains canonical.
- Do not ship tenant admin config changes without validation and audit logs.
