# Tenant Locale Settings Feature TODO

This checklist tracks the implementation of tenant-controlled language settings.

## Decisions Locked

- [x] Keep English enabled for every tenant.
- [x] Treat the tenant primary language as the default browsing locale.
- [x] Allow state tenants such as Tamil Nadu and Kerala to add one local language on top of English.
- [x] Allow country-wide tenants to enable multiple additional languages.

## Completed

- [x] Enforce tenant locale rules in config validation.
- [x] Add a runtime helper that resolves tenant supported locales plus primary locale.
- [x] Update request locale resolution to use the tenant primary locale explicitly.
- [x] Update middleware locale resolution to stay inside each tenant's enabled locale set.
- [x] Add focused tests for Tamil Nadu, Kerala, and unsupported locale normalization.

## Next

- [x] Add a tenant admin settings screen for locale configuration.
- [x] Allow admins to update the default browsing language for a tenant in settings.
- [ ] Add a tenant locale settings form with enabled-language selection.
- [x] Add a shared API contract and handler for updating tenant locale settings.
- [x] Persist the tenant default browsing language update through a repository/service layer with audit logging.
- [x] Mirror the update route in the Fastify API service.
- [x] Add focused tests for tenant locale settings authorization and validation.

## Follow-up

- [ ] Decide how middleware should consume persisted tenant locale settings without introducing request-path drift.
- [ ] Move source-seeded locale overrides to persisted tenant configuration once runtime reads can use the same source of truth.
- [x] Add localized labels and navigation for the new tenant settings surface.