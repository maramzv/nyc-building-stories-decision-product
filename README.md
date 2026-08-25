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

Not yet defined — this is the first thing to decide before building anything new.

## Current state

Inherited: a working, evidence-verified story engine and visualization at full city scale.

Not yet started: the decision layer itself — who this is for, what decision they're making, and what "helping them decide" actually means on top of the patterns already computed.

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
data/      batch-computed datasets the map reads directly
scripts/   data pipeline, calibration, and verification scripts
src/       shared story-engine code (Python + JS port)
map.html   the visualization
```
