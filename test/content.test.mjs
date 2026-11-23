import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concepts, conceptById, theorems, theoremById } from '../site/js/content/index.js';
import { topoOrder } from '../site/js/engine.js';
import { inline, block } from '../site/js/format.js';

const checkQ = (q, where) => {
  assert.ok(q.prompt && q.explain, `${where}: prompt/explain`);
  assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${where}: options`);
  assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${where}: answer index`);
  assert.equal(new Set(q.options).size, q.options.length, `${where}: duplicate options`);
};

test('concept ids unique, prereqs exist, graph acyclic', () => {
  assert.equal(Object.keys(conceptById).length, concepts.length);
  for (const c of concepts) for (const p of c.prereqs) assert.ok(conceptById[p], `${c.id} -> ${p}`);
  assert.equal(topoOrder(concepts).length, concepts.length);
});

test('concept fields and questions', () => {
  for (const c of concepts) {
    for (const f of ['name', 'summary', 'primer']) assert.ok(c[f], `${c.id}.${f}`);
    checkQ(c.q, c.id);
  }
});

test('theorems reference valid concepts/theorems and are well formed', () => {
  assert.equal(Object.keys(theoremById).length, theorems.length);
  for (const t of theorems) {
    for (const f of ['title', 'attribution', 'statement', 'intro', 'takeaway']) assert.ok(t[f], `${t.id}.${f}`);
    assert.ok(t.prereqs.length, `${t.id} prereqs`);
    t.prereqs.forEach((c) => assert.ok(conceptById[c], `${t.id} prereq ${c}`));
    (t.requiresTheorems ?? []).forEach((x) => {
      assert.ok(theoremById[x], `${t.id} requires ${x}`);
      assert.ok(theorems.indexOf(theoremById[x]) < theorems.indexOf(t), `${t.id} requires later theorem ${x}`);
    });
    assert.ok(t.steps.length >= 3);
    t.steps.forEach((s, i) => {
      const w = `${t.id}#${i + 1}`;
      for (const f of ['title', 'claim', 'why', 'detail']) assert.ok(s[f], `${w}.${f}`);
      s.concepts.forEach((c) => assert.ok(conceptById[c], `${w} concept ${c}`));
      if (s.check) checkQ(s.check, w);
    });
  }
});

// Every piece of text, with every formula rendered by KaTeX in strict mode.
function* texts() {
  for (const c of concepts) {
    yield [c.id, c.summary, c.primer, c.q.prompt, c.q.explain, ...c.q.options];
  }
  for (const t of theorems) {
    yield [t.id, t.title, t.statement, t.intro, t.takeaway];
    for (const s of t.steps) {
      yield [`${t.id}:${s.title}`, s.claim, s.why, s.detail, ...(s.check ? [s.check.prompt, s.check.explain, ...s.check.options] : [])];
    }
  }
}

test('all math renders in KaTeX (strict) and dollars are balanced', () => {
  for (const [where, ...ts] of texts()) {
    for (const s of ts) {
      const stripped = s.replace(/\$\$[\s\S]+?\$\$/g, '').replace(/\$[^$]+?\$/g, '');
      assert.ok(!stripped.includes('$'), `${where}: unbalanced $ in: ${s.slice(0, 60)}`);
      assert.doesNotThrow(() => block(s, true), `${where}`);
      assert.doesNotThrow(() => inline(s, true), `${where}`);
    }
  }
});

test('formatter: escapes HTML outside math, keeps lists', () => {
  assert.match(block('a < b'), /a &lt; b/);
  assert.match(block('x\n\n- one\n- two'), /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(inline('**bold** and *it*'), /<strong>bold<\/strong> and <em>it<\/em>/);
});
