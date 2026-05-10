# West Bengal 2026 Election Notes

This note captures the main structure of the 2026 West Bengal Assembly election and the most explicit manifesto commitments that were easy to verify from source coverage.

It is not yet a complete promise import file. It is mainly useful for election context, alliance modeling, and a first batch of sourceable promises.

## Election Context

- State: West Bengal
- Timeline: 2026 Assembly election
- Seats: `294`
- Polling: `23 April 2026` and `29 April 2026`, with repolling in `Falta` later
- Results announced: `4 May 2026`
- Turnout: `92.93%`
- Result: BJP won `207` seats, AITC+ won `80`, others won `6`

## Why This Matters For Track Promises

West Bengal is useful for the product because the election combined:

- a strong alliance and identity dimension
- intense governance and corruption themes
- welfare-heavy promises from the incumbent party
- counter-promises from the challenger around women, jobs, pay revision, and large public infrastructure

This is a good tenant for testing source trails that mix election-page context with party-manifesto coverage.

## Main Alliances And Parties

- AITC+ led by All India Trinamool Congress
- BJP contesting statewide on its own
- Left Front+ and Congress contesting separately

## Dominant Campaign Issues

According to the election page, the campaign centered on:

- electoral rolls and the `SIR` voter revision exercise
- `CAA`, citizenship, and migration politics
- border security and identity questions
- corruption and recruitment scandals
- women's safety
- jobs, industry, and public recruitment

## Sourceable Commitments

### TMC / AITC Commitments

The TMC manifesto was presented as `10 commitments` and emphasized continuity plus doorstep delivery.

The clearest sourceable items from coverage are:

1. `Duare Chikitsa` or doorstep medical care.
2. Continued cash-support framing through schemes such as `Lakshmir Bhandar` and `Yuva Saathi`.
3. New healthcare and education infrastructure commitments.
4. Support for landless farmers.
5. A promise to make Bengal a destination for industry and investment.

These should be treated as a first-pass source set. If this tenant becomes an import priority, the full TMC manifesto should be collected separately and split into individual records.

### BJP Commitments

The BJP `Sankalpa Patra` produced a more explicit list in public coverage.

1. Increase monthly assistance for women to `Rs. 3,000`.
2. Increase monthly assistance for unemployed youth to `Rs. 3,000`.
3. Provide pregnant women with `Rs. 21,000` and six nutrition kits.
4. Provide free travel for women in all State government buses.
5. Implement the `7th Pay Commission` within `45` days of coming to power.
6. Bring a `Uniform Civil Code` in the State.
7. Establish a new `AIIMS` in North Bengal.
8. Establish a new `IIT` in North Bengal.

## Suggested Modeling For The Repo

If this election is added to the data model, start with:

- tenant: `westbengal`
- timeline: `2026`
- alliances: `AITC+`, `BJP`, `Left Front+`, `Congress`

For promise ingestion, begin with the BJP items above because they are explicit and already separable.

## Primary Sources

- Wikipedia election page: <https://en.wikipedia.org/wiki/2026_West_Bengal_Legislative_Assembly_election>
- The Hindu on TMC manifesto: <https://www.thehindu.com/elections/west-bengal-assembly/mamata-woos-voters-with-10-commitments-says-bengal-will-be-destination-for-industry/article70765593.ece>
- Indian Express on BJP manifesto: <https://indianexpress.com/article/cities/kolkata/rs-3000-monthly-assistance-for-women-new-aiims-iit-for-north-bengal-amit-shah-releases-bjp-sankalpa-patra-for-bengal-polls-10629715/>
