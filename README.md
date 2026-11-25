# Riemann

Adaptive, step-by-step walkthroughs of famous proofs. Static site: vanilla JS modules, vendored KaTeX, no build step, no backend, no tracking. Progress lives in the browser's localStorage (export/import in Settings).

**17 proofs and 3 roadmaps**
- *Geometry:* Pythagorean theorem (rearrangement, similar triangles, vectors)
- *Number theory:* √2 irrational · infinitely many primes · Fundamental Theorem of Arithmetic · Fermat's Little Theorem · infinitely many primes ≡ 3 (mod 4) · Euler's ∑1/p diverges · Chebyshev's bound π(x) ≳ x/log x · all Pythagorean triples · Fermat for n = 4 (infinite descent) · −ζ′/ζ = ∑Λ(n)n⁻ˢ
- *Sets & logic:* Cantor's diagonal (ℝ uncountable) · Cantor's theorem (|P(S)| > |S|) · halting problem
- *Analysis:* e is irrational · Navier–Stokes energy identity and scaling
- *Algebra:* Lagrange's theorem (→ Euler's theorem, a second proof of Fermat)
- *Frontiers (roadmaps):* Fermat's Last Theorem · the Riemann Hypothesis · Navier–Stokes existence and smoothness

Three tracks lead to the frontier:
- **Fermat:** Pythagoras → triples → n = 4 by descent → Wiles (Frey curve, Ribet, modularity).
- **Riemann:** Euclid → Euler's product → Chebyshev → von Mangoldt → ζ(s), the Prime Number Theorem, RH.
- **Navier–Stokes:** energy identity → scaling (why energy is supercritical) → the search for blow-up.

A **roadmap** (`kind: 'roadmap'`) maps a proof too long to walk through: it works out what fits and marks the rest `cited`, with a source line, and lists `sources` at the end. The RH and Navier–Stokes roadmaps end with the status of the 2026 claims (as of 24 Nov 2026), taken from the linked reporting; update them as the story moves.

## How it adapts

1. **Concept graph** (`site/js/content/concepts.js`) — 27 concepts with prerequisites, each with a primer and a diagnostic question.
2. **Diagnostic** — picks the question with the most expected inferences: a hit marks all prerequisites solid, a miss marks all dependents weak. It weights the two by the learner's running hit rate, so experts get asked deep concepts and novices shallow ones. Capped at 12 questions; anything still unassessed starts at an estimate from the hit rate and calibrates as you go.
3. **Mastery model** — each concept has p ∈ (0,1), updated by a decaying learning rate (floored at 0.2 so it keeps tracking) on every check question, "Got it" and "I'm lost".
4. **Per-step mode** from the weakest concept the step uses:
   - **Challenge** (p ≥ 0.75): claim only; try to justify before revealing.
   - **Standard**: claim + justification, detail on demand.
   - **Guided** (p < 0.4): full walkthrough + inline refreshers for the weak concepts.

   A wrong check answer or "I'm lost" drops that step to Guided immediately and lowers the concepts.
5. **Path** — recommends proofs whose prerequisite proofs are done first, then the one with the highest readiness (concept mastery + completed prerequisite theorems) and lists the gaps you'll get refreshers on.

## Layout

```
site/                 everything served
  js/engine.js        adaptive model (pure, no DOM)
  js/format.js        $math$ / **md** → HTML, KaTeX rendered here
  js/app.js           hash router + views
  js/content/         concepts + one file per theorem
  vendor/katex/       pinned KaTeX 0.16.47 (ES module + CSS + woff2 fonts)
test/                 node --test: content integrity, every formula through
                      KaTeX in strict mode, engine behaviour
deploy/               Pi: Dockerfile, inner nginx, host nginx vhost
docker-compose.yml    read-only nginx:alpine on 127.0.0.1:3020
```

## Develop

```sh
npm test          # Node ≥ 20, no dependencies
npm run serve     # http://localhost:8080
```

## Adding a theorem

Copy a file in `site/js/content/theorems/`, register it in `content/index.js`. Each step: `title`, `claim`, `why` (standard), `detail` (guided), `concepts` it relies on, optional `check` {prompt, options, answer, explain}, optional `figure` {svgs, caption} (inline SVG built with `content/figures.js`; a theorem can have one under its statement too). Write wrong options that come from real misconceptions, since that's what makes the check useful. Inside math, use `\lt`/`\gt` instead of `<`/`>`. `npm test` fails on any KaTeX error, unbalanced `$`, or a dangling concept or answer index.

## Deploy on the Raspberry Pi

Served at https://riemann.http.nyc. Host nginx terminates TLS and proxies to a read-only nginx:alpine container on `127.0.0.1:3020`.

On push to `main`, `.github/workflows/ci.yml` runs the tests, then sends a `repository_dispatch` to [FrenchCommando/pi-deploy](https://github.com/FrenchCommando/pi-deploy), whose runner on the Pi pulls `/home/frenchcommando/riemann`, rebuilds and checks the site answers. Needs the `PI_DEPLOY_TOKEN` repo secret.

One-time setup on the Pi:

```sh
cd ~ && git clone https://github.com/FrenchCommando/riemann.git && cd riemann
sudo cp deploy/edge-riemann.conf /etc/nginx/sites-available/riemann.conf
sudo ln -s /etc/nginx/sites-available/riemann.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d riemann.http.nyc
```

Manual deploy: `git pull && docker compose up -d --build`. The only state is in users' browsers.
