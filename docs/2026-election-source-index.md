# 2026 Election Source Index

This index collects the current working notes for 2026 state and union territory election material used by Track Promises.

## Promise-Ready Notes

- `tamilnadu-2026-tvk-promises.md`
  - single-party example note for Tamil Nadu
  - best used to normalize one manifesto into many promise records
- `kerala-2026-front-promises.md`
  - front-level manifesto note across `UDF`, `LDF`, and `NDA`
  - best used to model many alliances inside one election timeline

## Import-Ready JSON

- `tamilnadu-2026-tvk-promises.json`
  - structured from the official TVK manifesto chapter pages on `vijay.com`
  - ready to map into the existing sample import shape of tenant, timeline, alliance, and promises
- `kerala-2026-front-promises.json`
  - structured from the Kerala front promise notes and linked source coverage
  - ready to map one tenant timeline to multiple competing fronts

## Election-Structure Notes

- `west-bengal-2026-election-notes.md`
  - good for alliance and result modeling
  - includes a first batch of explicit TMC and BJP manifesto commitments
- `assam-2026-election-notes.md`
  - good for alliance and candidate modeling
  - promise extraction still needs a follow-up sourcing pass
- `puducherry-2026-election-notes.md`
  - good for alliance and constituency modeling
  - especially useful for handling friendly contests and cross-tenant party presence

## Recommended Next Steps

1. Add these Tamil Nadu and Kerala JSON files to seed, fixture, or admin import workflows.
2. Collect full manifesto texts for West Bengal, Assam, and Puducherry where only election-page structure is available today.
3. Add these tenants and timelines into seed or fixture data once the import shape is settled.
