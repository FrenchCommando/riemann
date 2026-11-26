import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { concepts, conceptById, theorems, theoremById, labels } from '../site/js/content/index.js';
import { layout, renderMap } from '../site/js/map.js';
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
    yield [t.id, t.title, t.statement, t.intro, t.takeaway, ...(t.figure?.caption ? [t.figure.caption] : []),
      ...(t.tagline ? [t.tagline] : []),
      ...(t.sources ?? []).map((s) => s.label)];
    for (const s of t.steps) {
      yield [`${t.id}:${s.title}`, s.claim, s.why, s.detail,
        ...(s.check ? [s.check.prompt, s.check.explain, ...s.check.options] : []),
        ...(s.figure?.caption ? [s.figure.caption] : []),
        ...(s.cited ? [s.cited] : [])];
    }
  }
}

test('roadmaps: labelled, cite their unproved steps, list https sources', () => {
  for (const t of theorems) {
    assert.ok(t.kind === undefined || t.kind === 'roadmap', `${t.id}: kind`);
    for (const s of t.sources ?? []) assert.match(s.url, /^https:\/\/[^\s"<>]+$/, `${t.id}: source url`);
    if (t.kind !== 'roadmap') continue;
    assert.ok(t.sources?.length, `${t.id}: roadmap without sources`);
    assert.ok(t.tagline && t.status, `${t.id}: destination needs tagline and status`);
    assert.ok(t.steps.some((s) => s.cited), `${t.id}: roadmap with no cited step`);
    t.steps.forEach((s) => s.cited !== undefined && assert.ok(s.cited.trim(), `${t.id}: empty cited`));
  }
});

test('map: every proof has a label and a spot; every edge points right; no two dots collide', () => {
  const { pos } = layout(theorems);
  const seen = new Set();
  for (const t of theorems) {
    assert.ok(labels[t.id], `${t.id}: no map label`);
    assert.ok(pos[t.id], `${t.id}: not placed`);
    const key = `${pos[t.id].x},${pos[t.id].y}`;
    assert.ok(!seen.has(key), `${t.id}: overlaps another node`);
    seen.add(key);
    (t.requiresTheorems ?? []).forEach((p) => assert.ok(pos[p].x < pos[t.id].x, `${p} -> ${t.id} points left`));
  }
  const svgOut = renderMap(theorems, labels, { mastery: {}, progress: {} }, 'rh');
  theorems.forEach((t) => assert.ok(svgOut.includes(`#t-${t.id}`) || svgOut.includes(`data-id="${t.id}"`), `${t.id}: missing from map`));
});

function* figures() {
  for (const t of theorems) {
    if (t.figure) yield [t.id, t.figure];
    for (const s of t.steps) if (s.figure) yield [`${t.id}:${s.title}`, s.figure];
  }
}

test('figures: one or more labelled SVGs with balanced tags', () => {
  for (const [where, f] of figures()) {
    assert.ok(Array.isArray(f.svgs) && f.svgs.length, `${where}: svgs`);
    for (const s of f.svgs) {
      assert.match(s, /^<svg viewBox="[\d. -]+" role="img" aria-label="[^"]+"/, `${where}: svg header`);
      const stack = [];
      for (const [, close, name, self] of s.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
        if (self) continue;
        if (close) assert.equal(stack.pop(), name, `${where}: </${name}> mismatched`);
        else stack.push(name);
      }
      assert.deepEqual(stack, [], `${where}: unclosed ${stack.join(', ')}`);
    }
  }
});

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

// Browsers refuse ES modules served with a non-JS MIME type, and stock nginx
// mime.types has no .mjs (it went out as application/octet-stream: blank page).
// Only ship extensions every static server types correctly.
test('site/ only contains files with standard served MIME types', () => {
  const ok = new Set(['.html', '.css', '.js', '.woff2', '.svg', '.png', '.json']);
  const files = readdirSync(new URL('../site/', import.meta.url), { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile());
  for (const f of files) assert.ok(ok.has(extname(f.name)), `site file with unsafe extension: ${f.name}`);
});

// A missing icon or precache file makes install fail silently on the phone.
test('PWA: manifest icons and service-worker shell exist', () => {
  const site = (p) => new URL(`../site/${p}`, import.meta.url);
  const manifest = JSON.parse(readFileSync(site('manifest.json'), 'utf8'));
  for (const size of ['192x192', '512x512']) {
    assert.ok(manifest.icons.some((i) => i.sizes === size && i.type === 'image/png'), `manifest: no ${size} PNG icon`);
  }
  for (const i of manifest.icons) assert.ok(existsSync(site(i.src)), `manifest icon missing: ${i.src}`);
  const shell = readFileSync(site('sw.js'), 'utf8').match(/const SHELL = (\[.*?\]);/)[1];
  for (const f of JSON.parse(shell.replace(/'/g, '"'))) {
    if (f !== './') assert.ok(existsSync(site(f)), `sw.js precaches a missing file: ${f}`);
  }
});

test('formatter: escapes HTML outside math, keeps lists', () => {
  assert.match(block('a < b'), /a &lt; b/);
  assert.match(block('x\n\n- one\n- two'), /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(inline('**bold** and *it*'), /<strong>bold<\/strong> and <em>it<\/em>/);
});
