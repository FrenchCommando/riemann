# Riemann

Adaptive, step-by-step walkthroughs of famous proofs. Static site: vanilla JS modules, vendored KaTeX, no build step, no backend, no tracking. Progress lives in the browser's localStorage (export/import in Settings).

**Proofs:** √2 irrational · infinitely many primes · Fundamental Theorem of Arithmetic · Cantor's diagonal · Fermat's Little Theorem · Euler's ∑1/p diverges (→ ζ(s), the path to Riemann).

## How it adapts

1. **Concept graph** (`site/js/content/concepts.js`) — 15 concepts with prerequisites, each with a primer and a diagnostic question.
2. **Diagnostic** — picks the question with the most expected inferences: a hit marks all prerequisites solid, a miss marks all dependents weak. It weights the two by the learner's running hit rate, so experts get asked deep concepts and novices shallow ones. 5–12 questions instead of 15.
3. **Mastery model** — each concept has p ∈ (0,1), updated by a decaying learning rate (floored at 0.2 so it keeps tracking) on every check question, "Got it" and "I'm lost".
4. **Per-step mode** from the weakest concept the step uses:
   - **Challenge** (p ≥ 0.75): claim only; try to justify before revealing.
   - **Standard**: claim + justification, detail on demand.
   - **Guided** (p < 0.4): full walkthrough + inline refreshers for the weak concepts.

   A wrong check answer or "I'm lost" drops that step to Guided immediately and lowers the concepts.
5. **Path** — recommends the open theorem with the highest readiness (concept mastery + completed prerequisite theorems) and lists the gaps you'll get refreshers on.

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
deploy/               Pi: Dockerfile, inner nginx, compose, edge vhost, deploy.sh
```

## Develop

```sh
npm test          # Node ≥ 20, no dependencies
npm run serve     # http://localhost:8080
```

## Adding a theorem

Copy a file in `site/js/content/theorems/`, register it in `content/index.js`. Each step: `title`, `claim`, `why` (standard), `detail` (guided), `concepts` it relies on, optional `check` {prompt, options, answer, explain}. Write wrong options that come from real misconceptions, since that's what makes the check useful. Inside math, use `\lt`/`\gt` instead of `<`/`>`. `npm test` fails on any KaTeX error, unbalanced `$`, or a dangling concept or answer index.

## Deploy on the Raspberry Pi

Two tiers, matching the existing edge: the edge nginx terminates TLS and proxies to a read-only nginx:alpine container on `127.0.0.1:8088`.

```sh
# once
git clone <this repo> /srv/riemann && cd /srv/riemann
sudo cp deploy/edge-riemann.conf /etc/nginx/sites-enabled/riemann.conf   # set your domain
sudo certbot certonly --webroot -w /var/www/certbot -d <your domain>
sudo nginx -t && sudo systemctl reload nginx

# every deploy (idempotent: pull, test, rebuild, restart, health-check)
./deploy/deploy.sh
```

- If your edge nginx runs in a container rather than on the host, proxy to `host.docker.internal:8088` (add `extra_hosts: ["host.docker.internal:host-gateway"]` to the edge), or put both on a shared Docker network and use `http://riemann:80`.
- Authelia gating is two commented `include` lines in the edge vhost.
- Rebuild from scratch: clone, run the three "once" steps, then `deploy.sh`. The only state is in users' browsers.

## Alternative: GitHub Pages

`.github/workflows/pages.yml` runs the tests and publishes `site/` on push to `main`. Turn it on under repo Settings → Pages → Source: GitHub Actions.
