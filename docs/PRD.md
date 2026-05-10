# Product Requirements Document

## 1. Product Summary

Track Promises is a public accountability platform for political promises. It helps people browse promises made by candidates or elected officials, inspect the sources behind those promises, vote on public sentiment, and track fulfillment over time.

The first product should be simple, trustworthy, and scalable: a searchable promise database, authenticated up/down voting, transparent source records, and historical vote/status tracking.

## 2. Problem Statement

Political leaders often make many promises before and during their time in office. Near the end of a term, those same leaders may claim that promises were fulfilled, but the public usually lacks a structured, source-backed way to verify or challenge that claim.

Track Promises should reduce that ambiguity by creating a durable public record for each promise, its sources, its status, and public sentiment around it.

## 3. Goals

- Build a reliable public database of political promises.
- Let registered users upvote or downvote each promise based on their current assessment.
- Allow users to change their vote until a configured freeze date.
- Preserve immutable vote history and aggregate snapshots for later review.
- Support public browsing during traffic spikes without overloading the primary database.
- Create a foundation that can grow to millions of records and visits.
- Make product behavior config-driven wherever practical, including jurisdictions, voting windows, feature flags, moderation thresholds, and tenant branding.
- Support jurisdiction or government-specific subdomains, such as `tamilnadu.track-promises.com`, with the final domain name still undecided.
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

- As a visitor, I can browse promises by election, jurisdiction, category, status, and person/party.
- As a visitor, I can open a promise detail page and see the claim, source links, current status, vote totals, and update history.
- As a registered user, I can upvote or downvote a promise once.
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

- Store title, description, category, jurisdiction, election/campaign, person/party, status, and timestamps.
- Attach one or more source records with URL, publisher, quote/excerpt, captured date, and verification metadata.
- Maintain status history when a promise changes state.

### Voting

- Require authentication and verified email before voting.
- Allow exactly one current vote per user per promise.
- Support vote values of upvote and downvote.
- Allow a user to change their vote while the voting window is open.
- Enforce configurable voting windows at global, election, jurisdiction, or promise level.
- Freeze voting at the configured time while preserving public access to totals and history.
- Append an immutable vote event whenever a vote is created or changed.

### Registration, Verification, And Moderation

- Avoid storing government identity documents or sensitive government records unless a future legal/privacy review explicitly approves it.
- Require basic account verification before voting, starting with verified email and rate limits.
- Design for StackOverflow-style trust and moderation signals, such as account age, reputation/trust score, voting history, reviewer approvals, and abuse flags.
- Support a probation or limited-voting state for new or suspicious accounts.
- Allow moderators/admins to review suspicious accounts, bot-like voting patterns, and abuse reports.
- Preserve account and moderation audit trails without exposing sensitive data publicly.

### Configuration And Tenancy

- Store configurable product behavior in database-backed or file-backed configuration rather than hard-coded constants where practical.
- Support tenant/jurisdiction configuration for name, slug, domain/subdomain, branding, locale, categories, promise statuses, voting windows, and feature flags.
- Resolve tenant context from hostnames such as `tamilnadu.track-promises.com`, path-based fallbacks, or admin-selected tenant context.
- Keep global platform defaults with per-tenant overrides.
- Ensure tenant isolation in queries so records for one jurisdiction are not accidentally shown or modified under another tenant.

### Aggregates And History

- Show upvote count, downvote count, score, and user's current vote.
- Store periodic vote snapshots for historical review.
- Provide reconciliation between current votes, event history, cached counters, and snapshots.

### Admin/Editor Tools

- Create, update, and archive promise records.
- Manage source links and verification status.
- Manage promise status and status history.
- View audit logs for sensitive actions.
- Manage tenant-level configuration when authorized.
- Review registration, verification, and moderation queues.

### Discovery

- Browse and filter by jurisdiction, election, category, status, person/party, and source.
- Search promise titles and descriptions.
- Sort by recent activity, highest score, most disputed, and newest.

## 8. Non-Functional Requirements

- Public read pages should be cacheable through CDN or framework-level caching.
- Vote writes must be transactional and idempotent where practical.
- The voting path should avoid long-running synchronous work.
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

## 10. Open Product Decisions

- Should voting represent public sentiment about fulfillment, trustworthiness, priority, or agreement?
- Should users be able to remove a vote entirely, or only switch between up/down?
- Should freeze dates be configured per election, promise, jurisdiction, or all of the above?
- What are the exact promise statuses for MVP?
- Who can create promises: only admins/editors, or trusted community contributors later?
- How should disputed fulfillment claims be reviewed?
- What trust score or reputation rules should grant voting, moderation, or review privileges?
- What signals are acceptable for real-user verification without storing sensitive government identity records?
- Should each government/jurisdiction tenant have fully separate data boundaries or shared platform tables with strict tenant scoping?
- What is the final production domain pattern for tenant subdomains?
