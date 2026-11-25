import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../site/js/engine.js';
import { concepts, theorems, theoremById } from '../site/js/content/index.js';

const fresh = () => E.initialState();

function runDiagnostic(state, answerFor) {
  const s = E.newDiagnostic();
  let id;
  while ((id = E.nextDiagnostic(concepts, s))) E.recordDiagnostic(state, concepts, s, id, answerFor(id));
  E.finishDiagnostic(state, concepts, s);
  return s;
}

test('observe moves toward outcome and stays in (0,1)', () => {
  const s = fresh();
  for (let i = 0; i < 50; i++) E.observe(s, 'primes', true);
  assert.ok(E.p(s, 'primes') > 0.95 && E.p(s, 'primes') < 1);
  E.observe(s, 'primes', false);
  assert.ok(E.p(s, 'primes') < 0.95, 'still responsive after many observations');
});

test('expert diagnostic: capped; assessed concepts solid, the rest standard', () => {
  const s = fresh();
  const d = runDiagnostic(s, () => 'correct');
  assert.ok(d.asked.length <= E.MAX_DIAG, `asked ${d.asked.length}`);
  [...d.asked, ...d.inferred].forEach((c) => assert.ok(E.p(s, c) >= E.HI, c));
  d.defaulted.forEach((c) => assert.ok(E.p(s, c) >= E.LO && E.p(s, c) < E.HI, c));
  assert.ok(s.diagnosed);
});

test('novice diagnostic: misses skip dependents', () => {
  const s = fresh();
  const d = runDiagnostic(s, () => 'unknown');
  assert.ok(d.asked.length < concepts.length, `asked ${d.asked.length}`);
  concepts.forEach((c) => assert.ok(E.p(s, c.id) < E.LO, c.id));
});

// Knows logic + number theory basics, not analysis or set theory.
const known = new Set(['implication', 'contradiction', 'divisibility', 'parity', 'primes', 'gcd', 'induction']);

test('diagnostic, no destination: capped, and known concepts are never put in guided mode', () => {
  const s = fresh();
  const d = runDiagnostic(s, (id) => (known.has(id) ? 'correct' : 'wrong'));
  assert.ok(d.asked.length <= E.MAX_DIAG, `asked ${d.asked.length}`);
  // Assessed known concepts are solid; ones the cap left unassessed start at
  // the hit-rate estimate, which for this learner is standard mode.
  known.forEach((c) => assert.ok(E.p(s, c) >= (d.defaulted.includes(c) ? E.LO : E.HI), `${c} = ${E.p(s, c)}`));
});

test('diagnostic with a destination asks only about its concepts, and settles the known ones', () => {
  const s = fresh();
  const only = E.conceptsFor(concepts, E.pathTo(theorems, 'flt'));
  const d = E.newDiagnostic();
  let id;
  while ((id = E.nextDiagnostic(concepts, d, only))) {
    assert.ok(only.has(id), `asked off-path concept ${id}`);
    E.recordDiagnostic(s, concepts, d, id, known.has(id) ? 'correct' : 'wrong');
  }
  E.finishDiagnostic(s, concepts, d);
  [...known].filter((c) => only.has(c)).forEach((c) => assert.ok(E.p(s, c) >= E.HI, `${c} = ${E.p(s, c)}`));
});

test('every concept is assessed exactly once (asked, inferred or defaulted)', () => {
  const s = fresh();
  let flip = false;
  const d = runDiagnostic(s, () => ((flip = !flip) ? 'correct' : 'wrong'));
  const all = [...d.asked, ...d.inferred, ...d.defaulted];
  assert.equal(new Set(all).size, all.length);
  assert.equal(all.length, concepts.length);
});

test('step mode follows weakest concept; override wins', () => {
  const s = fresh();
  const step = { concepts: ['parity', 'contradiction'] };
  s.mastery.parity = { p: 0.9, n: 3 };
  s.mastery.contradiction = { p: 0.9, n: 3 };
  assert.equal(E.stepMode(s, step), 'challenge');
  s.mastery.contradiction.p = 0.5;
  assert.equal(E.stepMode(s, step), 'standard');
  s.mastery.contradiction.p = 0.1;
  assert.equal(E.stepMode(s, step), 'guided');
  s.mode = 'challenge';
  assert.equal(E.stepMode(s, step), 'challenge');
});

test('recommendation: novice starts with an entry-level proof; required theorems lower readiness', () => {
  const s = fresh();
  const first = E.recommend(s, theorems);
  assert.ok(['pythagoras', 'sqrt2', 'euclid'].includes(first.id), first.id);
  const euler = theoremById.euler;
  const before = E.readiness(s, euler);
  E.completeTheorem(s, theoremById.fta);
  E.completeTheorem(s, theoremById.euclid);
  assert.ok(E.readiness(s, euler) > before);
});

test('gaps lists weak prerequisites, prerequisites first', () => {
  const s = fresh();
  const g = E.gaps(s, concepts, theoremById.sqrt2);
  assert.ok(g.indexOf('implication') < g.indexOf('contradiction'));
  assert.ok(g.indexOf('divisibility') < g.indexOf('parity'));
  concepts.forEach((c) => (s.mastery[c.id] = { p: 0.9, n: 1 }));
  assert.deepEqual(E.gaps(s, concepts, theoremById.sqrt2), []);
});

test('never recommends a proof before the proofs it builds on (when avoidable)', () => {
  const s = fresh();
  concepts.forEach((c) => (s.mastery[c.id] = { p: 0.95, n: 1 }));
  const done = new Set();
  while (true) {
    const t = E.recommend(s, theorems);
    if (!t) break;
    (t.requiresTheorems ?? []).forEach((x) => assert.ok(done.has(x), `${t.id} before ${x}`));
    E.completeTheorem(s, t);
    done.add(t.id);
  }
  assert.equal(done.size, theorems.length);
});

test('goal paths: end at the goal, closed under prerequisites, prerequisites first', () => {
  for (const g of theorems.filter((t) => t.kind === 'roadmap')) {
    const path = E.pathTo(theorems, g.id);
    assert.equal(path.at(-1), g, `${g.id}: goal last`);
    assert.ok(path.length >= 3, `${g.id}: path of ${path.length}`);
    const ids = path.map((t) => t.id);
    path.forEach((t, i) => (t.requiresTheorems ?? []).forEach((x) =>
      assert.ok(ids.indexOf(x) > -1 && ids.indexOf(x) < i, `${g.id}: ${t.id} needs ${x} earlier`)));
  }
});

test('with a goal, recommendations walk its path in order and stop at the end', () => {
  for (const g of theorems.filter((t) => t.kind === 'roadmap')) {
    const s = fresh();
    const path = E.pathTo(theorems, g.id);
    const walked = [];
    let t;
    while ((t = E.recommend(s, theorems, g.id))) { walked.push(t.id); E.completeTheorem(s, t); }
    assert.deepEqual(walked, path.map((x) => x.id), g.id);
    assert.deepEqual(E.pathProgress(s, theorems, g.id), { done: path.length, total: path.length });
  }
});

test('completing all theorems → no recommendation', () => {
  const s = fresh();
  theorems.forEach((t) => E.completeTheorem(s, t));
  assert.equal(E.recommend(s, theorems), null);
});
