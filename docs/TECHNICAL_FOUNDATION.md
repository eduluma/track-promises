# Technical Foundation

## Recommended MVP Stack

- Web app: Next.js App Router with TypeScript for the frontend only.
- API service: Fastify with TypeScript, Zod validation, and generated OpenAPI.
- Styling: Tailwind CSS plus shadcn/ui-style components.
- Database: PostgreSQL.
- ORM/migrations: Drizzle.
- Auth: JWT-based auth for MVP, issued by the backend auth boundary; defer Keycloak or another dedicated identity provider until SSO or federation requirements justify it.
- Validation: Zod.
- Cache/rate limit path: design interfaces for Redis from day one; add Upstash Redis when rate limiting, hot counters, or cache pressure make it worthwhile.
- Background jobs: start with a simple worker or scheduled job; move to BullMQ, Inngest, Trigger.dev, or equivalent when snapshots and reconciliation mature.
- Local development: Docker Compose for web, API, PostgreSQL, Redis when enabled, worker processes, and app dependencies.
- Production deployment: Kubernetes manifests packaged with Helm charts, initially deployed to DigitalOcean Kubernetes with Neon PostgreSQL and Upstash Redis.

## Stack Notes

### Application

- Next.js with TypeScript for the web app, public pages, and admin screens.
- Fastify with TypeScript for API routes, OpenAPI generation, and service-to-service contracts.
- React Server Components and route-level caching for read-heavy pages where appropriate.
- Tailwind CSS and a small component system such as shadcn/ui for accessible, consistent UI.
- Zod for request validation and shared schema checks.
- Config-driven feature behavior using validated server-side configuration and tenant overrides.
- Reusable domain modules for promises, voting, sources, tenants, moderation, auth, and audit logs.
- Reusable UI components for cards, tables, filters, vote controls, status badges, source lists, admin forms, and moderation queues.

### Data

- PostgreSQL as the primary source of truth.
- Drizzle ORM for migrations and typed database access.
- Redis for hot vote counters, rate limiting, short-lived cache, and traffic spike protection once needed.
- Background jobs with BullMQ, Inngest, Trigger.dev, or a similar worker system for snapshots and reconciliation.

### Auth And Security

- Use JWT bearer tokens between the web app and API service.
- Keep the initial identity boundary simple inside the product stack rather than introducing Keycloak immediately.
- Verified email required for voting.
- Rate limiting for voting, auth, search, and admin endpoints.
- Audit logs for vote events, promise edits, status changes, and admin actions.
- Avoid collecting or storing government identity documents in MVP.
- Add trust-score and moderation hooks so real-user confidence can improve over time without sensitive identity storage.
- Support account states such as pending verification, verified, limited, suspended, and moderator-approved.
- Use account state as the primary enforcement gate for voting eligibility in MVP, with trust score influencing review priority and state transitions.
- Start trust scoring with email verification, account age, moderator decisions, and abuse signals; do not require a high trust score for baseline voting once an account is verified and not limited.
- Revisit a dedicated identity service such as Keycloak or Authentik only when we need SSO, identity federation, social login sprawl, or delegated admin workflows that exceed the cost of a simpler JWT-based setup.

### Search

- Start with PostgreSQL full-text search for MVP.
- Move to OpenSearch, Meilisearch, or Typesense if ranking needs, query load, or filtering complexity outgrow Postgres.

### Deployment

- Local development: Docker Compose should start `web`, PostgreSQL, and optional Redis consistently, with the API service added as the next runtime split step.
- Early production: Kubernetes deployment through Helm, with managed PostgreSQL and managed Redis preferred over running stateful services in the app cluster unless there is a clear operational reason.
- Later scaling: read replicas, a dedicated API deployment, worker processes, table partitioning, CDN caching, horizontal pod autoscaling, and possibly a dedicated search cluster.
- Ingress should support wildcard tenant subdomains such as `*.track-promises.com`.

## Core Domain Model

### User

Represents a registered user who can vote.

Key fields: id, email, display name, role, email verification state, created/updated timestamps.

Additional fields: account state, trust score, moderation flags, last verification timestamp.

### Tenant

Represents a government, state, jurisdiction, election workspace, or other scoped public site.

Key fields: id, name, slug, jurisdiction type, country/region metadata, primary domain, subdomain, default locale, branding config, feature flags, created/updated timestamps.

Example: Tamil Nadu could use a tenant slug such as `tamilnadu` and a future hostname such as `tamilnadu.track-promises.com`.

### TenantConfig

Stores tenant-specific settings with platform defaults and validated overrides.

Key fields: id, tenant id, config key, config value, schema version, updated by, timestamps.

### Promise

Represents a public promise being tracked.

Key fields: id, tenant id, timeline slug or election year, title, description, category, jurisdiction, election/campaign, alliance id or alliance name, person/party, status, created/updated timestamps.

### Alliance

Represents a campaign grouping within a tenant and election timeline.

Key fields: id, tenant id, timeline slug or election year, name, slug, jurisdiction, election label, alliance type, member parties, created/updated timestamps.

### PromiseSource

Represents evidence for a promise.

Key fields: id, promise id, URL, publisher, quote/excerpt, captured date, verification metadata.

### VotingWindow

Defines when voting is open or frozen.

Key fields: id, tenant id, scope type, scope id, start date, freeze date, end date, rules.

### Vote

Stores the current vote for fast lookups.

Key fields: id, promise id, user id, delivery-stage value, created/updated timestamps.

Important constraint: unique `(promise_id, user_id)`.

### VoteEvent

Stores immutable vote history.

Key fields: id, promise id, user id, previous value, new value, event type, timestamp, request metadata hash.

### VoteSnapshot

Stores historical aggregate totals.

Key fields: id, promise id, total votes, weighted completion percent, snapshot timestamp, generation source.

### PromiseStatusHistory

Stores status changes over time.

Key fields: id, promise id, previous status, new status, changed by, reason, source id, timestamp.

### AuditLog

Stores admin/editor and sensitive system actions.

Key fields: id, actor id, action, entity type, entity id, metadata, timestamp.

### ModerationReview

Stores account, source, promise, and voting-abuse review tasks.

Key fields: id, tenant id, subject type, subject id, reason, status, assigned moderator id, decision, metadata, created/updated timestamps.

## Configuration Strategy

- Define typed configuration schemas with Zod.
- Keep platform defaults in source-controlled config files.
- Store tenant overrides in PostgreSQL so admins can adjust safe settings without deployments.
- Validate every config update before saving.
- Cache resolved tenant configuration with short TTLs and explicit invalidation after admin changes.
- Prefer configuration for categories, promise statuses, voting windows, feature flags, trust thresholds, branding, locale, and tenant routing.
- Keep security-sensitive settings in environment variables or secret stores, not tenant-editable config.

## Localization Strategy

- Treat localization as a first-class tenant capability, not as a last-mile string replacement.
- Keep a platform locale registry with normalized BCP 47 language codes such as `en`, `ta`, `ml`, and `hi`.
- Resolve locale in this order: explicit URL prefix, persisted cookie, `Accept-Language` header, then tenant default locale.
- Allow public URLs with optional locale prefixes such as `/ta/tamilnadu/2026`, while rewriting internally so the existing route tree stays stable.
- Store each tenant's supported locales and fallback locale in validated tenant config; keep the tenant record's default locale aligned with one of those supported locales.
- Separate UI message catalogs from domain content. Navigation, buttons, forms, and status explanations should come from message dictionaries; promise titles, descriptions, sources, and long-form content should move toward localized content records over time.
- Choose fonts with script coverage for Tamil, Malayalam, and Devanagari at the layout level so translated text does not silently fall back to inconsistent system fonts.
- Preserve locale through auth redirects, tenant links, filters, and admin navigation so language does not reset during normal browsing.
- Add `hreflang`, sitemap alternates, and a visible locale switcher after the content model is ready for full production localization.

Admin-editable config should include:

- tenant name, branding, locale, and public copy;
- category lists and the fixed MVP status set presentation labels;
- voting-window entries and scope assignments;
- moderation thresholds, review-routing settings, and safe feature flags;
- tenant hostname mappings within approved platform domains.

Code or environment-only config should include:

- database URLs, Redis URLs, JWT signing secrets, email provider credentials, and third-party API keys;
- base platform domains, ingress controller wiring, and wildcard DNS setup;
- rate-limit backend selection, cache driver selection, and build-time feature gates;
- observability sinks, secret references, and infrastructure credentials.

## Module And Component Strategy

- Organize code by domain modules instead of scattering logic by route only.
- Keep each module responsible for schema, repository/query functions, service logic, validation, and tests.
- Share Zod schemas between form validation and API validation where practical.
- Put reusable UI primitives and app-specific components in a shared component layer.
- Avoid duplicating vote controls, promise cards, status badges, table filters, source displays, and admin form patterns across pages.
- Keep tenant resolution, authorization, auditing, and rate limiting as reusable middleware/service helpers.

Suggested early module boundaries:

- `tenants`: hostname resolution, tenant config, branding, feature flags.
- `alliances`: alliance records, timeline membership, display labels, and alliance-aware filters.
- `promises`: promise records, status, browse/search queries.
- `sources`: source links, quotes, verification metadata.
- `voting`: current votes, vote events, aggregate counts, voting windows.
- `moderation`: registration review, trust score, abuse flags, review queues.
- `audit`: immutable admin and system action logs.
- `auth`: sessions, account states, permissions.

Suggested service boundaries after the split:

- `web`: pages, admin UI, API client, session bootstrap, and SSR/edge concerns.
- `api`: authenticated write paths, OpenAPI spec generation, validation, and backend orchestration.
- `worker`: snapshots, reconciliation, imports, and other asynchronous jobs.

## Tenant And Subdomain Strategy

- Resolve tenant from request hostname first.
- Support local development hostnames such as `tamilnadu.localhost` or path-based fallbacks if wildcard local DNS is inconvenient.
- Store tenant slug and hostname mappings in the database.
- Use tenant id in all tenant-scoped tables and repository queries.
- Keep tenancy row-based for MVP, with shared platform tables and strict tenant scoping in repositories, services, and tests.
- Use `tenantSlug.track-promises.com` as the canonical production pattern and `tenantSlug.track-promises.localhost` as the local pattern.
- Add authorization checks so tenant admins can only manage their own tenant unless they have platform-admin privileges.
- Configure Kubernetes ingress for wildcard hosts using the canonical production domain pattern.

## Vote Write Path

1. Authenticate user and verify voting permission.
2. Resolve the applicable voting window.
3. Reject the vote if the window is frozen or closed.
4. Upsert the current vote inside a database transaction.
5. Append an immutable vote event in the same transaction.
6. Update cached aggregate counters or enqueue an aggregate update.
7. Return canonical current vote and aggregate totals.

## Performance Strategy

- Cache anonymous public pages through CDN or Next.js caching.
- Keep vote writes short and transactional.
- Use Redis for hot counts and rate limits, but keep PostgreSQL as the source of truth.
- Generate vote snapshots asynchronously.
- Reconcile cached counters against canonical vote rows on a schedule.
- Add targeted indexes for browse filters and vote lookup paths.
- Partition very large historical tables by time or election cycle when needed.
- Use read replicas for public browsing and analytics-heavy queries as traffic grows.
- Cache resolved tenant config and public tenant home pages aggressively.
- Keep tenant id in major indexes so high-volume tenants can query efficiently.

## Initial Indexing Plan

- `votes`: unique `(promise_id, user_id)`.
- `votes`: `(promise_id, updated_at)`.
- `vote_events`: `(promise_id, created_at)`.
- `vote_snapshots`: `(promise_id, snapshot_at)`.
- `promises`: `(tenant_id, jurisdiction, timeline_slug, alliance_id)` or equivalent campaign scope.
- `promises`: `(tenant_id, category, status)`.
- `promises`: full-text index on title and description.
- `alliances`: unique `(tenant_id, timeline_slug, slug)`.
- `tenant_configs`: unique `(tenant_id, config_key)`.
- `moderation_reviews`: `(tenant_id, status, created_at)`.

## Observability

- Track vote latency, vote failures, duplicate vote conflicts, and freeze-window rejects.
- Track cache hit rate and CDN behavior for public pages.
- Track database lock time and slow queries.
- Track queue lag for snapshots and reconciliation.
- Track counter drift between cached aggregates and canonical database rows.
- Track tenant resolution failures and unknown hostnames.
- Track account verification funnel, moderation queue age, and suspicious voting patterns.

## Local Development Plan

- Use Docker Compose for `web` and PostgreSQL by default and Redis behind an optional `cache` profile.
- Add a dedicated `api` service to Compose as the next architecture step; keep the current monolithic `web` container documented as transitional.
- Add a worker container once snapshot and reconciliation jobs move out of ad hoc scripts.
- Add app environment examples for database URL, auth secrets, tenant hostnames, and feature flags.
- Provide seed scripts for local tenants such as `tamilnadu` and a small promise set.
- Keep app source runnable outside Docker if a developer prefers local Node.js, but Docker Compose should be the documented default for dependencies.

## Kubernetes And Helm Plan

- Add a Helm chart for the web app, API service, worker process, ingress, config maps, secrets references, and service accounts.
- Prefer managed PostgreSQL and managed Redis; do not run production databases inside the first app Helm chart.
- Support separate values files for local-like, staging, and production deployments: `values-local.yaml`, `values-staging.yaml`, and `values-production.yaml`.
- Use local-like values for developer clusters or ephemeral previews, staging for integration testing under `staging.track-promises.com`, and production for `track-promises.com` plus wildcard tenant hosts.
- Configure readiness/liveness probes for web and worker pods.
- Add horizontal pod autoscaling values for web pods, API pods, and worker pods.
- Add ingress values for wildcard tenant hosts and canonical platform host.
- Keep sensitive values out of Git and reference Kubernetes secrets or external secret operators.

## Decisions Fixed For MVP

- Target a split runtime of `web`, `api`, and `worker` in one repo; treat the current monolithic Next.js runtime as a transitional implementation state.
- Use DigitalOcean Kubernetes for the app runtime, Neon PostgreSQL for the primary database, and Upstash Redis when Redis-backed features are enabled.
- Model vote semantics as delivery-stage assessments and allow switching between stage values while voting is open.
- Resolve voting windows by specificity: promise, election/campaign, tenant/jurisdiction, then platform default.
- Use the status set `planned`, `in_progress`, `fulfilled`, `delayed`, and `disputed`.
- Keep tenant data row-scoped in shared tables for MVP.
- Use `tenantSlug.track-promises.com` as the canonical production host pattern.
- Prefer JWT-based auth for now and do not adopt Keycloak during MVP.

## Decisions Deferred After MVP

- Whether a dedicated identity service such as Keycloak or Authentik is justified by SSO, federation, or delegated identity administration.
- Whether very large tenants should move to separate databases or schemas.
