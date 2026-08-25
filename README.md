# NYC Building Stories — Decision Product

Builds on [hdp-nyc-building-story-visualization](https://github.com/maramzv/hdp-nyc-building-story-visualization), which turned NYC's **Open HPD Violations** dataset (`csn4-vhvf`) into an evidence-backed, city-scale story engine (167k+ buildings, six calibrated dimensions, browser-verified). That project stopped deliberately at evidence → pattern → story and made no recommendations.

This project starts where that one stopped: turning those verified patterns into something that helps someone actually decide what to do.

## The question

> Given a building's real, verified story, what should someone do about it?

## The foundation this inherits

- `src/building_story.py` / `src/building_story.js` — the six-dimension profile engine (Scale, Recency, Severity, Engagement, Pattern, Backlog age), kept in exact behavioral sync and verified against real buildings via `scripts/verify_js_port.py`
- `map.html` — the 3D city-scale visualization, evidence cards, and per-pattern legend
- `data/map_dataset.json` / `data/neighborhoods.json` / `data/nyc_boundary.geojson` — the batch-computed, city-scale dataset
- The calibration scripts (`scripts/calibrate_*.py`, `scripts/count_*.py`) that derived every threshold from the real citywide violation distribution, not a guess

All of it copied over working and already verified — nothing here is a fresh start on the data layer.

## The user

A prospective tenant or buyer, triaging one building at a time — deciding
whether to sign a lease or make an offer, informed by that building's real
violation history and how it compares to its neighborhood, borough, and
the city as a whole.

## The product

A report-style, search-first product — not the 3D map. A tenant/buyer's
question ("should I take this apartment?") is a document interaction
(search, read, compare, decide), not a map interaction, so the map is now
a secondary/optional page rather than the homepage.

- `index.html` — home page: address search or neighborhood browsing, plus
  a citywide summary strip.
- `report.html` — a single building's decision report: the evidence-based
  narrative, calibrated "worth extra caution" flags, each of the six
  dimensions translated into plain language with a concrete question to
  ask the landlord/seller, and a comparison of this building's pattern
  against its neighborhood/borough/citywide distribution. No score.
- `neighborhood.html` / `borough.html` / `citywide.html` — the same kind
  of comparison, one level up at a time, so a "Chronic" label can be read
  against what's actually typical for that block, borough, or city.
- `map.html` — the original 3D map, kept as a secondary way to explore,
  linked to from the home page.

## Current state

Inherited: a working, evidence-verified story engine and visualization at
full city scale. Built on top of it: the report-style decision product
described above. See `docs/BUILD_LOG.md` for the running build log.

## Data source

NYC Open Data — Open HPD Violations
https://data.cityofnewyork.us/Housing-Development/Open-HPD-Violations/csn4-vhvf/about_data

Dataset ID: `csn4-vhvf`

Queried live via the Socrata API. An app token is optional for public reads but increases the request/throttling allowance.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and paste a Socrata app token if you plan to re-run any live-data scripts.

## Project structure

```
data/          batch-computed datasets the map/report pages read directly
scripts/       data pipeline, calibration, and verification scripts
src/           shared engine code — building_story (Python + JS port),
               decision_layer.js (tenant framing), aggregate.js (rollups)
styles/        shared CSS for the report-style pages
docs/          build log and saved chat transcripts
index.html     home page — address search + neighborhood browsing
report.html    single-building decision report
neighborhood.html / borough.html / citywide.html   comparison views
map.html       the original 3D map (secondary)
```
