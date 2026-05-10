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
- government or jurisdiction-specific tenant entry points such as `tamilnadu.track-promises.com`, with the final domain still to be confirmed;
- performance-first browsing, filtering, and aggregation for high-traffic periods.

## Initial Build Direction

Start with a focused MVP: promise records, source links, authentication, voting, voting-window rules, aggregate counts, and admin promise management. Use Next.js, TypeScript, PostgreSQL, Drizzle, Auth.js, Docker Compose for local development, and a cache-ready design that can add Redis when traffic or rate limiting needs justify it.

The implementation should be deployable to Kubernetes with Helm. Add snapshots, richer audit tools, search, moderation, tenant-specific subdomains, and scaling layers in phases.
