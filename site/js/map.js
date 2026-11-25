// The home-page map: every proof as a node, "builds on" as edges, destinations
// as summits. Pure string output (no DOM), so it can be tested in Node.
//
// Layout: column = longest chain of prerequisite proofs below a node, so every
// edge points right; rows inside a column are ordered by a few barycentre
// sweeps (parents, then children) to keep edges from crossing.

import * as E from './engine.js';

const COL = 165, ROW = 92, PAD_X = 70, PAD_Y = 60;

export function layout(theorems) {
  const byId = Object.fromEntries(theorems.map((t) => [t.id, t]));
  const depth = {};
  const d = (id) => (depth[id] ??= Math.max(-1, ...(byId[id].requiresTheorems ?? []).map(d)) + 1);
  theorems.forEach((t) => d(t.id));
  const cols = [];
  theorems.forEach((t) => (cols[depth[t.id]] ??= []).push(t.id));
  const children = Object.fromEntries(theorems.map((t) => [t.id, []]));
  theorems.forEach((t) => (t.requiresTheorems ?? []).forEach((p) => children[p].push(t.id)));

  const rank = {};
  const setRanks = () => cols.forEach((c) => c.forEach((id, i) => (rank[id] = i - (c.length - 1) / 2)));
  const mean = (ids, fallback) => (ids.length ? ids.reduce((s, x) => s + rank[x], 0) / ids.length : fallback);
  setRanks();
  for (let sweep = 0; sweep < 6; sweep++) {
    const order = sweep % 2 ? [...cols.keys()].reverse() : [...cols.keys()];
    for (const c of order) {
      const key = (id) => (sweep % 2 ? mean(children[id], rank[id]) : mean(byId[id].requiresTheorems ?? [], rank[id]));
      cols[c].sort((a, b) => key(a) - key(b));
      setRanks();
    }
  }
  const tallest = Math.max(...cols.map((c) => c.length));
  const pos = {};
  cols.forEach((c, i) => c.forEach((id, j) => {
    pos[id] = { x: PAD_X + i * COL, y: PAD_Y + (j + (tallest - c.length) / 2) * ROW };
  }));
  return { pos, width: PAD_X * 2 + (cols.length - 1) * COL, height: PAD_Y * 2 + (tallest - 1) * ROW };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderMap(theorems, labels, state, goalId = null) {
  const { pos, width, height } = layout(theorems);
  const onPath = new Set(goalId ? E.pathTo(theorems, goalId).map((t) => t.id) : []);
  const next = goalId ? E.recommend(state, theorems, goalId) : null;
  const done = (id) => E.isDone(state, id);
  const dim = (id) => (goalId && !onPath.has(id) ? ' dim' : '');

  const edges = theorems.flatMap((t) => (t.requiresTheorems ?? []).map((p) => {
    const a = pos[p], b = pos[t.id];
    // Edges that skip columns arc away from the dots they would cross.
    const span = Math.round((b.x - a.x) / COL);
    const bow = span > 1 ? -0.42 * ROW * Math.min(span - 1, 2) : 0;
    const k = (b.x - a.x) * (span > 1 ? 0.3 : 0.5);
    const d = `M${a.x} ${a.y}C${a.x + k} ${a.y + bow} ${b.x - k} ${b.y + bow} ${b.x} ${b.y}`;
    const cls = ['edge', onPath.has(p) && onPath.has(t.id) ? 'on' : '', done(p) && done(t.id) ? 'walked' : '',
      goalId && !(onPath.has(p) && onPath.has(t.id)) ? 'dim' : ''].filter(Boolean).join(' ');
    return `<path class="${cls}" d="${d}"/>`;
  }));

  const nodes = theorems.map((t) => {
    const { x, y } = pos[t.id];
    const label = esc(labels[t.id] ?? t.id);
    const st = `${done(t.id) ? ' done' : ''}${t === next ? ' next' : ''}${onPath.has(t.id) ? ' on' : ''}${dim(t.id)}`;
    if (t.kind === 'roadmap') {
      const current = goalId === t.id;
      const action = current ? `href="#t-${t.id}"` : `data-act="goal" data-id="${t.id}" role="button" tabindex="0"`;
      const tag = current ? 'a' : 'g';
      return `<${tag} class="summit${st}${current ? ' current' : ''}" data-goal="${t.id}" ${action}>
        <title>${current ? 'Open' : 'Choose'} the ${label} roadmap</title>
        <path class="flagpole" d="M${x} ${y + 20}V${y - 34}"/>
        <path class="flag" d="M${x} ${y - 34}L${x + 30} ${y - 26}L${x} ${y - 17}Z"/>
        <circle class="peak" cx="${x}" cy="${y}" r="20"/>
        <text class="summit-label" x="${x}" y="${y + 42}">${label}</text>
      </${tag}>`;
    }
    return `<a class="stop${st}" href="#t-${t.id}">
      <title>${label}: ${esc(t.attribution)}</title>
      ${t === next ? `<circle class="halo" cx="${x}" cy="${y}" r="20"/>` : ''}
      <circle class="dot" cx="${x}" cy="${y}" r="12"/>
      ${done(t.id) ? `<path class="tick" d="M${x - 5} ${y}l4 4l7 -8"/>` : ''}
      <text class="stop-label" x="${x}" y="${y + 30}">${label}</text>
    </a>`;
  });

  return `<svg class="proof-map${goalId ? ' has-goal' : ''}" viewBox="0 0 ${width} ${height}" role="img"
    aria-label="Map of all proofs: each one is drawn to the right of the proofs it builds on; the four flags are the destinations"
    xmlns="http://www.w3.org/2000/svg">${edges.join('')}${nodes.join('')}</svg>`;
}
