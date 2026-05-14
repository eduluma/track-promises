# Roles and Access Control

## Overview

Every user record carries two independent attributes:

| Attribute       | Type           | Default      |
| --------------- | -------------- | ------------ |
| `role`          | `UserRole`     | `user`       |
| `state`         | `AccountState` | `unverified` |
| `emailVerified` | boolean        | `false`      |

**Role** controls what actions a user may perform.
**State** controls whether the account is in good standing (e.g. eligible to vote).
Both are enforced in `src/lib/permissions.ts` and embedded into the NextAuth JWT/session.

---

## Roles (`UserRole`)

### `guest` — Unregistered Voter

Not a registered user — represents anonymous or session-only vote tracking.

- Can vote on promises without creating an account.
- Votes are stored as `unregistered-user-votes` and attributed to a guest session.
- No access to any authenticated or admin-only features.
- Trust score is zero; votes may carry lower weight in aggregate scoring.

**Use-case:** Lowering the barrier to participation for first-time visitors. Particularly relevant for India-context deployments where requiring registration upfront loses engagement.

> Implementation of guest voting is planned — the `guest` role exists in the schema but the vote endpoint does not yet handle unauthenticated sessions.

---

### `user` — Verified Voter

The role assigned to every newly registered account once they complete verification.

- Can vote on promises (once `emailVerified = true` and `state` is `verified` or `moderator_approved`).
- Can view all public promise and timeline pages.
- Cannot create or edit promises, access moderation queues, or audit logs.

Voting eligibility is checked via `canUserVote()` — role alone is not enough; `state` must also pass.

---

### `promise_editor` — Promise Editor

Scoped to one or more tenants (via `tenantIds[]` on the user record).

- Can create, edit, and manage promises within their assigned tenant(s).
- Cannot approve moderation reviews or access audit logs.
- Cannot act on tenants they are not assigned to.

**Use-case:** A researcher or data-entry person maintaining the promise dataset for a single election tenant (e.g. Tamil Nadu 2026).

**Permission gate:** `canManagePromises()` — true for `promise_editor`, `tenant_admin`, `platform_admin`.

---

### `moderator` — Tenant Moderator

Scoped to one or more tenants (via `tenantIds[]`).

- Can view and action the moderation queue (`/admin/moderation`) for their tenant(s).
- Can approve or reject registrations flagged by the trust-score system.
- Can flag or escalate suspicious voting activity.
- Cannot edit promises or view the platform-wide audit log.

**Use-case:** A trusted community reviewer who vets new registrations and monitors vote anomalies for a specific election context.

**Permission gate:** `canReviewModeration()` — true for `moderator`, `tenant_admin`, `platform_admin`.

---

### `tenant_admin`

Full administrative control within their assigned tenant(s).

- Can do everything `promise_editor` and `moderator` can.
- Can configure tenant-level settings (voting windows, freeze rules, display config).
- Scoped strictly to their `tenantIds[]` — cannot cross into other tenants.

**Use-case:** The primary operator of a single election tenant, typically someone from the content or editorial team who owns that jurisdiction's data.

**Permission gates:** `canManagePromises()` + `canReviewModeration()` + `canAccessTenant()` (when `tenantIds` includes the requested tenant).

---

### `platform_admin` — Platform Admin

Unrestricted access across all tenants.

- All capabilities of `tenant_admin`, applied globally.
- Can view the platform-wide audit log (`/admin/audit`).
- Not restricted by `tenantIds[]` — `canAccessTenant()` returns `true` unconditionally.
- Intended for infrastructure/ops team members only.

**Use-case:** Developer, ops engineer, or superuser who needs to manage the entire platform, debug cross-tenant issues, or bootstrap new tenants.

**Permission gate:** All permission helpers return `true` for `platform_admin`.

---

## Account States (`AccountState`)

Account state is orthogonal to role. A user can have the `user` role but be `suspended`, which blocks voting.

| State                | Can Vote? | Notes                                                                                       |
| -------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `unverified`         | No        | Default after signup; awaiting email/OTP verification                                       |
| `verified`           | Yes       | Email verified and account passed trust checks                                              |
| `readonly`           | No        | Flagged for suspicious behavior; reduced trust score; view-only                             |
| `suspended`          | No        | Account administratively suspended                                                          |
| `moderator_approved` | Yes       | Manually approved by a moderator before email verification completes (edge-case onboarding) |

Voting eligibility: `emailVerified === true` AND `state` is `verified` or `moderator_approved`.

---

## Permission Helper Summary

Defined in [src/lib/permissions.ts](../src/lib/permissions.ts):

| Helper                  | Who passes                                         | Protects                       |
| ----------------------- | -------------------------------------------------- | ------------------------------ |
| `canUserVote()`         | `user`+ when `emailVerified` and state is valid    | Vote submission API            |
| `canManagePromises()`   | `promise_editor`, `tenant_admin`, `platform_admin` | Promise create/edit routes     |
| `canReviewModeration()` | `moderator`, `tenant_admin`, `platform_admin`      | `/admin/moderation`            |
| `canAccessTenant()`     | `platform_admin` or matching `tenantIds` entry     | All tenant-scoped admin routes |

---

## Signup / Registration

**No self-service signup flow exists yet.**
Auth is currently backed by NextAuth v4 with a credentials provider using an in-memory demo user list.

### Intended registration flow

Registration should be as frictionless as possible — a single identifier is enough to create an account:

| Identifier      | Use-case                                         |
| --------------- | ------------------------------------------------ |
| Email address   | General web access                               |
| Mobile phone    | Password-backed sign-in with SMS verification    |
| Aadhaar ID      | Strong identity verification for Indian citizens |
| PAN card number | Alternative government ID                        |

**Flow:**
1. User provides one identifier (email, phone, Aadhaar, or PAN).
2. Account is created with `state: "unverified"`, `role: "user"`.
3. SMS code or email link sent; on verification, `state` transitions to `verified`.
4. Accounts that trigger abuse signals during signup are placed in `state: "readonly"` and queued for moderation review.

Relevant TODO items:
- Implement self-service signup (one-identifier model).
- Wire registration to DB (replace in-memory demo users).
- Support SMS and email verification for India-context tenants, with OTP-based login still available as a future enhancement.
- Route suspicious signups to the moderation queue.
- Add signup link in site header / login page.

---

## Where Enforcement Lives

Roles are checked **imperatively in each page or handler** — there is no centralized middleware auth guard yet.

| Location                                    | What it checks                                                  |
| ------------------------------------------- | --------------------------------------------------------------- |
| `src/app/admin/moderation/page.tsx`         | `canReviewModeration` + `canAccessTenant`                       |
| `src/modules/voting/service.ts`             | `canUserVote`                                                   |
| `src/modules/api/handlers.ts`               | `canManagePromises`, `canReviewModeration`, `canAccessTenant`   |
| `src/components/navigation/site-header.tsx` | `canManagePromises`, `canReviewModeration` (UI visibility only) |

A future improvement would centralize these checks in `src/middleware.ts` or a shared server-action guard.
