# Copilot Instructions

## Product Context

Track Promises is a civic accountability app for tracking political promises, their sources, status changes, and public voting sentiment.
Use the planning documents in `docs/` as the source of truth for product scope and architecture direction:

- `docs/PRD.md`
- `docs/TECHNICAL_FOUNDATION.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/TODO.md`

## NOTES

- update TODO list, make git commits along the way

## Current Stack And Shape

- Next.js App Router with TypeScript.
- Tailwind CSS for styling.
- Reusable domain modules under `src/modules/`.
- Reusable components under `src/components/`.
- Local development dependencies in `docker-compose.yml`.
- Kubernetes + Helm deployment configs under `deploy/`.

## Infrastructure / Deployment Environment

| Machine  | Role             | Notes                                                                         |
| -------- | ---------------- | ----------------------------------------------------------------------------- |
| m4studio | Development host | Runs local docker compose stack; issues `kubectl`/`helm` commands against m1s |
| m1studio | K8s cluster      | Docker Desktop Kubernetes; receives external traffic                          |

**Traffic path:** Cloudflare DNS → Cloudflare Tunnel → m1studio → docker-desktop k8s nginx-ingress

- Production namespace: `track-promises-prod`
- Container images: `ghcr.io/eduluma/track-promises-web` and `ghcr.io/eduluma/track-promises-api`
- TLS: cert-manager with `letsencrypt-prod` ClusterIssuer
- Image pull: `regcred` secret in `track-promises-prod` (points at `ghcr.io`)
- Production URLs: `trackpromises.eduluma.org` (web), `trackpromises-api.eduluma.org` (API)
- DNS: all subdomains are 1-level under eduluma.org — covered by Cloudflare `*.eduluma.org` Universal SSL
- Production URLs: `trackpromises.eduluma.org` (web), `trackpromises-api.eduluma.org` (API)
- DNS note: all subdomains are 1-level under eduluma.org — covered by Cloudflare `*.eduluma.org` Universal SSL

## Implementation Guidance

- Keep the app config-driven wherever practical.
- Do not hard-code one tenant, jurisdiction, or election into business logic.
- Prefer reusable domain logic in `src/modules/` over route-local duplication.
- Keep tenant routing, permissions, and voting rules centralized.
- Treat PostgreSQL as the future source of truth even when using temporary local scaffolding.
- Preserve auditability for votes, status changes, moderation actions, and admin edits.
- Avoid storing government identity documents or similarly sensitive records for MVP.
- Prefer small, testable changes that move the current implementation slice forward.
- Update `docs/TODO.md` as we progress so completed and newly clarified work stays reflected in the roadmap.

## Working Norms

- Before larger changes, read the nearby planning docs and existing implementation surface.
- When adding features, also add or update focused tests where practical.
- Validate changes with the narrowest useful command first, then use broader validation as needed.
- Keep documentation in sync when local development steps, architecture direction, or workflow conventions change.
- Use `.llm/` only for repo-local scratch notes that should remain uncommitted.

## Validation Commands

- `npm test`
- `npm run lint`
- `npm run build`
