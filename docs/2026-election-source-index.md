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

- `../data/election/2026/tamilnadu-2026-tvk-promises.json`
  - structured from the official TVK manifesto chapter pages on `vijay.com`
  - now includes a recent-election snapshot for the 2026 assembly result so the public timeline can show current mandate context above the 2026 promises
- `../data/election/2026/kerala-2026-front-promises.json`
  - structured from the Kerala front promise notes and linked source coverage
  - now includes a recent-election snapshot for the 2026 assembly result so the public timeline can show current mandate context above the 2026 promises

## Recent Election Overview Snapshots

- `election/2026/assam-2026-recent-election-overview.json`
  - official-result snapshot with ECI seat and vote totals plus winner context sources
- `election/2026/kerala-2026-recent-election-overview.json`
  - winner-oriented summary for the 2026 Kerala result used to refresh the public mandate card
- `election/2026/puducherry-2026-recent-election-overview.json`
  - compact 2026 Puducherry result file with source links kept inside the data object
- `election/2026/tamilnadu-2026-recent-election-overview.json`
  - winner-oriented summary for the 2026 Tamil Nadu result used to refresh the public mandate card
- `election/2026/westbengal-2026-recent-election-overview.json`
  - official-result snapshot for the 2026 West Bengal mandate

## Candidatewise Result Dumps

- `../data/election/2026/constituency-results/tamilnadu-2026-assembly-constituency-results.json`
  - canonical Tamil Nadu constituency-level results with winner, runner-up, margin, image URLs, `last_updated`, and the original ECI `candidateswise-*` source link per seat
- `../data/election/2026/constituency-results/kerala-2026-assembly-constituency-results.json`
  - canonical Kerala constituency-level results with the same candidatewise fields and ECI source links
- `../data/election/2026/constituency-results/tamilnadu-2026-assembly-constituency-results-sample.json`
  - compact Tamil Nadu sample for schema checks and quick inspection without opening the full dump
- `../data/election/2026/constituency-results/kerala-2026-assembly-constituency-results-sample.json`
  - compact Kerala sample for the same schema and inspection use case
- `../data/election/2026/constituency-results/tamilnadu-2026-assembly-constituency-results-legacy.json`
  - older carry-over Tamil Nadu export kept only as a labeled legacy reference while the canonical Tamil Nadu file remains preferred

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
2. Reuse the new `docs/election/2026/*.json` overview snapshots when West Bengal, Assam, and Puducherry timelines are promoted into active datasets.
3. Collect full manifesto texts for West Bengal, Assam, and Puducherry where only election-page structure is available today.
4. Add these tenants and timelines into seed or fixture data once the import shape is settled.
5. Reuse the constituency result dumps for candidate pages, winner-margin summaries, or seat-level drilldowns rather than for statewide mandate cards.
