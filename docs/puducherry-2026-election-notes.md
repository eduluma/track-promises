# Puducherry 2026 Election Notes

This note captures the main structure of the 2026 Puducherry Assembly election.

The current value of this source is election topology: alliances, candidates, results, and the role of friendly contests. It is useful for the Track Promises data model even before manifesto extraction is completed.

## Election Context

- Union Territory: Puducherry
- Timeline: 2026 Assembly election
- Elected seats: `30` of `33` total assembly seats
- Polling: `9 April 2026`
- Results announced: `4 May 2026`
- Turnout: `89.87%`
- Result: NDA won `18`, SPA won `6`, TVK-led alliance won `3`, others won `3`

## Alliance Structure

### NDA

- All India N.R. Congress
- Bharatiya Janata Party
- AIADMK
- Latchiya Jananayaga Katchi

### Secular Progressive Alliance

- Indian National Congress
- DMK
- VCK participation and later partial withdrawal
- multiple friendly contests between alliance partners

### TVK-Led Alliance

- Tamilaga Vettri Kazhagam
- Neyam Makkal Kazhagam

### Other Groupings

- SNMMK-AIPTMMK alliance
- Naam Tamilar Katchi
- CPI(M)
- CPI

## Why This Matters For Track Promises

Puducherry matters because it is a compact but structurally rich election for the data model.

- It has multiple alliances in the same timeline.
- It includes friendly contests within an alliance, which is a real-world modeling edge case.
- It links naturally with Tamil Nadu political actors, especially `TVK`, without being the same tenant.

## What This Source Gives Us Reliably

The election page is strong enough to support:

- tenant and timeline setup
- alliance membership records
- candidate and constituency mapping
- results by alliance and district

It is weaker for manifesto-level promise extraction, so this note should be treated as a structural source note first.

## Suggested Modeling For The Repo

If this election is added next, start with:

- tenant: `puducherry`
- timeline: `2026`
- alliances: `NDA`, `Secular Progressive Alliance`, `TVK-led Alliance`
- note friendly contests as a source annotation rather than as a broken alliance model

## Primary Sources

- Wikipedia election page: <https://en.wikipedia.org/wiki/2026_Puducherry_Legislative_Assembly_election>
- Deccan Herald on NDA seat sharing: <https://www.deccanherald.com/india/puducherry/ainrc-bjp-finalise-seat-sharing-for-puducherry-assembly-polls-3938803>
- India TV on Congress-DMK seat sharing: <https://www.indiatvnews.com/news/india/puducherry-polls-2026-congress-dmk-seal-seat-sharing-pact-sitting-mp-vaithilingam-to-take-on-cm-rangasamy-2026-03-23-1034817>
- News18 on TVK alliance seat sharing: <https://tamil.news18.com/national/puducherry-election-tvk-alliance-gives-2-seats-for-neyam-makkal-kazhagam-ex-mla-nw-mma-ws-bl-2066968.html>
