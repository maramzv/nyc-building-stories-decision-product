# Project context and history

This file is loaded automatically at the start of every Claude Code session in
this folder. It captures the reasoning and decisions carried over from the
sibling project this one is built on
(`week-5/hdp-nyc-building-story-visualization`), so a new session can pick up
the conversation without re-deriving any of it.

## What this project is

A decision-support product built on top of a working, evidence-verified NYC
housing-violation story engine. The prior project (linked above) stopped
deliberately at **evidence → pattern → story** and made no recommendations.
This one exists to build the layer on top of that: turning a verified
building story into something that helps a real person decide what to do.

**Not yet decided as of this writing:** who the user is, and what decision
they're making. That's the first real question for this project — see
"Where we left off" below.

## The founding insight behind the whole codebase

Early in the prior project, a first pass built the Pattern taxonomy
("Isolated"/"Persistent"/"Chronic") from preset categories, then tested it by
hand-checking real buildings against the actual city records behind each
label. All three categories broke: some "quiet" buildings had real ongoing
problems the raw count missed, and some "chronic"/"years overdue" labels
turned out to be old paperwork already resolved. The lesson that shaped
everything downstream: **a label built on a raw number can look confident
and still be false.** Every threshold in this codebase is calibrated against
the real data distribution and spot-checked against real buildings before
being trusted - never assumed from the schema. This is also why the prior
project refused to make recommendations: it had just learned firsthand how
easy it is for a tidy-looking conclusion to be wrong underneath. Carry that
same discipline into whatever gets built here.

## Recent work (most recent first) inherited into this repo

1. **Narrative redundancy fixes.** The generated per-building narrative
   (`generate_narrative`/`generateNarrative`) had several sentences that
   independently restated the same fact in different words whenever two
   rules fired together (e.g. the long-unresolved Backlog sentence always
   repeated facts the opener and Engagement sentence had already stated,
   because `long_unresolved` is *defined* as requiring both of those
   conditions). Fixed at the root by removing the restated content rather
   than patching each new combination as it surfaced - the lesson being that
   whack-a-mole patches on generated text don't work when the redundancy is
   structural.

2. **The Widespread Pattern bucket.** "Isolated" used to mean *only*
   "no defect ever recurred," with no volume cap - so a building with 35
   distinct, non-repeating real defects and a building with 1 looked
   identical. Split into Isolated/Widespread at a calibrated **9+ real
   defects** cutoff (the true p75 of the real citywide distribution within
   the actual candidate pool, not a guessed number). A literal "1-3 vs 4+"
   split was considered and rejected: the pool's median is 4, so that cutoff
   would have called the *typical* building Widespread, diluting the label
   back into meaninglessness. Severity was checked and found essentially
   flat across the volume distribution - volume and severity are
   independent, which is why they stay separate profile dimensions rather
   than being folded together.

3. **The six-dimension profile engine** (`src/building_story.py` /
   `src/building_story.js`, kept in exact behavioral sync and verified
   against real buildings via `scripts/verify_js_port.py`): Scale, Recency,
   Severity, Engagement, Pattern (No real defects / Isolated / Widespread /
   Persistent / Chronic), Backlog age. Deterministic and rule-based, no ML.
   Every threshold traces to a calibration script in `scripts/`.

## Where we left off

**Resolved (2026-08-25):** the user is a prospective tenant/buyer,
triaging one building at a time — the option previously recommended here
(reasoning preserved below). Building on that, the product also turned
out *not* to be map-first: the 3D map was built for the prior project's
job (exploring city-scale patterns visually), which is a different
interaction than a tenant/buyer's actual question ("should I take this
apartment?") — that's a document/report interaction, not a map
interaction. The map is kept as a secondary/optional page, not the
homepage. The product also grew a comparison layer (citywide → borough →
neighborhood → building) so a pattern label like "Chronic" can be read
against what's actually typical for that block, using data that already
existed (`data/neighborhoods.json`'s per-neighborhood pattern counts —
pure arithmetic, no new calibration).

See `docs/BUILD_LOG.md` for the full running log of what shipped and why,
kept up to date across sessions — check it before assuming this section is
still current.

**Original reasoning for the tenant/buyer, single-building decision**
(options considered were also a city inspector/regulator, a building
owner/landlord, or a policy analyst/advocate; and portfolio-prioritization
or risk-prediction as alternative decision types):

- It's the smallest real gap between what exists and what's needed - the
  six-dimension engine and evidence cards already answer nearly this
  question for one building; what's missing is framing, not new data
  plumbing.
- "Prioritize across many" or "predict risk" both require compressing six
  independent, hard-won dimensions into a single rank or score - and
  picking those weights (is Chronic-but-small worse than
  Widespread-but-severe?) is a real value judgment nobody's earned the
  right to make yet. That's the same mistake the original "Isolated" bucket
  made, just at a different altitude: an unearned number standing in for a
  nuanced reality.
- Single-building triage can hand the six dimensions to a person and let
  *them* weigh what matters for their situation, without the product having
  to pretend it has a definitive synthesized answer.
- Portfolio/prioritization tools are a legitimate real phase 2 - but only
  after hand-verifying whatever ranking logic gets built against real
  buildings first, the same way every threshold in this codebase was
  verified before being trusted.

## Inherited components (working, already verified - not a fresh start)

- `src/building_story.py` / `src/building_story.js` - the profile engine
- `map.html` - the 3D map, evidence cards, per-pattern legend
- `data/map_dataset.json` / `data/neighborhoods.json` /
  `data/nyc_boundary.geojson` - the batch-computed, city-scale dataset
  (167k+ buildings)
- `scripts/calibrate_*.py`, `scripts/count_*.py` - the threshold
  calibration scripts, kept for reference/reproducibility
- `scripts/verify_js_port.py`, `scripts/test_map_ui.py` - the verification
  harnesses that keep the Python/JS engines in sync and catch regressions
  via a real headless browser
