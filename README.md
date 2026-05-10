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

Start with a focused MVP: promise records, source links, authentication, voting, voting-window rules, aggregate counts, and admin promise management. Use Next.js, TypeScript, PostgreSQL, Drizzle, Auth.js, Docker Compose for local development, and a cache-ready design that can add Redis when traffic or rate limiting needs justify it.

The implementation should be deployable to Kubernetes with Helm. Add snapshots, richer audit tools, search, moderation, tenant-specific subdomains, and scaling layers in phases.

## Current Scaffold

The repository now includes a runnable initial slice with:

- Next.js App Router and Tailwind foundation;
- tenant-aware promise list and detail pages;
- config resolution with platform defaults plus tenant overrides;
- Auth.js-backed demo sign-in with verified, limited, moderator, editor, and platform-admin accounts;
- local in-memory voting flow with freeze-window enforcement and immutable vote events;
- admin-only promise creation with reusable filter and form components;
- Drizzle schema, migration generation, and seed scripts for PostgreSQL foundation work;
- focused unit tests for config resolution, voting rules, and tenant host parsing;
- Docker Compose for PostgreSQL and optional Redis;
- a starter Helm chart for Kubernetes deployment.

## Local Development

1. Install dependencies with `npm install`.
2. Start local dependencies with `docker compose up -d`.
3. Copy `.env.example` to `.env.local` and update secrets if needed.
4. Generate database migrations with `npm run db:generate`.
5. Run the app with `npm run dev`.
6. Run tests with `npm test`, lint with `npm run lint`, and build with `npm run build`.

Demo accounts for local sign-in:

- `demo@track-promises.local` / `demo-password`
- `editor@track-promises.local` / `editor-password`
- `moderator@track-promises.local` / `moderator-password`
- `admin@track-promises.local` / `admin-password`
- `limited@track-promises.local` / `limited-password`

Path-based tenant routes work immediately, for example `http://localhost:3000/tamilnadu`.
Host-based tenant routing also works through middleware when using a host such as `http://tamilnadu.localhost:3000`.

## Repo-Local LLM Notes

The built-in Copilot memory store used by this workspace lives outside the repository and is not relocated by editing project files.

For repository-specific scratch notes, prompts, or exported memory snapshots, use `.llm/` at the repo root:

- `.llm/README.md` documents the convention.
- Everything else under `.llm/` is gitignored.
- A practical pattern is to copy durable notes from the external memory store into `.llm/memories/` when you want local, repo-bound context without committing it.
