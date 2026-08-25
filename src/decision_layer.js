/* Tenant/buyer decision framing on top of a BuildingProfile (src/building_story.js).
 * Presentation only — no new thresholds, no score. Every meaning/question/flag
 * traces to fields the profile engine already computed. */

/** For each of the six dimensions: plain-language meaning + one concrete
 * question to ask or thing to verify. Order matches the profile engine. */
function translateDimensions(p) {
  const out = [];

  out.push({
    dimension: "Scale",
    meaning: `${p.active_count} open violation${p.active_count !== 1 ? "s" : ""} on record right now — volume alone, before weighing how serious or how recent any of it is.`,
    question: "Ask directly which of these are already resolved and which are still open — the count alone doesn't say.",
  });

  if (p.recency === "Active surge") {
    out.push({
      dimension: "Recency",
      meaning: `${p.recent_count} of ${p.active_count} open violations (${Math.round(p.recency_ratio * 100)}%) were issued in just the past year.`,
      question: "Ask what changed recently — a wave of new violations can mean a new problem, or it can mean the owner just started addressing a long backlog. Ask which.",
    });
  } else if (p.recency === "Dormant") {
    out.push({
      dimension: "Recency",
      meaning: `Little to no activity in the past year — ${p.recent_count} of ${p.active_count} open violations were issued that recently.`,
      question: "Ask when the last inspection or repair actually happened. Dormant on paper doesn't always mean fixed — it can also mean nobody's checked in a while.",
    });
  } else {
    out.push({
      dimension: "Recency",
      meaning: `${p.recent_count} of ${p.active_count} open violations (${Math.round(p.recency_ratio * 100)}%) were issued in the past year — a mix of old and recent.`,
      question: "Ask which of the recent violations are already closed out versus still active.",
    });
  }

  out.push({
    dimension: "Severity",
    meaning: `${p.class_c_total} of ${p.active_count} open violations (${Math.round(p.class_c_rate * 100)}%) are Class C — HPD's most hazardous tier: heat, hot water, fire, gas.`,
    question: p.class_c_total > 0
      ? "Ask specifically about the Class C items: are they resolved, and can you see proof (a certification or receipt)?"
      : "No Class C violations on file — still worth confirming heat/hot water have never been an issue here, since a clean record doesn't rule out an unreported problem.",
  });

  const certAttempts = p.accepted_cert + p.rejected_cert;
  if (p.engagement === "Untested") {
    out.push({
      dimension: "Engagement",
      meaning: certAttempts === 0
        ? "No certification has ever been attempted for any of these violations."
        : `Only ${certAttempts} certification attempt${certAttempts !== 1 ? "s" : ""} on record — too little history to judge a pattern.`,
      question: "Ask for documentation that a violation has actually been fixed — there's no certification track record to check against.",
    });
  } else if (p.engagement === "Resistant") {
    out.push({
      dimension: "Engagement",
      meaning: `Certification attempts have mostly been rejected (${p.rejected_cert} of ${certAttempts} on record).`,
      question: "Ask why past certifications were rejected — this is a track record of claiming a fix that HPD didn't accept.",
    });
  } else if (p.engagement === "Mixed engagement") {
    out.push({
      dimension: "Engagement",
      meaning: `Certification attempts have had mixed outcomes (${p.accepted_cert} accepted, ${p.rejected_cert} rejected).`,
      question: "Ask about the specific violations tied to the rejected certifications — were they eventually fixed for real?",
    });
  } else {
    out.push({
      dimension: "Engagement",
      meaning: `Every certification attempt on record has been accepted (${p.accepted_cert} of ${certAttempts}).`,
      question: "Ask to see the certification records directly — the track record here is good, but still worth verifying independently.",
    });
  }

  if (p.pattern === "Chronic" || p.pattern === "Persistent") {
    const where = p.top_sig_breadth >= 2 ? `across ${p.top_sig_breadth} different apartments`
      : p.top_sig_breadth === 1 ? "in the same apartment" : "in the building's common areas";
    out.push({
      dimension: "Pattern",
      meaning: `The same defect has recurred ${p.top_sig_notices} times over ${p.top_sig_span_years.toFixed(1)} years, ${where}.`,
      question: "Ask specifically about this recurring issue — has it been genuinely resolved this time, or has it come back before after being 'fixed'?",
    });
  } else if (p.pattern === "Widespread") {
    out.push({
      dimension: "Pattern",
      meaning: `No single defect has repeated, but ${p.real_defect_count} separate real defects are on record — more than most buildings ever see.`,
      question: "Ask for a walkthrough of what's actually been wrong here — a wide spread of different problems is a different risk than one recurring one, and worth understanding room by room.",
    });
  } else if (p.pattern === "Isolated") {
    out.push({
      dimension: "Pattern",
      meaning: `${p.real_defect_count} real defect${p.real_defect_count !== 1 ? "s" : ""} on record, none of which has ever repeated.`,
      question: "Ask if the real defects on file have been resolved — a small, non-recurring count is a good sign but still worth a direct answer.",
    });
  } else {
    out.push({
      dimension: "Pattern",
      meaning: "Every violation on file is administrative — a filing requirement, not a cited physical defect.",
      question: "Confirm the administrative filings (registration, bedbug report, etc.) are current — those still carry legal weight even with no physical defect on record.",
    });
  }

  if (p.backlog_age === "Current") {
    out.push({
      dimension: "Backlog age",
      meaning: "No violation is significantly past its correction deadline.",
      question: "No specific follow-up needed here beyond the usual — nothing is sitting overdue.",
    });
  } else {
    out.push({
      dimension: "Backlog age",
      meaning: `The oldest missed correction deadline is ${p.max_years_overdue.toFixed(1)} years past due.`,
      question: "Ask what's blocking that specific violation from being closed — a multi-year gap usually has a reason worth hearing directly.",
    });
  }

  return out;
}

/** 0-4 evidence-cited flags from combinations of already-computed fields.
 * Never combined into a score — each is independently true or false. */
function getCautionFlags(p) {
  const flags = [];

  if (p.long_unresolved) {
    flags.push({
      label: "Long unresolved, no engagement",
      reason: `The oldest violation is ${p.max_years_overdue.toFixed(1)} years past its correction deadline, with no certification ever attempted and little recent activity — a record that's sat quietly, not necessarily one that's been resolved.`,
    });
  }

  if (p.pattern === "Chronic" && p.engagement === "Resistant") {
    const certAttempts = p.accepted_cert + p.rejected_cert;
    flags.push({
      label: "Recurring problem, resistant history",
      reason: `The same defect has recurred ${p.top_sig_notices} times over ${p.top_sig_span_years.toFixed(1)} years, and past certification attempts have mostly been rejected (${p.rejected_cert} of ${certAttempts}).`,
    });
  }

  if (p.pattern === "Widespread" && p.recency === "Active surge") {
    flags.push({
      label: "Many different problems, right now",
      reason: `${p.real_defect_count} separate real defects are on record — more than most buildings ever see — and ${Math.round(p.recency_ratio * 100)}% of the open violations were issued in just the past year.`,
    });
  }

  if (p.severity === "Extreme" && p.engagement !== "Responsive") {
    flags.push({
      label: "Serious violations, unproven track record",
      reason: `${Math.round(p.class_c_rate * 100)}% of open violations are Class C (heat, hot water, fire, gas), and ${p.engagement === "Untested" ? "no certification has ever been attempted" : "certification attempts have been mixed or mostly rejected"}.`,
    });
  }

  return flags;
}
