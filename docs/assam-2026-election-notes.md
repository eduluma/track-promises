# Assam 2026 Election Notes

This note captures the election structure, alliances, and outcome for the 2026 Assam Assembly election.

Unlike the Kerala note, this is not yet manifesto-ready. The available source page is strongest for tenant, timeline, alliance, and result modeling rather than detailed promise extraction.

## Election Context

- State: Assam
- Timeline: 2026 Assembly election
- Seats: `126`
- Polling: `9 April 2026`
- Results announced: `4 May 2026`
- Turnout: `85.38%`
- Result: NDA retained power with `102` seats

## Alliance Structure

### NDA

- Bharatiya Janata Party
- Asom Gana Parishad
- Bodoland People's Front
- Rabha Hasong Joutha Mancha

### Asom Sonmilito Morcha

- Indian National Congress
- Raijor Dal
- Assam Jatiya Parishad
- CPI(M)
- CPI(ML) Liberation
- supported independents in select seats

### Other Relevant Parties

- All India United Democratic Front
- All India Trinamool Congress
- United People's Party Liberal
- Aam Aadmi Party

## Why This Matters For Track Promises

Assam is useful because it shows a different alliance shape from Tamil Nadu and Kerala.

- Regional parties materially affect seat-sharing.
- `Bodoland Territorial Region` politics matter for alliance composition.
- One tenant timeline may need both statewide alliances and subregional political actors.

## What This Source Gives Us Reliably

The 2026 election page is strong enough to support:

- tenant and timeline creation
- alliance records and participating parties
- candidate and constituency linkage
- result snapshots and turnout context

It is not yet strong enough on its own for full promise ingestion.

## Promise-Sourcing Status

The clearest manifesto clue exposed from the election page references is that `UPPL` highlighted implementation of the `Bodo Peace Accord` and jobs in its manifesto coverage.

That is useful as a signal, but not enough for a normalized promise import across the major Assam fronts. A follow-up sourcing pass is still needed for BJP, Congress, AGP, BPF, and Raijor Dal manifesto material.

## Suggested Modeling For The Repo

If this election is added next, start with:

- tenant: `assam`
- timeline: `2026`
- alliances: `NDA`, `Asom Sonmilito Morcha`
- optional subregional tagging for Bodoland-linked parties

## Primary Sources

- Wikipedia election page: <https://en.wikipedia.org/wiki/2026_Assam_Legislative_Assembly_election>
- India Today NE reference surfaced from the election page for UPPL manifesto context: <https://www.indiatodayne.in/assam/video/assam-uppl-unveils-manifesto-prioritising-bodo-peace-accord-jobs-1277608-2025-09-14>
