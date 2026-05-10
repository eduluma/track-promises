# Track Promises

Track Promises is a civic accountability web app for collecting public political promises, tracking their progress, and letting registered users submit delivery-stage assessments for each promise.

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
- timeline-aware public URLs such as `/{jurisdiction}/{timeline}` so a state or country can have separate election or term workspaces;
- compact delivery-stage assessments by registered users, from not started through completed;
- one current vote per user per promise, with the ability to change that vote until voting is frozen;
- immutable vote history and periodic completion snapshots for auditability;
- config-driven behavior for jurisdictions, voting windows, moderation rules, feature flags, and tenant branding;
- reusable modules and components so promise, voting, source, moderation, and admin workflows stay DRY;
- government or jurisdiction-specific tenant entry points such as `tamilnadu.track-promises.com`;
- optional timeline overview content loaded from repo files such as `content/timelines/tamilnadu/2026/README.md` or `content/timelines/india/2029/index.html`;
- performance-first browsing, filtering, and aggregation for high-traffic periods.

## Initial Build Direction

Start with a focused MVP: promise records, source links, authentication, voting, voting-window rules, aggregate counts, and admin promise management. Use Next.js for the web app, a separate TypeScript API service, PostgreSQL, Drizzle, JWT-based auth, Docker Compose for local development, and a cache-ready design that can add Redis when traffic or rate limiting needs justify it.

The implementation should be deployable to Kubernetes with Helm. Add snapshots, richer audit tools, search, moderation, tenant-specific subdomains, and scaling layers in phases.

## Architecture Direction

- Preferred runtime shape is `web + api + worker` in a single repo.
- The current codebase now includes a separate Fastify API service and thin Next.js route adapters as a transitional bridge, not the long-term API boundary.
- The target API service should own write paths, OpenAPI generation, and backend business workflows.
- For auth, prefer JWT bearer tokens for the near term and keep identity provider integration lightweight.
- Do not introduce Keycloak in MVP unless we specifically need external SSO, federation, or centralized identity administration.
- If that need appears later, evaluate Keycloak or Authentik as a dedicated identity service rather than baking identity logic into the app containers.
- Because the current reads still use process-local in-memory stores, the web app defaults to a local typed API transport for now; flipping the web runtime to remote API transport is a separate cutover step once those reads move behind shared persistence or API-backed reads.

## Current Scaffold

The repository now includes a runnable initial slice with:

- Next.js App Router and Tailwind foundation;
- tenant-aware promise list and detail pages;
- config resolution with platform defaults plus tenant overrides;
- Auth.js-backed demo sign-in with verified, limited, moderator, editor, and platform-admin accounts in the current transitional implementation;
- a separate Fastify API service for vote, promise creation, and moderation-review write paths;
- timeline-aware public pages and promise detail routes using `/{jurisdiction}/{timeline}/promises/{unique-id}`;
- local in-memory delivery-stage assessment flow with freeze-window enforcement and immutable vote events;
- admin-only promise creation with reusable filter and form components;
- vote snapshot capture, aggregate reconciliation, and historical delivery-progress charts;
- admin audit views plus moderator review workflow and trust-score signals;
- CSV import tooling for promise backfills;
- Drizzle schema, migration generation, and seed scripts for PostgreSQL foundation work;
- focused unit tests for config resolution, voting rules, and tenant host parsing;
- Docker Compose for the web app, API service, PostgreSQL, and optional Redis;
- a starter Helm chart for Kubernetes deployment.

The current runnable stack is in a transition phase: a dedicated `api` service exists, but the `web` runtime still uses local typed API handlers by default until read paths stop depending on process-local state. That keeps behavior correct while the API boundary is being moved for real.

## Local Development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`; the task commands source that file before running Docker Compose.
3. Start the app stack with `task up` so local database migrations are applied before the app services come up.
4. Open `http://localhost:3300` to see the app.
5. The Compose stack publishes the web app on `localhost:3300`, the API service on `localhost:4300`, and PostgreSQL on `localhost:5440`; PostgreSQL and Redis still stay on the internal Docker network for app-to-app traffic. Override `APP_PORT`, `API_PORT`, or `DB_PORT` in `.env` if those ports are occupied on your machine, then keep using those same values for local commands.
6. Check the API service with `http://localhost:4300/health`.
7. Browse generated API docs at `http://localhost:4300/docs` and regenerate the checked-in spec with `npm run api:openapi`.
8. Run `npm run worker:snapshots` and `npm run job:reconcile-votes` when you want to refresh historical vote artifacts locally.
9. Use `npm run import:promises -- --file path/to/promises.csv --tenant tamilnadu` for CSV promise imports.
10. Run the API service directly outside Compose with `npm run api:dev`.
11. Run tests with `npm test`, lint with `npm run lint`, and build with `npm run build`.
12. Use `task compose:migrate` to apply migrations manually, `task compose:down` to stop the stack, and `task --list-all` to see the available local automation tasks.

Demo accounts for local sign-in:

- `demo@track-promises.local` / `demo-password`
- `editor@track-promises.local` / `editor-password`
- `moderator@track-promises.local` / `moderator-password`
- `admin@track-promises.local` / `admin-password`
- `limited@track-promises.local` / `limited-password`

Path-based tenant routes work immediately, for example `http://localhost:3300/tamilnadu/2026`.
Host-based tenant routing also works through middleware when using a host such as `http://tamilnadu.localhost:3300`.

## Repo-Local LLM Notes

The built-in Copilot memory store used by this workspace lives outside the repository and is not relocated by editing project files.

For repository-specific scratch notes, prompts, or exported memory snapshots, use `.llm/` at the repo root:

- `.llm/README.md` documents the convention.
- Everything else under `.llm/` is gitignored.
- A practical pattern is to copy durable notes from the external memory store into `.llm/memories/` when you want local, repo-bound context without committing it.
