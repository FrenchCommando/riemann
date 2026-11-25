import { svg, path, text, line } from '../figures.js';

const r = String.raw;

// psi(x) = sum of Lambda(n) for n <= x, against the line y = x, for x up to 60.
const N = 60, S = 5; // 5 units per 1
const lambda = (n) => {
  for (let p = 2; p <= n; p++) {
    if (n % p === 0) { let m = n; while (m % p === 0) m /= p; return m === 1 ? Math.log(p) : 0; }
  }
  return 0;
};
const stair = [[0, 0]];
let psi = 0;
for (let n = 2; n <= N; n++) {
  const l = lambda(n);
  if (l) { stair.push([S * n, -S * psi]); psi += l; stair.push([S * n, -S * psi]); }
}
stair.push([S * N, -S * psi]);
const ticks = [10, 20, 30, 40, 50, 60];
const psiFig = svg('-28 -318 350 345', 'Staircase graph of the Chebyshev function psi of x for x up to 60, jumping by log p at each prime power p^k, staying close to the dashed line y = x',
  path(`M0 0H${S * N + 8}M0 0V${-S * N - 8}`, 'f-axis'),
  ...ticks.map((t) => path(`M${S * t} 0v4M0 ${-S * t}h-4`, 'f-axis')),
  ...ticks.map((t) => text(S * t, 14, String(t), 'f-pt')),
  ...ticks.map((t) => text(-15, -S * t, String(t), 'f-pt')),
  path(`M0 0L${S * N} ${-S * N}`, 'f-alt'),
  line(stair, 'f-curve'),
  text(282, -310, 'y = x', 'f-sm'), text(300, -258, 'ψ(x)', 'f-sm f-acc'));

export default {
  id: 'vonmangoldt',
  field: 'Number theory',
  title: r`How $\zeta$ sees the primes: $-\zeta'/\zeta = \sum \Lambda(n)\, n^{-s}$`,
  attribution: 'Hans von Mangoldt, 1895; the bridge from Euler to Riemann',
  statement: r`Let $\Lambda(n) = \log p$ if $n = p^k$ is a prime power ($k \ge 1$), and $\Lambda(n) = 0$ otherwise. For real $s \gt 1$,
$$-\frac{\zeta'(s)}{\zeta(s)} = \sum_{n \ge 1} \frac{\Lambda(n)}{n^s}.$$`,
  figure: {
    svgs: [psiFig],
    caption: r`$\psi(x) = \sum_{n \le x} \Lambda(n)$ jumps by $\log p$ at every prime power. The Prime Number Theorem says $\psi(x) \sim x$; the Riemann Hypothesis says it stays within about $\sqrt x \log^2 x$ of the line.`,
  },
  prereqs: ['logarithm', 'series', 'primes', 'calculus'],
  requiresTheorems: ['euler'],
  intro: r`Euler's product turned $\zeta$ into a statement about primes. Taking its logarithmic derivative turns it into a statement about the **weighted prime count** $\psi(x)$, which is the form Riemann's theory uses: every zero of $\zeta$ becomes a pole of $\zeta'/\zeta$, and every pole leaves a trace in $\psi(x)$.`,
  steps: [
    {
      title: 'Weight each prime power by log p',
      claim: r`$\psi(x) = \sum_{n \le x} \Lambda(n)$ equals $\log \operatorname{lcm}(1, 2, \dots, \lfloor x \rfloor)$.`,
      why: r`The lcm of $1, \dots, N$ contains each prime $p \le N$ to the highest power $p^k \le N$. That power contributes $k \log p$ to the log, and $\psi$ counts $\log p$ once for each of $p, p^2, \dots, p^k$.`,
      detail: r`Examples: $\Lambda(8) = \log 2$, $\Lambda(9) = \log 3$, $\Lambda(6) = 0$, $\Lambda(1) = 0$.

Fix $N = \lfloor x \rfloor$ and a prime $p \le N$, and let $p^k$ be the largest power of $p$ that is $\le N$. The prime powers $p, p^2, \dots, p^k$ are all $\le N$, each with $\Lambda = \log p$: total $k\log p = \log p^k$. Multiplying over primes, $\psi(x) = \log \prod_{p \le N} p^k = \log \operatorname{lcm}(1, \dots, N)$.

Why this weighting: primes near $x$ have "probability" about $1/\log x$, so weighting by $\log p$ makes the expected count about $1$ per integer, and $\psi(x) \approx x$. (The prime powers $p^k$ with $k \ge 2$ add only about $\sqrt x$.)`,
      concepts: ['primes', 'logarithm'],
      check: {
        prompt: r`What is $\psi(10)$?`,
        options: [r`$\log 2520$`, r`$\log 10!$`, r`$\log 210$`],
        answer: 0,
        explain: r`$\operatorname{lcm}(1, \dots, 10) = 2^3 \cdot 3^2 \cdot 5 \cdot 7 = 2520$, so $\psi(10) = \log 2520 \approx 7.83$, close to $10$. ($10!$ overcounts; $210 = 2 \cdot 3 \cdot 5 \cdot 7$ misses the higher prime powers.)`,
      },
    },
    {
      title: 'Λ adds up to log n',
      claim: r`For every $n \ge 1$: $\displaystyle \sum_{d \mid n} \Lambda(d) = \log n$.`,
      why: r`If $n = \prod p^{k_p}$, the divisors of $n$ that are prime powers are $p^j$ with $1 \le j \le k_p$, each contributing $\log p$: total $\sum_p k_p \log p = \log n$.`,
      detail: r`Only prime-power divisors contribute, since $\Lambda$ vanishes elsewhere. By unique factorisation, $n = \prod_p p^{k_p}$, and its prime-power divisors are exactly $p^j$ with $1 \le j \le k_p$. So
$$\sum_{d \mid n} \Lambda(d) = \sum_p k_p \log p = \log \prod_p p^{k_p} = \log n.$$
Example: $n = 12$: divisors $2, 4, 3$ contribute $\log 2 + \log 2 + \log 3 = \log 12$.`,
      concepts: ['primes', 'logarithm'],
    },
    {
      title: 'Multiply two Dirichlet series',
      claim: r`For $s \gt 1$: $\displaystyle \zeta(s) \cdot \sum_{k \ge 1} \frac{\Lambda(k)}{k^s} = \sum_{n \ge 1} \frac{\log n}{n^s}$.`,
      why: r`Multiplying $\sum_m m^{-s}$ by $\sum_k \Lambda(k) k^{-s}$ and grouping terms with $mk = n$ gives coefficient $\sum_{k \mid n} \Lambda(k) = \log n$ in front of $n^{-s}$.`,
      detail: r`All three series converge absolutely for $s \gt 1$ (note $0 \le \Lambda(k) \le \log k$, and $\sum \log n \cdot n^{-s}$ converges for $s \gt 1$, by comparison with $\sum n^{-(1 + s)/2}$ since $\log n \le C n^{(s-1)/2}$). Absolutely convergent series can be multiplied and regrouped freely:
$$\sum_{m}\frac{1}{m^s}\sum_{k}\frac{\Lambda(k)}{k^s} = \sum_{m, k} \frac{\Lambda(k)}{(mk)^s} = \sum_n \frac{1}{n^s}\sum_{k \mid n} \Lambda(k) = \sum_n \frac{\log n}{n^s}.$$
The middle step groups the pairs $(m, k)$ by their product $n = mk$; for each divisor $k$ of $n$ there is exactly one such pair.`,
      concepts: ['series'],
    },
    {
      title: 'Differentiate ζ',
      claim: r`$\displaystyle \zeta'(s) = -\sum_{n \ge 1} \frac{\log n}{n^s}$, hence $\displaystyle -\frac{\zeta'(s)}{\zeta(s)} = \sum_{n \ge 1} \frac{\Lambda(n)}{n^s}$. $\qquad\blacksquare$`,
      why: r`$\frac{d}{ds} n^{-s} = -\log n \cdot n^{-s}$, and the differentiated series converges uniformly for $s \ge \sigma_0 \gt 1$, so term-by-term differentiation is valid. Divide the previous identity by $\zeta(s) \gt 0$.`,
      detail: r`$n^{-s} = e^{-s\log n}$, so $\frac{d}{ds} n^{-s} = -\log n \cdot n^{-s}$. On $s \ge \sigma_0 \gt 1$ the series $\sum \log n \cdot n^{-s}$ is dominated by the convergent $\sum \log n \cdot n^{-\sigma_0}$, so it converges uniformly and $\zeta$ can be differentiated term by term: $\zeta'(s) = -\sum \log n \cdot n^{-s}$.

Substituting into the previous step, $\zeta(s)\sum \Lambda(n) n^{-s} = -\zeta'(s)$. For real $s \gt 1$, $\zeta(s) \ge 1 \gt 0$, so we can divide.

**Another route**, straight from Euler's product: $\log\zeta(s) = -\sum_p \log(1 - p^{-s}) = \sum_p \sum_{k \ge 1} \frac{p^{-ks}}{k}$. Differentiating, $\frac{\zeta'}{\zeta}(s) = -\sum_p \sum_k \log p \cdot p^{-ks} = -\sum_n \Lambda(n) n^{-s}$: the $\frac1k$ cancels against the $k$ from differentiating $p^{-ks}$, leaving weight $\log p$ on every prime power.`,
      concepts: ['calculus', 'series'],
      check: {
        prompt: r`What is $\frac{d}{ds}\, 2^{-s}$?`,
        options: [r`$-\log 2 \cdot 2^{-s}$`, r`$-s\, 2^{-s-1}$`, r`$2^{-s}$`],
        answer: 0,
        explain: r`$2^{-s} = e^{-s\log 2}$, and the chain rule brings down $-\log 2$. ($-s\,2^{-s-1}$ treats $2$ as the variable instead of $s$.)`,
      },
    },
    {
      title: 'Why this is the right form',
      claim: r`Poles of $-\zeta'/\zeta$ sit exactly at the pole $s = 1$ and the zeros of $\zeta$, and each one leaves a term in $\psi(x)$: the pole gives $x$, a zero $\rho$ gives $-x^\rho/\rho$.`,
      why: r`Near a zero $\rho$ of order $m$, $\zeta(s) \approx c(s - \rho)^m$, so $-\zeta'/\zeta \approx -\frac{m}{s - \rho}$. Perron's formula recovers $\psi(x)$ from $\sum \Lambda(n) n^{-s}$ as a contour integral, and each pole contributes its residue times $x^{\text{pole}}/\text{pole}$.`,
      detail: r`This is a preview of the roadmap to the Riemann Hypothesis, stated without proof. For $x \gt 1$ not a prime power, von Mangoldt's explicit formula reads
$$\psi(x) = x - \sum_{\rho} \frac{x^\rho}{\rho} - \log 2\pi - \tfrac12 \log\big(1 - x^{-2}\big),$$
the sum running over the non-trivial zeros $\rho$ of $\zeta$ (taken symmetrically in their imaginary parts).

- The pole at $s = 1$ (residue $+1$ for $-\zeta'/\zeta$) gives the main term $x$.
- Each zero $\rho = \beta + i\gamma$ gives an oscillation of size $|x^\rho| = x^\beta$.

So the error $\psi(x) - x$ is governed by how far right the zeros reach. That is the Riemann Hypothesis.`,
      concepts: ['complex'],
      check: {
        prompt: r`If $\zeta$ had a zero with real part $0.8$, how big an oscillation would it add to $\psi(x)$?`,
        options: [r`About $x^{0.8}$`, r`About $x^{0.5}$`, r`About $\log x$`],
        answer: 0,
        explain: r`$|x^{\rho}| = x^{\operatorname{Re}\rho} = x^{0.8}$. The Riemann Hypothesis says no zero is to the right of $\frac12$, which caps these at about $\sqrt x$.`,
      },
    },
  ],
  takeaway: r`The logarithmic derivative turns Euler's product into a sum over prime powers, and turns zeros of $\zeta$ into poles, which is how zeros come to control primes.`,
};
