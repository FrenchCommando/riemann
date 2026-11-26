// Draws the link-preview pictures (og:image, 1200 × 630): site/og/<id>.png for
// every proof, with its title and figure, and site/og/home.png with the map.
// Each card is an HTML page styled by the site's own CSS, photographed by
// headless Chrome, so it has the same fonts, colours and figures as the app.
//
//   npm run cards            all of them
//   npm run cards dvir rh    just these (home for the home card)
//
// Needs Chrome or Edge; set CHROME to its path if it isn't found. The pictures
// are committed, so CI and the server never run this.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { theorems, goals, labels } from '../site/js/content/index.js';
import { inline as fi } from '../site/js/format.js';
import { pathTo } from '../site/js/engine.js';
import { renderMap } from '../site/js/map.js';
import { goalsOf, plain } from './pages.mjs';

const site = fileURLToPath(new URL('../site/', import.meta.url));
const W = 1200, H = 630;

const CHROMES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CSS = `
  html, body { width: ${W}px; height: ${H}px; margin: 0; overflow: hidden; }
  .og { position: absolute; inset: 34px 44px 44px 34px; display: grid; grid-template-columns: 1fr 430px; gap: 36px;
    background: var(--paper); border: 3px solid var(--ink); border-radius: 22px; box-shadow: 10px 10px 0 var(--accent); padding: 38px 40px; }
  .og.wide { display: block; padding: 0; }
  .og.wide .og-head { position: absolute; top: 24px; left: 34px; }
  .og.wide .og-map { position: absolute; inset: 66px 0 -14px; }
  .og-text { display: flex; flex-direction: column; min-width: 0; }
  .og-brand { font: 700 30px var(--hand); }
  .og-eyebrow { font: 700 26px var(--hand); color: var(--accent); margin-top: 26px; }
  .og-title { font-family: var(--serif); font-weight: 700; line-height: 1.12; margin: 10px 0 16px; letter-spacing: -.01em; }
  .og-title .katex { font-size: 1em; }
  .og-attr { font: 22px/1.35 var(--sans); color: var(--muted); }
  .og-url { margin-top: auto; font: 24px var(--hand); color: var(--muted); }
  .og-fig { display: flex; align-items: center; justify-content: center; min-height: 0; }
  .og-fig svg { width: 100%; height: 100%; max-height: 470px; }
  .og-head { display: flex; align-items: baseline; gap: 28px; }
  .og-head .og-brand { font-size: 44px; }
  .og-head .hand { font-size: 26px; }
  .og-map { min-height: 0; display: flex; }
  .og-map svg { width: 100%; height: 100%; min-width: 0; }
`;

function doc(goal, body) {
  const href = (f) => pathToFileURL(join(site, f)).href;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="${href('vendor/katex/katex.min.css')}">
<link rel="stylesheet" href="${href('css/style.css')}">
<style>${CSS}</style></head>
<body data-goal="${goal}">${body}</body></html>`;
}

// Long titles get smaller type so every card's title fits in four lines.
const titleSize = (t) => { const n = plain(t.title).length; return n <= 22 ? 70 : n <= 34 ? 60 : n <= 48 ? 52 : 44; };

function theoremCard(t) {
  const on = goalsOf(t);
  const eyebrow = t.kind === 'roadmap' ? `a destination · ${pathTo(theorems, t.id).length - 1} proofs on the way`
    : on.length ? `on the way to ${on.map((g) => esc(labels[g.id])).join(' and ')}` : esc(t.field.toLowerCase());
  const f = t.figure ?? t.steps.find((s) => s.figure).figure;
  return doc(on[0]?.id ?? '', `<div class="og">
    <div class="og-text">
      <div class="og-brand"><span class="zeta">ζ</span> Riemann</div>
      <div class="og-eyebrow">${eyebrow}</div>
      <div class="og-title" style="font-size:${titleSize(t)}px">${fi(t.title)}</div>
      <div class="og-attr">${esc(t.attribution)}</div>
      <div class="og-url">riemann.http.nyc/p/${t.id}</div>
    </div>
    <div class="og-fig">${f.svgs[0]}</div>
  </div>`);
}

function homeCard() {
  return doc('', `<div class="og wide">
    <div class="og-head"><div class="og-brand"><span class="zeta">ζ</span> Riemann</div>
      <div class="hand">${goals.length} great theorems, and the ${theorems.length - goals.length} proofs that lead up to them</div></div>
    <div class="og-map">${renderMap(theorems, labels, { mastery: {}, progress: {} })}</div>
  </div>`);
}

function shoot(chrome, html, out, tmp) {
  const page = join(tmp, 'card.html');
  writeFileSync(page, html);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    // Blackboard theme whatever the OS theme is (0 = dark): it stands out in light and dark feeds alike.
    `--window-size=${W},${H}`, '--blink-settings=preferredColorScheme=0', '--virtual-time-budget=3000', `--user-data-dir=${join(tmp, 'profile')}`,
    `--screenshot=${out}`, pathToFileURL(page).href], { stdio: 'ignore' });
  if (!existsSync(out) || !statSync(out).size) throw new Error(`no screenshot for ${out}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const chrome = CHROMES.find((c) => c && existsSync(c));
  if (!chrome) throw new Error('Chrome not found: set CHROME to its path');
  const only = new Set(process.argv.slice(2));
  const want = (id) => !only.size || only.has(id);
  mkdirSync(join(site, 'og'), { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), 'riemann-cards-'));
  try {
    if (want('home')) shoot(chrome, homeCard(), join(site, 'og', 'home.png'), tmp);
    for (const t of theorems) if (want(t.id)) { shoot(chrome, theoremCard(t), join(site, 'og', `${t.id}.png`), tmp); process.stdout.write('.'); }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  console.log(' done');
}
