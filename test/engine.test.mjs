import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../site/js/engine.js';
import { concepts, theorems, theoremById } from '../site/js/content/index.js';

const fresh = () => E.initialState();

function runDiagnostic(state, answerFor) {
  const s = E.newDiagnostic();
  let id;
  while ((id = E.nextDiagnostic(concepts, s))) E.recordDiagnostic(state, concepts, s, id, answerFor(id));
  return s;
}

test('observe moves toward outcome and stays in (0,1)', () => {
  const s = fresh();
  for (let i = 0; i < 50; i++) E.observe(s, 'primes', true);
  assert.ok(E.p(s, 'primes') > 0.95 && E.p(s, 'primes') < 1);
  E.observe(s, 'primes', false);
  assert.ok(E.p(s, 'primes') < 0.95, 'still responsive after many observations');
});

test('expert diagnostic: everything solid, fewer questions than concepts', () => {
  const s = fresh();
  const d = runDiagnostic(s, () => 'correct');
  assert.ok(d.asked.length < concepts.length, `asked ${d.asked.length}`);
  concepts.forEach((c) => assert.ok(E.p(s, c.id) >= E.HI, c.id));
});

test('novice diagnostic: misses skip dependents', () => {
  const s = fresh();
  const d = runDiagnostic(s, () => 'unknown');
  assert.ok(d.asked.length < concepts.length, `asked ${d.asked.length}`);
  concepts.forEach((c) => assert.ok(E.p(s, c.id) < E.LO, c.id));
});

test('diagnostic length stays short for typical profiles', () => {
  // knows logic + number theory basics, not analysis or set theory
  const known = new Set(['implication', 'contradiction', 'divisibility', 'parity', 'primes', 'gcd', 'induction']);
  const s = fresh();
  const d = runDiagnostic(s, (id) => (known.has(id) ? 'correct' : 'wrong'));
  assert.ok(d.asked.length <= 12, `asked ${d.asked.length}`);
  known.forEach((c) => assert.ok(E.p(s, c) >= E.HI, c));
});

test('every concept is assessed exactly once (asked or inferred)', () => {
  const s = fresh();
  let flip = false;
  const d = runDiagnostic(s, () => ((flip = !flip) ? 'correct' : 'wrong'));
  const all = [...d.asked, ...d.inferred];
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

test('recommendation: novice gets sqrt2 or euclid first; required theorems lower readiness', () => {
  const s = fresh();
  const first = E.recommend(s, theorems);
  assert.ok(['sqrt2', 'euclid'].includes(first.id), first.id);
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

test('completing all theorems → no recommendation', () => {
  const s = fresh();
  theorems.forEach((t) => E.completeTheorem(s, t));
  assert.equal(E.recommend(s, theorems), null);
});
