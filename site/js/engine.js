// Adaptive learning engine. Pure functions over a plain state object — no DOM.
//
// Model: each concept c has a mastery estimate p(c) in [0,1].
//   - The diagnostic seeds p from one question per concept, walking the
//     prerequisite graph and inferring instead of asking where it can.
//   - Every check question, "got it" and "I'm lost" click updates p.
//   - Each proof step is rendered in a mode chosen from the weakest concept
//     it depends on:
//       challenge  (p >= HI): claim shown, justification hidden — try it first
//       standard   (LO <= p < HI): claim + justification
//       guided     (p < LO): claim + justification + detailed walkthrough +
//                  inline primers for the weak concepts

export const PRIOR = 0.3;
export const HI = 0.75;
export const LO = 0.4;
export const STORAGE_KEY = 'riemann.v1';

const clamp = (x) => Math.min(0.99, Math.max(0.01, x));

export function initialState() {
  return { v: 1, mastery: {}, progress: {}, mode: 'auto', diagnosed: false, goal: null };
}

export function p(state, c) {
  return state.mastery[c]?.p ?? PRIOR;
}

// Learning-rate update toward the observed outcome. Early evidence moves the
// estimate a lot; later evidence less, but never below 0.2 so the model keeps
// tracking a learner who improves (or forgets).
export function observe(state, c, correct) {
  const m = state.mastery[c] ?? { p: PRIOR, n: 0 };
  const k = Math.max(0.2, 1 / (m.n + 1.5));
  m.p = clamp(m.p + k * ((correct ? 1 : 0) - m.p));
  m.n += 1;
  state.mastery[c] = m;
}

// Weak positive signal ("got it" without a check question).
export function nudge(state, c) {
  const m = state.mastery[c] ?? { p: PRIOR, n: 0 };
  m.p = clamp(m.p + 0.08 * (1 - m.p));
  state.mastery[c] = m;
}

function set(state, c, value) {
  const m = state.mastery[c] ?? { p: PRIOR, n: 0 };
  m.p = clamp(value);
  m.n = Math.max(m.n, 1);
  state.mastery[c] = m;
}

// ---------- graph helpers ----------

export function topoOrder(concepts) {
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  const out = [];
  const mark = {};
  const visit = (id, stack = []) => {
    if (mark[id] === 2) return;
    if (mark[id] === 1) throw new Error(`cycle: ${[...stack, id].join(' -> ')}`);
    if (!byId[id]) throw new Error(`unknown concept: ${id}`);
    mark[id] = 1;
    for (const pre of byId[id].prereqs) visit(pre, [...stack, id]);
    mark[id] = 2;
    out.push(id);
  };
  concepts.forEach((c) => visit(c.id));
  return out;
}

export function ancestors(concepts, id) {
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  const seen = new Set();
  const walk = (x) => byId[x].prereqs.forEach((pre) => { if (!seen.has(pre)) { seen.add(pre); walk(pre); } });
  walk(id);
  return seen;
}

export function descendants(concepts, id) {
  const seen = new Set();
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of concepts) {
      if (!seen.has(c.id) && c.prereqs.some((pre) => pre === id || seen.has(pre))) {
        seen.add(c.id);
        grew = true;
      }
    }
  }
  return seen;
}

// ---------- diagnostic ----------
// session = { asked: Set, inferred: Set }. Walk concepts in prerequisite order;
// a miss marks every dependent as weak without asking, a hit marks every
// prerequisite as at least solid. Typical run: 6–10 questions, not 15.

export function newDiagnostic() {
  return { asked: [], inferred: [] };
}

// Pick the question with the most expected inferences: a hit settles the
// concept's unassessed ancestors, a miss its unassessed descendants. The hit
// rate so far weights the two, so experts get asked deep concepts first and
// novices shallow ones. Ties go to prerequisite order.
export const MAX_DIAG = 12;

export function nextDiagnostic(concepts, session) {
  const done = new Set([...session.asked, ...session.inferred]);
  const open = topoOrder(concepts).filter((id) => !done.has(id));
  if (!open.length || session.asked.length >= MAX_DIAG) return null;
  const h = ((session.hits ?? 0) + 1) / (session.asked.length + 2);
  let best = null, bestScore = -1;
  for (const id of open) {
    const a = [...ancestors(concepts, id)].filter((x) => !done.has(x)).length;
    const d = [...descendants(concepts, id)].filter((x) => !done.has(x)).length;
    const score = h * a + (1 - h) * d;
    if (score > bestScore + 1e-9) { best = id; bestScore = score; }
  }
  return best;
}

// answer: 'correct' | 'wrong' | 'unknown'
export function recordDiagnostic(state, concepts, session, id, answer) {
  session.asked.push(id);
  const done = new Set([...session.asked, ...session.inferred]);
  if (answer === 'correct') {
    session.hits = (session.hits ?? 0) + 1;
    set(state, id, 0.85);
    for (const a of ancestors(concepts, id)) {
      if (!done.has(a)) { set(state, a, 0.8); session.inferred.push(a); }
      else if (p(state, a) < 0.6) set(state, a, 0.6); // a hit downstream softens an earlier miss
    }
  } else {
    set(state, id, answer === 'wrong' ? 0.2 : 0.05);
    for (const d of descendants(concepts, id)) {
      if (!done.has(d)) { set(state, d, 0.1); session.inferred.push(d); }
    }
  }
}

// After the question cap, concepts never asked or inferred get an estimate from
// the session's hit rate: ~0.65 for a strong learner (standard mode), ~0.25 for
// a beginner (guided). Live answers recalibrate them quickly.
export function finishDiagnostic(state, concepts, session) {
  const done = new Set([...session.asked, ...session.inferred]);
  const h = (session.hits ?? 0) / Math.max(1, session.asked.length);
  session.defaulted = concepts.map((c) => c.id).filter((id) => !done.has(id));
  for (const id of session.defaulted) set(state, id, 0.2 + 0.5 * h);
  state.diagnosed = true;
}

// ---------- step rendering mode ----------

export function stepMode(state, step, fallback = PRIOR) {
  if (state.mode !== 'auto') return state.mode;
  const m = step.concepts.length ? Math.min(...step.concepts.map((c) => p(state, c))) : fallback;
  if (m >= HI) return 'challenge';
  if (m >= LO) return 'standard';
  return 'guided';
}

export function weakConcepts(state, ids) {
  return ids.filter((c) => p(state, c) < LO);
}

// ---------- theorem readiness & recommendation ----------

export function isDone(state, tid) {
  return !!state.progress[tid]?.done;
}

export function readiness(state, theorem) {
  const parts = theorem.prereqs.map((c) => Math.min(1, p(state, c) / HI));
  (theorem.requiresTheorems ?? []).forEach((t) => parts.push(isDone(state, t) ? 1 : 0.3));
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 1;
}

// Concepts to shore up before a theorem: weak direct prereqs plus their weak
// ancestors, prerequisites first.
export function gaps(state, concepts, theorem) {
  const want = new Set();
  for (const c of theorem.prereqs) {
    if (p(state, c) < LO) {
      want.add(c);
      for (const a of ancestors(concepts, c)) if (p(state, a) < LO) want.add(a);
    }
  }
  return topoOrder(concepts).filter((id) => want.has(id));
}

// ---------- goals ----------
// A goal is a theorem (in practice a roadmap). Its path is the goal plus every
// theorem it builds on, transitively, in catalogue order, which is topological
// because a theorem may only require theorems listed before it.

export function pathTo(theorems, goalId) {
  const byId = Object.fromEntries(theorems.map((t) => [t.id, t]));
  const need = new Set([goalId]);
  const walk = (id) => (byId[id].requiresTheorems ?? []).forEach((x) => {
    if (!need.has(x)) { need.add(x); walk(x); }
  });
  walk(goalId);
  return theorems.filter((t) => need.has(t.id));
}

export function pathProgress(state, theorems, goalId) {
  const path = pathTo(theorems, goalId);
  return { done: path.filter((t) => isDone(state, t.id)).length, total: path.length };
}

// Next theorem to study. Proofs whose prerequisite proofs are done come first.
// With a goal, stay on its path and walk it in order; without one, pick the
// most ready proof in the whole catalogue.
export function recommend(state, theorems, goalId = null) {
  const pool = goalId ? pathTo(theorems, goalId) : theorems;
  const open = pool.filter((t) => !isDone(state, t.id));
  if (!open.length) return null;
  const unlocked = (t) => ((t.requiresTheorems ?? []).every((x) => isDone(state, x)) ? 1 : 0);
  return open
    .map((t, i) => ({ t, u: unlocked(t), r: goalId ? 0 : readiness(state, t), i }))
    .sort((a, b) => b.u - a.u || b.r - a.r || a.i - b.i)[0].t;
}

export function completeTheorem(state, theorem) {
  state.progress[theorem.id] = { ...(state.progress[theorem.id] ?? {}), done: true };
  theorem.prereqs.forEach((c) => nudge(state, c));
}
