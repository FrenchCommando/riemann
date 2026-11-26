// Writes a plain HTML page for every proof (site/p/<id>.html), an index of them
// (site/p/index.html), site/sitemap.xml and site/robots.txt.
//
// The app itself is one page behind #hash routes, so a crawler or a link
// preview sees only the home page. These pages carry each proof's title,
// description and preview image (site/og/<id>.png, drawn by `npm run cards`),
// and the whole proof as static HTML with the math already rendered, linking
// into the app at #t-<id> for the interactive walk-through.
//
// The test suite fails when they are stale; run `npm run pages` to fix it.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { theorems, theoremById, goals, fields } from '../site/js/content/index.js';
import { inline as fi, block as fb } from '../site/js/format.js';
import { pathTo } from '../site/js/engine.js';

export const ORIGIN = 'https://riemann.http.nyc';
const site = fileURLToPath(new URL('../site/', import.meta.url));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// TeX to plain Unicode text, for <title> and meta descriptions, which can't hold markup.
const MACROS = {
  mathbb: null, sqrt: null, frac: null, text: null, mathrm: null, operatorname: null,
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', equiv: '≡', approx: '≈', sim: '∼', gtrsim: '≳', lesssim: '≲',
  cdot: '·', times: '×', infty: '∞', to: '→', mapsto: '↦', in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆',
  sum: 'Σ', prod: 'Π', int: '∫', partial: '∂', nabla: '∇', mid: '|', nmid: '∤', ldots: '…', dots: '…', cdots: '⋯',
  log: 'log', ln: 'ln', exp: 'exp', gcd: 'gcd', lim: 'lim', sin: 'sin', cos: 'cos', max: 'max', min: 'min', dim: 'dim',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ',
  kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ',
  chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Omega: 'Ω',
  left: '', right: '', big: '', Big: '', quad: ' ', qquad: ' ',
};
const BB = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', F: '𝔽' };
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', n: 'ⁿ', '-': '⁻', '+': '⁺', s: 'ˢ', k: 'ᵏ' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', n: 'ₙ', k: 'ₖ' };

export function texToText(tex) {
  const s = tex
    .replace(/\\pmod\s*\{?([^{}\s]+)\}?/g, ' (mod $1)')
    .replace(/\\(mathbb|mathbf)\s*\{?([A-Z])\}?/g, (_, __, l) => BB[l] ?? l)
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '$1/$2')
    .replace(/\\frac\s*(\w)(\w)/g, '$1/$2')
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)').replace(/\\sqrt\s*(\w)/g, '√$1')
    .replace(/\\(text|mathrm|operatorname)\s*\{([^{}]*)\}/g, '$2')
    .replace(/\\[,;:! ]/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, (m, name) => (MACROS[name] ?? m))
    .replace(/\^\{([^{}]*)\}|\^(.)/g, (m, b, c) => {
      const x = b ?? c;
      return [...x].every((ch) => SUP[ch]) ? [...x].map((ch) => SUP[ch]).join('') : `^${x.length > 1 ? `(${x})` : x}`;
    })
    .replace(/_\{([^{}]*)\}|_(.)/g, (m, b, c) => {
      const x = b ?? c;
      return [...x].every((ch) => SUB[ch]) ? [...x].map((ch) => SUB[ch]).join('') : `_${x}`;
    })
    .replace(/[{}]/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

export const plain = (text) =>
  text.replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, (_, d, i) => texToText(d ?? i))
    .replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1$2')
    .replace(/\s+/g, ' ').trim();

// Whole sentences of the text until it says enough (min) without running past
// max characters; a sentence that would leave it too short is cut at a word.
export function summary(text, min = 120, max = 300) {
  let out = '';
  for (const s of plain(text).split(/(?<=[.!?])\s+/)) {
    if (out.length >= min) break;
    const next = out ? `${out} ${s}` : s;
    if (next.length <= max) { out = next; continue; }
    out = `${next.slice(0, max - 1).replace(/[\s,;:—–(]+\S*$/, '')}…`;
    break;
  }
  return out;
}

// The destinations a proof is on the way to (a roadmap is its own).
export const goalsOf = (t) => (t.kind === 'roadmap' ? [t] : goals.filter((g) => pathTo(theorems, g.id).includes(t)));
export const description = (t) => summary(t.kind === 'roadmap' ? `${t.tagline} ${t.intro}` : t.intro);
export const pageUrl = (t) => `${ORIGIN}/p/${t.id}`;

const figure = (f) => !f ? '' :
  `<figure class="fig"><div class="svgs">${f.svgs.join('')}</div>${f.caption ? `<figcaption>${fi(f.caption)}</figcaption>` : ''}</figure>`;

function page({ title, desc, url, image, goal = '', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Riemann">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/vendor/katex/katex.min.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/icon-192.png">
  <meta name="theme-color" content="#fbf8f1" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1b2320" media="(prefers-color-scheme: dark)">
</head>
<body data-goal="${goal}">
  <header>
    <a class="brand" href="/#home"><span class="zeta">ζ</span> Riemann</a>
    <nav><a href="/#home">Journey</a><a href="/p/">All proofs</a><a href="/#concepts">Concepts</a></nav>
  </header>
  <main class="static">
${body}
  </main>
  <footer class="small muted">Riemann: walk up to a great theorem, one complete proof at a time. <a href="/p/">All proofs</a></footer>
</body>
</html>
`;
}

const link = (t) => `<a href="/p/${t.id}">${fi(t.title)}</a>`;

function theoremPage(t) {
  const on = goalsOf(t);
  const goal = on[0]?.id ?? '';
  const where = t.kind === 'roadmap'
    ? `<p class="small journey-banner">A destination, reached through ${pathTo(theorems, t.id).length - 1} proofs.</p>`
    : on.length ? `<p class="small journey-banner">On the way to ${on.map(link).join(', ')}</p>` : '';
  const builds = (t.requiresTheorems ?? []).map((x) => theoremById[x]);
  const usedBy = theorems.filter((u) => (u.requiresTheorems ?? []).includes(t.id));
  const path = t.kind === 'roadmap' ? pathTo(theorems, t.id).filter((x) => x !== t) : [];

  const steps = t.steps.map((s, i) => `
    <li class="step past open">
      <div class="step-top"><span class="num">${i + 1}</span><span class="step-title">${esc(s.title)}</span>${s.cited ? '<span class="tag cited">cited</span>' : ''}</div>
      <p class="claim">${fi(s.claim)}</p>${s.cited ? `<p class="cite">${fi(s.cited)}</p>` : ''}${figure(s.figure)}
      <div class="why">${fb(s.why)}</div>
      <details><summary>More detail</summary><div class="detail">${fb(s.detail)}</div></details>
    </li>`).join('');

  const body = `<article class="theorem">
    ${where}
    <h1>${fi(t.title)}</h1>
    <div class="muted small">${esc(t.attribution)}</div>
    <div class="statement"><span class="eyebrow">Theorem</span>${fb(t.statement)}</div>
    ${figure(t.figure)}
    <p>${fi(t.intro)}</p>
    ${t.kind === 'roadmap' ? `<p class="note"><strong>Roadmap, not a full proof.</strong> Steps marked <span class="tag cited">cited</span> state a major result with its source instead of proving it; the rest are worked out here.</p>` : ''}
    ${builds.length ? `<p class="small">Builds on ${builds.map(link).join(', ')}.</p>` : ''}
    <div class="row"><a class="btn primary" href="/#t-${t.id}">Walk through it step by step</a>
      <span class="hand">a check at each step, detail adjusted to what you know</span></div>
    <div class="eyebrow">Proof · ${t.steps.length} steps</div>
    <ol class="steps">${steps}
    </ol>
    <section class="card"><p><strong>Takeaway.</strong> ${fi(t.takeaway)}</p></section>
    ${path.length ? `<section><div class="eyebrow">The path</div><ol>${path.map((x) => `<li>${link(x)}</li>`).join('')}</ol></section>` : ''}
    ${usedBy.length ? `<p class="small">Used by ${usedBy.map(link).join(', ')}.</p>` : ''}
    ${t.sources ? `<section class="sources"><div class="eyebrow">Sources</div><ul>${t.sources.map((s) =>
      `<li><a href="${s.url}" rel="noopener noreferrer">${fi(s.label)}</a></li>`).join('')}</ul></section>` : ''}
  </article>`;

  return page({
    title: `${plain(t.title)} · Riemann`,
    desc: description(t),
    url: pageUrl(t),
    image: `${ORIGIN}/og/${t.id}.png`,
    goal,
    body,
  });
}

function indexPage() {
  const row = (t) => `<li><a href="/p/${t.id}" class="theorem-row">
      <span class="t-title">${fi(t.title)}</span><span class="t-meta">${esc(t.attribution)}</span></a></li>`;
  const dest = goals.map((g) => `<li><a href="/p/${g.id}" class="theorem-row">
      <span class="t-title">${fi(g.title)}</span><span class="t-meta">${fi(g.tagline)} · ${pathTo(theorems, g.id).length - 1} proofs on the way</span></a></li>`).join('');
  const groups = fields.filter((f) => f !== 'Frontiers').map((f) =>
    `<section><h3>${esc(f)}</h3><ul class="theorems">${theorems.filter((t) => t.field === f).map(row).join('')}</ul></section>`).join('');
  return page({
    title: 'All proofs · Riemann',
    desc: `${theorems.length - goals.length} complete proofs, each a step on the way to one of ${goals.length} great theorems: ${goals.map((g) => plain(g.title)).join(', ')}.`,
    url: `${ORIGIN}/p/`,
    image: `${ORIGIN}/og/home.png`,
    body: `<h1>All proofs</h1>
    <p>Every proof here as a plain page. <a href="/#home">The map</a> lays them out by what builds on what, and walks you through them one step at a time.</p>
    <section><h3>Destinations</h3><ul class="theorems">${dest}</ul></section>
    ${groups}`,
  });
}

const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[`${ORIGIN}/`, `${ORIGIN}/p/`, ...theorems.map(pageUrl)].map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;

const robots = () => `User-agent: *
Allow: /
Sitemap: ${ORIGIN}/sitemap.xml
`;

// Every generated file: served path -> contents.
export function pages() {
  return {
    ...Object.fromEntries(theorems.map((t) => [`p/${t.id}.html`, theoremPage(t)])),
    'p/index.html': indexPage(),
    'sitemap.xml': sitemap(),
    'robots.txt': robots(),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(`${site}p`, { recursive: true });
  const out = pages();
  for (const [f, s] of Object.entries(out)) writeFileSync(`${site}${f}`, s);
  console.log(`${Object.keys(out).length} files`);
}
