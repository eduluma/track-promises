# Product Requirements Document

## 1. Product Summary

Track Promises is a public accountability platform for political promises. It helps people browse promises made by candidates, alliances, parties, or elected officials, inspect the sources behind those promises, submit delivery-stage assessments, and track fulfillment over time.

The first product should be simple, trustworthy, and scalable: a searchable promise database, authenticated delivery-stage assessments, transparent source records, and historical vote/status tracking.

## 2. Problem Statement

Political leaders often make many promises before and during their time in office. Near the end of a term, those same leaders may claim that promises were fulfilled, but the public usually lacks a structured, source-backed way to verify or challenge that claim.

Track Promises should reduce that ambiguity by creating a durable public record for each promise, its sources, its status, and public sentiment around it.

## 3. Goals

- Build a reliable public database of political promises.
- Let registered users submit a delivery-stage assessment for each promise based on what has actually been delivered.
- Allow users to change their vote until a configured freeze date.
- Preserve immutable vote history and aggregate snapshots for later review.
- Support public browsing during traffic spikes without overloading the primary database.
- Create a foundation that can grow to millions of records and visits.
- Make product behavior config-driven wherever practical, including jurisdictions, voting windows, feature flags, moderation thresholds, and tenant branding.
- Support jurisdiction or government-specific subdomains using the canonical production pattern `tenantSlug.track-promises.com` and the local development pattern `tenantSlug.track-promises.localhost`.
- Keep implementation modular and reusable so core promise, voting, source, admin, and moderation flows are not duplicated.

## 4. Non-Goals For MVP

- Full social networking features such as feeds, followers, direct messages, or comments.
- Complex machine-learning based promise scoring.
- Real-time collaborative editing.
- Native mobile apps.
- Public API access.
- Advanced moderation workflows beyond basic admin/editor controls.

## 5. Primary Users

- Public visitors who browse promises and vote counts.
- Registered voters/users who cast or change votes.
- Editors/admins who add promises, sources, and status updates.
- Researchers, journalists, and civic groups who need source-backed historical records.
- Tenant administrators who manage a government, state, jurisdiction, or election-specific workspace.
- Moderators who help review registrations, suspicious accounts, sources, and promise disputes.

## 6. Core User Stories

- As a visitor, I can browse promises by state or jurisdiction, election year or timeline, alliance, category, status, and person/party.
- As a visitor, I can open a promise detail page and see the claim, source links, current status, vote totals, and update history.
- As a registered user, I can submit one current delivery-stage assessment for a promise.
- As a registered user, I can change my vote while the voting window is open.
- As a registered user, I can see whether voting is open, frozen, or closed.
- As an admin/editor, I can create and edit promise records.
- As an admin/editor, I can attach source links and quoted excerpts to a promise.
- As an admin/editor, I can update the status of a promise while preserving status history.
- As a researcher, I can review historical vote snapshots after voting has been frozen.
- As a tenant administrator, I can configure jurisdiction branding, voting windows, categories, and status labels without code changes where possible.
- As a visitor, I can access jurisdiction-specific pages through a subdomain such as `tamilnadu.track-promises.com`.
- As a moderator, I can review suspicious registrations or account activity before a user receives full voting privileges.
- As a registered user, I can build trust over time through verified account signals and constructive participation without requiring the platform to store sensitive government identity records.

## 7. Functional Requirements

### Promise Records

- Store title, description, category, state or jurisdiction, election/campaign, election year or timeline, alliance, person/party, status, and timestamps.
- Link each promise to a single tenant, state or jurisdiction, election timeline, and alliance so the same state-year election can hold multiple alliances with separate manifestos and promise sets.
- Attach one or more source records with URL, publisher, quote/excerpt, captured date, and verification metadata.
- Maintain status history when a promise changes state.

### Voting

- Voting represents the public's current assessment of what delivery stage a promise has reached.
- Require authentication and verified email before voting.
- Allow exactly one current vote per user per promise.
- Support vote values of `not_started`, `started`, `in_progress`, `mostly_done`, and `completed`.
- Allow a user to switch between delivery-stage assessments while the voting window is open, but do not allow self-service vote removal to a neutral state in MVP.
- Enforce one effective voting window per promise using this precedence order: promise override, election/campaign override, tenant/jurisdiction default, then platform default.
- Freeze voting at the configured time while preserving public access to totals and history.
- Append an immutable vote event whenever a vote is created or changed.

### Registration, Verification, And Moderation

- Avoid storing government identity documents or sensitive government records unless a future legal/privacy review explicitly approves it.
- Require verified email before voting and combine it with account-state checks and rate limits.
- Support account states of `pending`, `verified`, `limited`, `suspended`, and `moderator_approved`.
- Use a lightweight trust score for review priority and future privileges, with signals from account age, stable voting history, moderator decisions, and abuse flags.
- Support a probation or limited-voting state for suspicious accounts, velocity anomalies, or unresolved review flags.
- Allow tenant moderators and platform admins to review suspicious accounts, bot-like voting patterns, and abuse reports, while editors remain content-focused.
- Preserve account and moderation audit trails without exposing sensitive data publicly.

### Configuration And Tenancy

- Store configurable product behavior in database-backed or file-backed configuration rather than hard-coded constants where practical.
- Support tenant/jurisdiction configuration for name, slug, domain/subdomain, branding, locale, categories, promise statuses, voting windows, moderation thresholds, and safe feature flags.
- Resolve tenant context from hostnames such as `tamilnadu.track-promises.com`, local hostnames such as `tamilnadu.track-promises.localhost`, or path-based fallbacks when local wildcard DNS is inconvenient.
- Keep global platform defaults with per-tenant overrides.
- Keep tenant data in shared platform tables for MVP, with strict `tenant_id` scoping in repositories, services, and tests.
- Ensure tenant isolation in queries so records for one jurisdiction are not accidentally shown or modified under another tenant.

### Aggregates And History

- Show stage counts, weighted completion percentage, dominant stage, and the user's current assessment.
- Store periodic completion snapshots for historical review.
- Provide reconciliation between current votes, event history, cached counters, and snapshots.

### Admin/Editor Tools

- Create, update, and archive promise records, with creation limited to admins and editors in MVP.
- Manage source links and verification status.
- Manage promise status and status history.
- View audit logs for sensitive actions.
- Manage tenant-level configuration when authorized.
- Review registration, verification, and moderation queues.

### Discovery

- Browse and filter by state or jurisdiction, election year or timeline, alliance, category, status, person/party, and source.
- Search promise titles and descriptions.
- Sort by recent activity, highest completion estimate, most disputed, and newest.

### Alliance-Aware Election Modeling

- A single state-year election timeline such as Tamil Nadu 2026 may contain multiple alliances.
- Each alliance may publish many promises, and each promise should belong to exactly one alliance within that timeline.
- Alliance membership should remain editable because parties may regroup between elections.
- Promise pages and admin workflows should surface the alliance alongside the state and election year so users can immediately understand campaign context.

## 8. Non-Functional Requirements

- Public read pages should be cacheable through CDN or framework-level caching.
- Vote writes must be transactional and idempotent where practical.
- The voting path should avoid long-running synchronous work.
- The first-party web app should be able to consume a documented service contract from a separately deployable API service.
- The data model should support millions of promises, votes, vote events, and snapshots.
- The system should support rate limiting, bot protection, and abuse monitoring.
- Admin actions and vote changes should be auditable.
- Observability should include latency, error rates, queue lag, cache hit rate, and aggregate drift.
- Core business behavior should be configurable and validated, not scattered across hard-coded UI/API logic.
- Code should be organized around reusable modules, shared validation schemas, and shared UI components.
- Local development should run through Docker Compose for app dependencies.
- Production deployment should target Kubernetes with Helm charts.
- Tenant routing and subdomain handling should work behind ingress, CDN, and local development hostnames.

## 9. Success Metrics

- Public promise pages load quickly under normal and burst traffic.
- Voting succeeds reliably without duplicate votes per user/promise.
- Historical snapshots can be reconstructed and explained.
- Admins can add and update promises without engineering support.
- Search and filters remain responsive as record counts grow.

## 10. Resolved MVP Decisions

- Vote meaning: each vote captures the public's assessment of the current delivery stage, not a simple thumbs up/down sentiment.
- Vote lifecycle: users can switch between delivery-stage assessments while voting is open, but they cannot remove a vote to neutral in MVP.
- Voting-window scope: resolve the effective window by specificity using promise, election/campaign, tenant/jurisdiction, then platform defaults.
- MVP promise statuses: `planned`, `in_progress`, `fulfilled`, `delayed`, and `disputed`.
- Promise creation: only admins and editors can create promises in MVP.
- Tenant model: use shared platform tables with strict row-based tenant scoping for MVP.
- Production tenant host pattern: `tenantSlug.track-promises.com`, with `tenantSlug.track-promises.localhost` for local development.
- Verification model: verified email is the minimum requirement for voting; trust score and review flags adjust account state rather than replacing account-state checks.
- Target runtime architecture: separate `web`, `api`, and `worker` services in one repo, even while the current scaffold is still in transition.
- Auth direction: use JWT-based API authentication for now and defer Keycloak or another dedicated identity provider until SSO or federation is a real requirement.

## 11. Deferred Questions Beyond This Phase

- When trusted community contributors should be allowed to submit promises or sources.
- How disputed fulfillment claims should escalate beyond the initial moderator and editor workflow.
- Whether large tenants should eventually move from shared row-based tenancy to separate databases or schemas.
