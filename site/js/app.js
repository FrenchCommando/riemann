import * as E from './engine.js';
import { inline as fi, block as fb } from './format.js';
import { concepts, conceptById, theorems, theoremById, fields, goals } from './content/index.js';

// ---------- state ----------

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(E.STORAGE_KEY));
    if (s && s.v === 1) return s;
  } catch {}
  return E.initialState();
}
let state = load();
function save() {
  try { localStorage.setItem(E.STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// Transient UI state, reset on navigation.
let ui = {};
const app = document.getElementById('app');

// ---------- small view helpers ----------

const pct = (x) => Math.round(x * 100);
const bar = (x, label = '') =>
  `<span class="bar" role="img" aria-label="${label} ${pct(x)}%"><span style="width:${pct(x)}%"></span></span>`;
const masteryLabel = (x) => (x >= E.HI ? 'solid' : x >= E.LO ? 'shaky' : 'new');
const chip = (id) => `<a class="chip ${masteryLabel(E.p(state, id))}" href="#c-${id}">${conceptById[id].name}</a>`;
const MODE_TEXT = {
  challenge: ['Challenge', 'You know the ideas here — try to justify the claim before revealing.'],
  standard: ['Standard', 'Claim and justification, with more detail on demand.'],
  guided: ['Guided', 'Full walkthrough, with refreshers for the concepts involved.'],
};

// Figures are trusted, authored SVG from content/ (see content/figures.js).
const figure = (f) => !f ? '' :
  `<figure class="fig"><div class="svgs">${f.svgs.join('')}</div>${f.caption ? `<figcaption>${fi(f.caption)}</figcaption>` : ''}</figure>`;

function question(q, key, { onAnswer } = {}) {
  const chosen = ui.answers?.[key];
  const opts = q.options.map((o, i) => {
    let cls = '';
    if (chosen !== undefined) cls = i === q.answer ? 'right' : i === chosen ? 'wrong' : 'dim';
    return `<button class="opt ${cls}" data-act="answer" data-key="${key}" data-i="${i}" ${chosen !== undefined ? 'disabled' : ''}>${fi(o)}</button>`;
  }).join('');
  const fb_ = chosen === undefined ? '' :
    `<div class="feedback ${chosen === q.answer ? 'ok' : 'no'}"><strong>${chosen === q.answer ? 'Right.' : chosen === -1 ? 'No problem.' : 'Not quite.'}</strong> ${fi(q.explain)}</div>`;
  return `<div class="question"><div class="prompt">${fi(q.prompt)}</div><div class="opts">${opts}</div>${fb_}</div>`;
}

// ---------- views ----------

const goalOf = () => (state.goal && theoremById[state.goal]) || null;

// Position of a theorem on the current goal's path, if it is on it.
function onPath(t) {
  const goal = goalOf();
  if (!goal) return null;
  const path = E.pathTo(theorems, goal.id);
  const i = path.indexOf(t);
  return i < 0 ? null : { goal, path, i };
}

function goalCard(g) {
  const { done, total } = E.pathProgress(state, theorems, g.id);
  const current = state.goal === g.id;
  return `<article class="card goal-card ${current ? 'current' : ''}">
    <div class="eyebrow">${g.status}</div>
    <h2><a href="#t-${g.id}">${fi(g.title)}</a></h2>
    <p class="muted">${fi(g.tagline)}</p>
    <p class="small">${total - 1} proofs on the way, then the destination ${bar(done / total, 'progress')} ${done}/${total}</p>
    <div class="row"><button class="btn primary" data-act="goal" data-id="${g.id}">${current ? 'Continue' : done ? 'Resume this journey' : 'Start this journey'}</button></div>
  </article>`;
}

function viewGoals() {
  return `<section class="intro">
      <h1>Build up to a great theorem</h1>
      <p class="muted">Pick a destination. Each is reached through a sequence of complete proofs, each one using the ones before it, and every step adapts to what you already know.</p>
    </section>
    <div class="goals">${goals.map(goalCard).join('')}</div>`;
}

function viewJourney(goal) {
  const path = E.pathTo(theorems, goal.id);
  const next = E.recommend(state, theorems, goal.id);
  const { done, total } = E.pathProgress(state, theorems, goal.id);
  const g = next ? E.gaps(state, concepts, next) : [];

  const node = (t, i) => {
    const pr = state.progress[t.id];
    const isGoal = t === goal;
    const cls = E.isDone(state, t.id) ? 'done' : t === next ? 'next' : '';
    const waiting = (t.requiresTheorems ?? []).filter((x) => !E.isDone(state, x));
    const status = E.isDone(state, t.id) ? '<span class="tag done">done</span>'
      : pr?.step ? `<span class="tag">step ${pr.step + 1}/${t.steps.length}</span>`
      : t === next ? '<span class="tag next">next</span>' : '';
    return `<li class="${cls} ${isGoal ? 'goal' : ''}">
      <span class="jnode">${isGoal ? '∎' : i + 1}</span>
      <a href="#t-${t.id}" class="theorem-row">
        <span class="t-title">${fi(t.title)} ${isGoal ? '<span class="tag">destination</span>' : ''} ${status}</span>
        <span class="t-meta">${t.attribution}</span>
        ${!E.isDone(state, t.id) && waiting.length && t !== next ? `<span class="t-meta">after ${waiting.map((x) => fi(theoremById[x].title)).join(', ')}</span>` : ''}
      </a></li>`;
  };

  return `<section class="journey-head">
      <div class="eyebrow">Your destination · ${goal.status}</div>
      <h1>${fi(goal.title)}</h1>
      <p class="muted">${fi(goal.tagline)}</p>
      <p class="small">${bar(done / total, 'journey progress')} ${done} of ${total} done</p>
      <div class="row">
        ${next ? `<a class="btn primary" href="#t-${next.id}"><span>${state.progress[next.id]?.step ? 'Continue' : 'Next'}: ${fi(next.title)}</span></a>` : '<span class="tag done">journey complete</span>'}
        <button class="btn ghost" data-act="pick-goal">Change destination</button>
      </div>
      ${g.length ? `<p class="small">Next proof will guide you through: ${g.map(chip).join(' ')}</p>` : ''}
    </section>
    <ol class="journey">${path.map(node).join('')}</ol>`;
}

function viewHome() {
  const calib = state.diagnosed ? '' : `
    <section class="card hero">
      <h2>Start by calibrating</h2>
      <p>A short diagnostic (one question per concept, skipping what it can infer — 5–12 questions, about two minutes) sets how much detail each proof step shows you. It keeps adapting as you go.</p>
      <div class="row"><a class="btn primary" href="#diagnostic">Take the diagnostic</a>
      <button class="btn ghost" data-act="skip-diag">Skip — start from scratch</button></div>
    </section>`;

  const goal = goalOf();
  const main = goal && !ui.pick ? viewJourney(goal) : viewGoals();

  const row = (t) => {
    const pr = state.progress[t.id];
    const status = pr?.done ? '<span class="tag done">done</span>' : pr?.step ? `<span class="tag">step ${pr.step + 1}/${t.steps.length}</span>` : '';
    const builds = (t.requiresTheorems ?? []).filter((x) => !E.isDone(state, x));
    return `<li><a href="#t-${t.id}" class="theorem-row">
      <span class="t-title">${fi(t.title)} ${t.kind === 'roadmap' ? '<span class="tag">roadmap</span>' : ''} ${status}</span>
      <span class="t-meta">${t.attribution}${builds.length ? ` · builds on ${builds.map((x) => fi(theoremById[x].title)).join(', ')}` : ''}</span>
      <span class="t-ready">readiness ${bar(E.readiness(state, t), 'readiness')}</span>
    </a></li>`;
  };
  const groups = fields.map((f) => {
    const ts = theorems.filter((t) => t.field === f);
    const done = ts.filter((t) => E.isDone(state, t.id)).length;
    return `<section><h3>${f} <span class="small muted">${done}/${ts.length}</span></h3><ul class="theorems">${ts.map(row).join('')}</ul></section>`;
  }).join('');

  return `${main}${calib}
    <details class="all-proofs"><summary>All ${theorems.length} proofs, by field</summary>${groups}</details>
    <section><h3>Your concept map <a class="small" href="#concepts">all concepts →</a></h3>
      <div class="chips">${E.topoOrder(concepts).map(chip).join(' ')}</div>
      <p class="small muted">Green = solid, amber = shaky, grey = new. Tap one to read its primer or practise.</p>
    </section>`;
}

function viewDiagnostic() {
  ui.diag ??= E.newDiagnostic();
  const id = ui.current ?? E.nextDiagnostic(concepts, ui.diag);
  if (!id) {
    if (!ui.diag.defaulted) E.finishDiagnostic(state, concepts, ui.diag);
    save();
    const solid = concepts.filter((c) => E.p(state, c.id) >= E.HI).length;
    return `<section class="card"><h2>Calibrated</h2>
      <p>${solid} of ${concepts.length} concepts look solid. Proof steps that rely on the others will be guided, with refreshers inline.</p>
      <p>Answered ${ui.diag.asked.length} questions and inferred ${ui.diag.inferred.length} from the prerequisite graph${ui.diag.defaulted.length ? `; ${ui.diag.defaulted.length} more will calibrate as you go` : ''}.</p>
      <a class="btn primary" href="#home">See your path</a></section>`;
  }
  ui.current = id;
  const c = conceptById[id];
  const answered = ui.answers?.diag !== undefined;
  const remaining = Math.min(concepts.length - ui.diag.asked.length - ui.diag.inferred.length, E.MAX_DIAG - ui.diag.asked.length);
  return `<section class="card">
    <div class="eyebrow">Diagnostic · question ${ui.diag.asked.length + 1} · at most ${remaining - 1} more</div>
    <h2>${c.name}</h2>
    ${question(c.q, 'diag')}
    <div class="row">
      ${answered ? `<button class="btn primary" data-act="diag-next">Next</button>`
        : `<button class="btn ghost" data-act="diag-unknown">I haven't seen this</button>`}
    </div></section>`;
}

function primerCard(id) {
  const c = conceptById[id];
  return `<aside class="primer"><div class="eyebrow">Refresher · <a href="#c-${id}">${c.name}</a></div>${fb(c.primer)}</aside>`;
}

function stepHtml(t, s, i, cur) {
  const fallback = Math.min(...t.prereqs.map((c) => E.p(state, c)));
  let mode = E.stepMode(state, s, fallback);
  if (ui.lost?.[i]) mode = 'guided';
  const [mname, mdesc] = MODE_TEXT[mode];
  const isCur = i === cur;

  if (!isCur && !ui.open?.[i]) {
    return `<li class="step past"><button class="step-head" data-act="toggle" data-i="${i}">
      <span class="num">${i + 1}</span><span>${fi(s.claim)}</span></button></li>`;
  }

  const revealed = mode !== 'challenge' || ui.reveal?.[i];
  const weak = mode === 'guided' ? (ui.lost?.[i] ? s.concepts : E.weakConcepts(state, s.concepts)) : [];
  const key = `${t.id}:${i}`;
  const needsAnswer = s.check && ui.answers?.[key] === undefined;

  let body = `<p class="claim">${fi(s.claim)}</p>${s.cited ? `<p class="cite">${fi(s.cited)}</p>` : ''}${figure(s.figure)}`;
  if (!revealed) {
    body += `<div class="tryit"><p>How would you justify this? Think it through, then reveal.</p>
      <button class="btn" data-act="reveal" data-i="${i}">Reveal justification</button></div>`;
  } else {
    body += `<div class="why">${fb(s.why)}</div>`;
    if (mode === 'guided') body += `<div class="detail">${fb(s.detail)}</div>${weak.map(primerCard).join('')}`;
    else body += `<details><summary>More detail</summary><div class="detail">${fb(s.detail)}</div></details>`;
  }
  if (s.check && (revealed || !isCur)) body += `<div class="check"><div class="eyebrow">Check</div>${question(s.check, key)}</div>`;

  let actions = '';
  if (isCur && revealed) {
    actions = `<div class="row">
      <button class="btn primary" data-act="next" ${needsAnswer ? 'disabled title="Answer the check first"' : ''}>${i === t.steps.length - 1 ? 'Finish proof' : 'Got it — next step'}</button>
      ${mode !== 'guided' || !ui.lost?.[i] ? `<button class="btn ghost" data-act="lost" data-i="${i}">I'm lost</button>` : ''}
    </div>`;
  }

  return `<li class="step ${isCur ? 'current' : 'past open'}">
    <div class="step-top"><span class="num">${i + 1}</span><span class="step-title">${s.title}</span>
      ${s.cited ? '<span class="tag cited">cited</span>' : ''}
      <span class="mode ${mode}" title="${mdesc}">${mname}</span>
      ${!isCur ? `<button class="link" data-act="toggle" data-i="${i}">collapse</button>` : ''}</div>
    ${body}${actions}</li>`;
}

function viewTheorem(id) {
  const t = theoremById[id];
  if (!t) return `<p>Unknown theorem.</p>`;
  const pr = (state.progress[id] ??= { step: 0 });
  const cur = pr.done && !ui.review ? t.steps.length : Math.min(pr.step ?? 0, t.steps.length);
  const g = E.gaps(state, concepts, t);
  const builds = (t.requiresTheorems ?? []).filter((x) => !E.isDone(state, x));

  const steps = t.steps.slice(0, Math.min(cur + 1, t.steps.length)).map((s, i) => stepHtml(t, s, i, cur)).join('');
  const where = onPath(t);
  const after = where && where.path.slice(where.i + 1).find((x) => !E.isDone(state, x.id));
  const end = cur >= t.steps.length ? `
    <section class="card done-card"><div class="eyebrow">∎ ${t === where?.goal ? 'Destination reached' : 'Proof complete'}</div>
      <p><strong>Takeaway.</strong> ${fi(t.takeaway)}</p>
      ${after ? `<p class="small">Next on the way to ${fi(where.goal.title)}: <a href="#t-${after.id}">${fi(after.title)}</a></p>` : ''}
      <div class="row">${pr.done ? (after ? `<a class="btn primary" href="#t-${after.id}">Next proof</a>` : '')
        : `<button class="btn primary" data-act="complete">${after ? 'Mark complete, go to the next proof' : 'Mark complete'}</button>`}
      <button class="btn ghost" data-act="restart">Walk through again</button>
      <a class="btn ghost" href="#home">${where ? 'Back to the journey' : 'Home'}</a></div></section>` : '';

  const banner = where
    ? `<p class="small journey-banner">${t === where.goal ? 'Destination' : `Proof ${where.i + 1} of ${where.path.length - 1}`} on the way to <a href="#home">${fi(where.goal.title)}</a></p>`
    : t.kind === 'roadmap' ? `<p class="small journey-banner"><button class="link inline" data-act="goal" data-id="${t.id}">Make this your destination</button> to be walked through the ${E.pathTo(theorems, t.id).length - 1} proofs it builds on.</p>` : '';

  return `<article class="theorem">
    <a class="small" href="#home">← ${goalOf() ? 'Journey' : 'Home'}</a>
    ${banner}
    <h1>${fi(t.title)}</h1>
    <div class="muted small">${t.attribution}</div>
    <div class="statement"><span class="eyebrow">Theorem</span>${fb(t.statement)}</div>
    ${figure(t.figure)}
    <p>${fi(t.intro)}</p>
    ${t.kind === 'roadmap' ? `<p class="note"><strong>Roadmap, not a full proof.</strong> Steps marked <span class="tag cited">cited</span> state a major result with its source instead of proving it; the rest are worked out here.</p>` : ''}
    ${builds.length ? `<p class="note">Builds on ${builds.map((x) => `<a href="#t-${x}">${fi(theoremById[x].title)}</a>`).join(', ')} — you can go ahead, but those will make more sense first.</p>` : ''}
    ${g.length && cur === 0 ? `<p class="note">You'll get refreshers on: ${g.map(chip).join(' ')}</p>` : ''}
    <div class="eyebrow">Proof · ${Math.min(cur, t.steps.length)}/${t.steps.length} steps</div>
    <ol class="steps">${steps}</ol>${end}
    ${t.sources ? `<section class="sources"><div class="eyebrow">Sources</div><ul>${t.sources.map((s) =>
      `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${fi(s.label)}</a></li>`).join('')}</ul></section>` : ''}</article>`;
}

function viewConcepts() {
  const rows = E.topoOrder(concepts).map((id) => {
    const c = conceptById[id];
    const x = E.p(state, id);
    return `<li><a href="#c-${id}" class="concept-row"><span>${c.name}</span>${bar(x, c.name)}<span class="small muted">${masteryLabel(x)}</span></a></li>`;
  }).join('');
  return `<h1>Concepts</h1><p class="muted">Ordered so prerequisites come first.</p><ul class="concepts">${rows}</ul>`;
}

function viewConcept(id) {
  const c = conceptById[id];
  if (!c) return `<p>Unknown concept.</p>`;
  const usedIn = theorems.filter((t) => t.prereqs.includes(id) || t.steps.some((s) => s.concepts.includes(id)));
  const dependents = concepts.filter((d) => d.prereqs.includes(id));
  return `<article><a class="small" href="#concepts">← Concepts</a>
    <h1>${c.name}</h1><p class="muted">${fi(c.summary)}</p>
    <p class="small">Mastery ${bar(E.p(state, id), c.name)} ${masteryLabel(E.p(state, id))}</p>
    <section class="card">${fb(c.primer)}</section>
    <section class="card"><div class="eyebrow">Practice</div>${question(c.q, 'practice')}
      ${ui.answers?.practice !== undefined ? `<button class="btn ghost" data-act="retry">Try again</button>` : ''}</section>
    ${c.prereqs.length ? `<p class="small">Builds on: ${c.prereqs.map(chip).join(' ')}</p>` : ''}
    ${dependents.length ? `<p class="small">Leads to: ${dependents.map((d) => chip(d.id)).join(' ')}</p>` : ''}
    ${usedIn.length ? `<p class="small">Used in: ${usedIn.map((t) => `<a href="#t-${t.id}">${fi(t.title)}</a>`).join(' · ')}</p>` : ''}
  </article>`;
}

function viewSettings() {
  const m = (v, label, desc) => `<label class="radio"><input type="radio" name="mode" value="${v}" ${state.mode === v ? 'checked' : ''} data-act="mode"> <span><strong>${label}</strong> <span class="muted">${desc}</span></span></label>`;
  return `<h1>Settings</h1>
    <section class="card"><h3>Detail level</h3>
      ${m('auto', 'Adaptive', '(recommended) per step, from your concept mastery')}
      ${m('guided', 'Always guided', 'full walkthroughs everywhere')}
      ${m('standard', 'Always standard', '')}
      ${m('challenge', 'Always challenge', 'hide every justification until you try')}
    </section>
    <section class="card"><h3>Progress</h3>
      <p class="small muted">Stored only in this browser. Export to move it to another device.</p>
      <div class="row">
        <button class="btn" data-act="export">Export</button>
        <label class="btn">Import<input type="file" accept="application/json" data-act="import" hidden></label>
        <a class="btn" href="#diagnostic">Redo diagnostic</a>
        <button class="btn danger" data-act="reset">Reset everything</button>
      </div></section>`;
}

// ---------- router ----------

function route() {
  // Routes are plain #names (#home, #t-sqrt2, #c-primes, #concepts, #prefs, #diagnostic).
  const h = location.hash.slice(1) || 'home';
  const m = h.match(/^([tc])-(.+)$/);
  const view = m ? m[1] : h, id = m?.[2];
  if (view !== ui.view || id !== ui.id) ui = { view, id };
  let html;
  switch (view) {
    case 'diagnostic': html = viewDiagnostic(); break;
    case 't': html = viewTheorem(id); break;
    case 'concepts': html = viewConcepts(); break;
    case 'c': html = viewConcept(id); break;
    case 'prefs': html = viewSettings(); break;
    default: html = viewHome();
  }
  app.innerHTML = html;
  const nav = { t: 'home', diagnostic: 'home', c: 'concepts' }[view] ?? view;
  document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${nav}`));
}

function rerender(scrollTo) {
  route();
  if (scrollTo) document.querySelector(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- actions ----------

function onAnswer(key, i) {
  ui.answers ??= {};
  ui.answers[key] = i;
  if (key === 'diag') return; // recorded on "Next"
  if (key === 'practice') {
    E.observe(state, ui.id, i === conceptById[ui.id].q.answer);
  } else {
    const [tid, si] = key.split(':');
    const step = theoremById[tid].steps[+si];
    const ok = i === step.check.answer;
    step.concepts.forEach((c) => E.observe(state, c, ok));
    if (!ok) { ui.lost ??= {}; ui.lost[+si] = true; } // a miss switches this step to guided
  }
  save();
}

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  const act = el.dataset.act;
  const i = el.dataset.i !== undefined ? +el.dataset.i : undefined;
  const t = theoremById[ui.id];
  switch (act) {
    case 'answer': onAnswer(el.dataset.key, i); break;
    case 'diag-unknown': ui.answers = { diag: -1 }; break;
    case 'diag-next': {
      const c = conceptById[ui.current];
      const a = ui.answers.diag;
      E.recordDiagnostic(state, concepts, ui.diag, ui.current, a === -1 ? 'unknown' : a === c.q.answer ? 'correct' : 'wrong');
      ui.current = undefined; ui.answers = {}; save(); break;
    }
    case 'skip-diag': state.diagnosed = true; save(); break;
    case 'reveal': (ui.reveal ??= {})[i] = true; break;
    case 'toggle': (ui.open ??= {})[i] = !ui.open[i]; break;
    case 'lost': {
      (ui.lost ??= {})[i] = true;
      t.steps[i].concepts.forEach((c) => E.observe(state, c, false));
      save(); break;
    }
    case 'next': {
      const pr = state.progress[t.id];
      const s = t.steps[pr.step];
      if (!ui.lost?.[pr.step] && !s.check) s.concepts.forEach((c) => E.nudge(state, c));
      pr.step += 1; save();
      return rerender('.step.current, .done-card');
    }
    case 'complete': {
      E.completeTheorem(state, t); save();
      const where = onPath(t);
      const after = where && where.path.slice(where.i + 1).find((x) => !E.isDone(state, x.id));
      location.hash = after ? `#t-${after.id}` : '#home';
      return;
    }
    case 'goal': state.goal = el.dataset.id; save(); ui = {}; location.hash = '#home'; return rerender();
    case 'pick-goal': ui.pick = true; break;
    case 'restart': state.progress[t.id].step = 0; ui = { view: ui.view, id: ui.id, review: true }; save(); break;
    case 'retry': delete ui.answers.practice; break;
    case 'export': {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'riemann-progress.json' });
      a.click(); URL.revokeObjectURL(a.href); return;
    }
    case 'reset':
      if (el.dataset.confirm) { state = E.initialState(); save(); location.hash = '#home'; return; }
      el.dataset.confirm = '1'; el.textContent = 'Tap again to confirm'; return;
    default: return;
  }
  rerender();
});

app.addEventListener('change', async (ev) => {
  const el = ev.target;
  if (el.dataset.act === 'mode') { state.mode = el.value; save(); }
  if (el.dataset.act === 'import' && el.files[0]) {
    try {
      const s = JSON.parse(await el.files[0].text());
      if (s.v !== 1 || typeof s.mastery !== 'object') throw new Error('not a Riemann progress file');
      state = s; save(); location.hash = '#home';
    } catch (e) { alert(`Import failed: ${e.message}`); }
  }
});

window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
route();
