import { svg, path, rect, text } from '../figures.js';

const r = String.raw;

// Row 2n = 20 of Pascal's triangle: the middle entry is the largest, so it beats
// the average 4^10 / 21.
const row = Array.from({ length: 21 }, (_, k) => { let c = 1; for (let i = 1; i <= k; i++) c = (c * (21 - i)) / i; return c; });
const max = row[10], avg = 4 ** 10 / 21, B = 190, Hs = 165 / max;
const pascalRow = svg('0 0 300 225', 'Bar chart of the 21 binomial coefficients 20 choose k: a bell shape peaking at k = 10 with 184756, well above a dashed line at their average, 4 to the 10 over 21, about 49932',
  ...row.map((c, k) => rect(13 + 13 * k, B - Hs * c, 10, Hs * c, k === 10 ? 'f-bar2' : 'f-bar')),
  path(`M8 ${B - Hs * avg}H290`, 'f-alt'),
  path(`M8 ${B}H290`, 'f-axis'),
  text(18 + 13 * 10, B - Hs * max - 10, '184756', 'f-pt f-acc'),
  text(250, B - Hs * avg - 10, 'average', 'f-pt'),
  text(18, B + 14, '0', 'f-pt'), text(18 + 13 * 10, B + 14, '10', 'f-pt'), text(18 + 13 * 20, B + 14, '20', 'f-pt'));

export default {
  id: 'chebyshev',
  field: 'Number theory',
  title: r`Chebyshev's bound: $\pi(x) \gtrsim x / \log x$`,
  attribution: 'Pafnuty Chebyshev, 1852; this proof follows Erdős',
  statement: r`Let $\pi(x)$ be the number of primes $\le x$. For every $n \ge 1$,
$$\pi(2n) \;\ge\; \log 2 \cdot \frac{2n}{\log 2n} - 2.$$`,
  prereqs: ['binomial', 'logarithm', 'legendre'],
  requiresTheorems: ['fta', 'euler'],
  intro: r`Euclid: infinitely many primes. Euler: $\sum 1/p$ diverges. Chebyshev: $\pi(x)$ is at least a constant times $x/\log x$ — the true order of growth, as the Prime Number Theorem confirms. The proof studies one number: the central binomial coefficient $\binom{2n}{n}$.`,
  steps: [
    {
      title: 'The idea',
      claim: r`$\binom{2n}n$ is large, but it is built only from small prime powers. So there must be many primes.`,
      why: r`We'll show $\frac{4^n}{2n+1} \le \binom{2n}{n} \le (2n)^{\pi(2n)}$, then take logs.`,
      detail: r`Lower bound: comes from the binomial theorem. Upper bound: every prime factor of $\binom{2n}n$ is at most $2n$, and appears to a power that is at most $2n$. If there were few primes $\le 2n$, the product couldn't reach $4^n/(2n+1)$.

Example: $\binom{10}{5} = 252 = 2^2 \cdot 3^2 \cdot 7$. Each prime power $4, 9, 7$ is $\le 10$.`,
      concepts: ['binomial'],
    },
    {
      title: 'Lower bound',
      claim: r`$\displaystyle \binom{2n}{n} \ge \frac{4^n}{2n+1}$.`,
      figure: {
        svgs: [pascalRow],
        caption: r`Row $2n = 20$: the $21$ coefficients $\binom{20}{k}$ sum to $4^{10}$, so their average is $4^{10}/21 \approx 49932$ (dashed). The middle one, $\binom{20}{10} = 184756$, is the largest, hence above average.`,
      },
      why: r`$4^n = (1+1)^{2n} = \sum_{k=0}^{2n} \binom{2n}k$ has $2n+1$ terms, and the middle one is the largest.`,
      detail: r`By the binomial theorem with $a = b = 1$, the $2n+1$ coefficients in row $2n$ sum to $2^{2n} = 4^n$.

The middle is the largest: $\binom{2n}{k+1} / \binom{2n}{k} = \frac{2n-k}{k+1}$, which is $\ge 1$ exactly when $k \lt n$. So the row increases up to $k = n$ and decreases after.

The largest of $2n+1$ numbers is at least their average: $\binom{2n}n \ge \frac{4^n}{2n+1}$.`,
      concepts: ['binomial'],
      check: {
        prompt: r`Check $n = 5$: is $\binom{10}{5} = 252 \ge \frac{4^5}{11}$?`,
        options: [r`Yes: $4^5/11 \approx 93$`, r`No: $4^5/11 \approx 372$`, r`They're equal`],
        answer: 0,
        explain: r`$4^5 = 1024$ and $1024 / 11 \approx 93.1 \le 252$. The bound is loose but grows at the right exponential rate.`,
      },
    },
    {
      title: 'Only primes up to 2n appear',
      claim: r`Every prime factor of $\binom{2n}n = \frac{(2n)!}{n!\,n!}$ is at most $2n$.`,
      why: r`A prime $p \gt 2n$ does not divide any of $1, 2, \dots, 2n$, so by Euclid's lemma it does not divide $(2n)!$.`,
      detail: r`$\binom{2n}{n} \cdot n!\,n! = (2n)!$. If a prime $p$ divided $\binom{2n}n$, it would divide $(2n)!$, hence (Euclid's lemma) one of the factors $1, \dots, 2n$, forcing $p \le 2n$.`,
      concepts: ['primes'],
    },
    {
      title: 'Each prime power is at most 2n',
      claim: r`If $p^{v}$ is the exact power of $p$ dividing $\binom{2n}n$, then $p^{v} \le 2n$.`,
      why: r`By Legendre, $v = \sum_{j \ge 1} \big(\lfloor 2n/p^j \rfloor - 2\lfloor n/p^j \rfloor\big)$. Each term is 0 or 1, and terms with $p^j \gt 2n$ are 0. So $v \le$ the number of $j$ with $p^j \le 2n$.`,
      detail: r`Legendre's formula applied to $(2n)!$ and twice to $n!$:
$$v = v_p((2n)!) - 2v_p(n!) = \sum_{j\ge1} \Big(\Big\lfloor \frac{2n}{p^j}\Big\rfloor - 2\Big\lfloor\frac{n}{p^j}\Big\rfloor\Big).$$

**Each term is 0 or 1:** for any real $y$, write $y = \lfloor y \rfloor + f$ with $0 \le f \lt 1$. Then $2y = 2\lfloor y \rfloor + 2f$, so $\lfloor 2y \rfloor - 2\lfloor y \rfloor = \lfloor 2f \rfloor \in \{0, 1\}$.

**Terms vanish when $p^j \gt 2n$:** both floors are then 0.

So if $J$ is the largest $j$ with $p^j \le 2n$, then $v \le J$ and $p^v \le p^J \le 2n$.`,
      concepts: ['legendre'],
      check: {
        prompt: r`What is $\lfloor 2y \rfloor - 2\lfloor y \rfloor$ for $y = 3.7$?`,
        options: [r`$0$`, r`$1$`, r`$2$`],
        answer: 1,
        explain: r`$\lfloor 7.4 \rfloor - 2 \cdot 3 = 7 - 6 = 1$. It's 1 exactly when the fractional part of $y$ is at least $\frac12$.`,
      },
    },
    {
      title: 'Upper bound',
      claim: r`$\displaystyle \binom{2n}n \le (2n)^{\pi(2n)}$.`,
      why: r`By unique factorisation, $\binom{2n}{n} = \prod_{p \le 2n} p^{v_p}$: at most $\pi(2n)$ factors, each $\le 2n$.`,
      detail: r`The Fundamental Theorem of Arithmetic writes $\binom{2n}n$ as a product of prime powers. Only primes $\le 2n$ occur (step 3), there are $\pi(2n)$ of those, and each prime power is $\le 2n$ (step 4). Primes that don't divide it contribute $p^0 = 1 \le 2n$, which is harmless.`,
      concepts: ['primes'],
    },
    {
      title: 'Take logarithms',
      claim: r`$\displaystyle \pi(2n) \ge \frac{n\log 4 - \log(2n+1)}{\log 2n} \ge \log 2 \cdot \frac{2n}{\log 2n} - 2$.`,
      why: r`Combine the bounds and take logs: $n \log 4 - \log(2n+1) \le \pi(2n) \log(2n)$. Then $n\log 4 = \log 2 \cdot 2n$, and $\frac{\log(2n+1)}{\log 2n} \le \frac{\log 3}{\log 2} \lt 2$.`,
      detail: r`From $\frac{4^n}{2n+1} \le \binom{2n}n \le (2n)^{\pi(2n)}$, and since $\log$ is increasing:
$$n\log 4 - \log(2n+1) \le \pi(2n)\,\log(2n).$$
Divide by $\log 2n \gt 0$ (valid for $n \ge 1$) and use $n \log 4 = 2n \log 2$.

For the error term: $\frac{\log(2n+1)}{\log 2n}$ is largest at $n=1$, where it equals $\frac{\log 3}{\log 2} \approx 1.58$. $\blacksquare$

Sanity check, $n = 50$: the bound gives $\pi(100) \ge 0.693 \cdot 100 / 4.605 - 2 \approx 13$. The truth is $25$.`,
      concepts: ['logarithm'],
      check: {
        prompt: r`Roughly how does the bound grow?`,
        options: [
          r`Like $\log x$`,
          r`Like a constant times $x / \log x$`,
          r`Like $x$`,
        ],
        answer: 1,
        explain: r`$\pi(x) \ge (\log 2)\,x/\log x - 2$ for even $x$. Chebyshev also showed an upper bound of the same shape: $\pi(x) \le C\,x/\log x$.`,
      },
    },
    {
      title: 'Toward the Prime Number Theorem',
      claim: r`In fact $\pi(x) \sim \dfrac{x}{\log x}$: the ratio tends to 1.`,
      why: r`Proved in 1896 by Hadamard and de la Vallée Poussin, using Riemann's $\zeta(s)$ — specifically that $\zeta(s) \ne 0$ on the line $\operatorname{Re} s = 1$.`,
      detail: r`Chebyshev pinned $\pi(x)\log x / x$ between about $0.92$ and $1.11$ for large $x$, but elementary methods couldn't close the gap. Riemann's 1859 memoir showed the error in $\pi(x) \approx \int_2^x \frac{dt}{\log t}$ is controlled by the zeros of $\zeta$. The **Riemann Hypothesis** — every non-trivial zero has real part $\frac12$ — is equivalent to the error being about $\sqrt x \log x$, as small as it could possibly be.

This course's arc: Euclid (infinitely many) → Euler (the product, $\sum 1/p = \infty$) → Chebyshev (the right order of growth) → Riemann (the exact asymptotics, and the open problem).`,
      concepts: ['logarithm', 'primes'],
    },
  ],
  takeaway: r`Find a number that is provably large yet provably made only of small primes; comparing the two bounds counts the primes.`,
};
