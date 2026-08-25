/* Rollups for the neighborhood/borough/citywide comparison views.
 * Pure arithmetic over data/neighborhoods.json's already-computed,
 * already-calibrated per-neighborhood pattern counts — no new thresholds,
 * no new synthesized score. */

const PATTERN_KEYS = {
  "No real defects": "no_real_defects",
  "Isolated": "isolated",
  "Widespread": "widespread",
  "Persistent": "persistent",
  "Chronic": "chronic",
};
const PATTERN_ORDER = ["No real defects", "Isolated", "Widespread", "Persistent", "Chronic"];

function emptyCounts() {
  const c = { total: 0, long_unresolved: 0 };
  for (const p of PATTERN_ORDER) c[p] = 0;
  return c;
}

function addNeighborhoodRow(c, n) {
  c.total += n.total;
  c.long_unresolved += n.long_unresolved || 0;
  for (const p of PATTERN_ORDER) c[p] += n[PATTERN_KEYS[p]] || 0;
}

/** Sum every neighborhood row belonging to one borough. */
function boroRollup(neighborhoods, boro) {
  const c = emptyCounts();
  for (const n of neighborhoods) {
    if (n.boro === boro) addNeighborhoodRow(c, n);
  }
  return c;
}

/** Sum every neighborhood row citywide. */
function citywideRollup(neighborhoods) {
  const c = emptyCounts();
  for (const n of neighborhoods) addNeighborhoodRow(c, n);
  return c;
}

/** Turn a counts object ({total, "Chronic": n, ...}) into {pattern: pct} (0-100, one decimal). */
function patternDistribution(counts) {
  const dist = {};
  for (const p of PATTERN_ORDER) {
    dist[p] = counts.total ? Math.round((counts[p] / counts.total) * 1000) / 10 : 0;
  }
  return dist;
}

/** One neighborhood's own row, reshaped to the same {total, "Chronic": n, ...} shape as a rollup. */
function neighborhoodCounts(n) {
  const c = emptyCounts();
  addNeighborhoodRow(c, n);
  return c;
}
