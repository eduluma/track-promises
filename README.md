# Track Promises

Track Promises is a civic accountability web app for collecting public political promises, tracking their progress, and letting registered users vote on public sentiment around each promise.

The product should be designed for high-traffic public browsing, bursty voting activity, and long-lived historical records. The foundation must support millions of visits and millions of promise, vote, and audit records without forcing an early rewrite.

## Planning Docs

- [Product Requirements Document](docs/PRD.md)
- [Technical Foundation](docs/TECHNICAL_FOUNDATION.md)
- [Roadmap and TODOs](docs/TODO.md)
- [Implementation Handoff Plan](docs/IMPLEMENTATION_PLAN.md)

## Core Idea

Political candidates and elected officials make promises during campaigns and while in office. Later, it can be difficult for the public to verify whether those promises were fulfilled, delayed, broken, or disputed.

Track Promises will provide:

- a public promise database with source links and status history;
- StackOverflow-style up/down voting by registered users;
- one current vote per user per promise, with the ability to change that vote until voting is frozen;
- immutable vote history and periodic snapshots for auditability;
- config-driven behavior for jurisdictions, voting windows, moderation rules, feature flags, and tenant branding;
- reusable modules and components so promise, voting, source, moderation, and admin workflows stay DRY;
- government or jurisdiction-specific tenant entry points such as `tamilnadu.track-promises.com`;
- performance-first browsing, filtering, and aggregation for high-traffic periods.

## Initial Build Direction

Start with a focused MVP: promise records, source links, authentication, voting, voting-window rules, aggregate counts, and admin promise management. Use Next.js for the web app, a separate TypeScript API service, PostgreSQL, Drizzle, JWT-based auth, Docker Compose for local development, and a cache-ready design that can add Redis when traffic or rate limiting needs justify it.

The implementation should be deployable to Kubernetes with Helm. Add snapshots, richer audit tools, search, moderation, tenant-specific subdomains, and scaling layers in phases.

## Architecture Direction

- Preferred runtime shape is `web + api + worker` in a single repo.
- The current codebase still contains Next.js route handlers as a transitional implementation detail, not the long-term API boundary.
- The target API service should own write paths, OpenAPI generation, and backend business workflows.
- For auth, prefer JWT bearer tokens for the near term and keep identity provider integration lightweight.
- Do not introduce Keycloak in MVP unless we specifically need external SSO, federation, or centralized identity administration.
- If that need appears later, evaluate Keycloak or Authentik as a dedicated identity service rather than baking identity logic into the app containers.

## Current Scaffold

The repository now includes a runnable initial slice with:

- Next.js App Router and Tailwind foundation;
- tenant-aware promise list and detail pages;
- config resolution with platform defaults plus tenant overrides;
- Auth.js-backed demo sign-in with verified, limited, moderator, editor, and platform-admin accounts in the current transitional implementation;
- local in-memory voting flow with freeze-window enforcement and immutable vote events;
- admin-only promise creation with reusable filter and form components;
- vote snapshot capture, aggregate reconciliation, and historical sentiment charts;
- admin audit views plus moderator review workflow and trust-score signals;
- CSV import tooling for promise backfills;
- Drizzle schema, migration generation, and seed scripts for PostgreSQL foundation work;
- focused unit tests for config resolution, voting rules, and tenant host parsing;
- Docker Compose for the web app, PostgreSQL, and optional Redis;
- a starter Helm chart for Kubernetes deployment.

The current runnable stack is still a transitional monolith at runtime: the `web` container serves both pages and API routes today. The docs now treat that as an interim state on the way to a dedicated API service.

## Local Development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` if you want to override ports or secrets.
3. Start the app stack with `docker compose up`.
4. Open `http://localhost:43000` to see the app.
5. The Compose stack publishes only the web app on `localhost:43000`; PostgreSQL and Redis stay on the internal Docker network to avoid host-port collisions. Override `APP_PORT` if `43000` is occupied on your machine.
6. Run `npm run worker:snapshots` and `npm run job:reconcile-votes` when you want to refresh historical vote artifacts locally.
7. Use `npm run import:promises -- --file path/to/promises.csv --tenant tamilnadu` for CSV promise imports.
8. Run tests with `npm test`, lint with `npm run lint`, and build with `npm run build`.

Demo accounts for local sign-in:

- `demo@track-promises.local` / `demo-password`
- `editor@track-promises.local` / `editor-password`
- `moderator@track-promises.local` / `moderator-password`
- `admin@track-promises.local` / `admin-password`
- `limited@track-promises.local` / `limited-password`

Path-based tenant routes work immediately, for example `http://localhost:43000/tamilnadu`.
Host-based tenant routing also works through middleware when using a host such as `http://tamilnadu.localhost:43000`.

## Repo-Local LLM Notes

The built-in Copilot memory store used by this workspace lives outside the repository and is not relocated by editing project files.

For repository-specific scratch notes, prompts, or exported memory snapshots, use `.llm/` at the repo root:

- `.llm/README.md` documents the convention.
- Everything else under `.llm/` is gitignored.
- A practical pattern is to copy durable notes from the external memory store into `.llm/memories/` when you want local, repo-bound context without committing it.
