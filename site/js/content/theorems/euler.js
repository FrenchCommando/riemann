const r = String.raw;

export default {
  id: 'euler',
  title: r`$\sum 1/p$ diverges — Euler's product`,
  attribution: 'Leonhard Euler, 1737',
  statement: r`$$\sum_{p \text{ prime}} \frac1p = \frac12 + \frac13 + \frac15 + \frac17 + \frac1{11} + \cdots = \infty.$$`,
  prereqs: ['series', 'harmonic', 'logarithm', 'primes'],
  requiresTheorems: ['fta', 'euclid'],
  intro: r`Euclid shows the primes never stop; Euler shows they are *dense* — denser than the squares, since $\sum 1/n^2$ converges. The tool is the Euler product, which links primes to $\zeta(s) = \sum n^{-s}$ and is the doorway to Riemann's 1859 paper.`,
  steps: [
    {
      title: 'A finite Euler product',
      claim: r`For $N \ge 2$ let $\displaystyle P_N = \prod_{p \le N} \frac{1}{1 - 1/p}$.`,
      why: r`A finite product over the primes up to $N$. We'll show it is at least the harmonic sum $\sum_{n\le N} 1/n$.`,
      detail: r`For $N = 5$: $P_5 = \frac{1}{1 - 1/2} \cdot \frac{1}{1-1/3} \cdot \frac{1}{1-1/5} = 2 \cdot \frac32 \cdot \frac54 = 3.75$, while $1 + \frac12 + \frac13 + \frac14 + \frac15 \approx 2.28$.

We use a **finite** product to keep every manipulation rigorous — no infinite products needed.`,
      concepts: ['primes'],
    },
    {
      title: 'Each factor is a geometric series',
      claim: r`$\displaystyle \frac{1}{1 - 1/p} = 1 + \frac1p + \frac1{p^2} + \frac1{p^3} + \cdots$`,
      why: r`Geometric series with ratio $x = 1/p \lt 1$.`,
      detail: r`$\sum_{k \ge 0} x^k = \frac1{1-x}$ for $|x| \lt 1$, and $1/p \le 1/2$. So each factor is a sum over all powers of $p$: $\sum_{k\ge0} \frac1{p^k}$.`,
      concepts: ['series'],
    },
    {
      title: 'Multiply out',
      claim: r`$\displaystyle P_N \ge \sum_{n \le N} \frac1n$.`,
      why: r`Multiplying the finitely many series together gives a sum of terms $\frac{1}{p_1^{k_1} \cdots p_m^{k_m}}$ — one for each product of primes $\le N$. Every $n \le N$ is such a product (its prime factors are all $\le n \le N$), so every $\frac1n$ appears.`,
      detail: r`A product of finitely many convergent series of positive terms can be expanded term by term. Picking one term $p^{-k_p}$ from each factor gives
$$P_N = \sum_{(k_p)} \prod_{p \le N} p^{-k_p},$$
summing over all choices of exponents.

Take any $n \le N$. By the Fundamental Theorem of Arithmetic, $n = \prod p^{k_p}$ with every prime factor $p \le n \le N$, so $\frac1n$ is one of the terms. All terms are positive, so throwing away the rest can only decrease the sum.

(Uniqueness of factorisation says each $n$ appears **exactly once**, giving the stronger identity $P_N = \sum_{n \text{ with all prime factors} \le N} \frac1n$. Existence alone is enough for $\ge$.)`,
      concepts: ['series', 'primes'],
      check: {
        prompt: r`Which property of factorisation is needed for the inequality $P_N \ge \sum_{n\le N} 1/n$?`,
        options: [
          r`Existence only: every $n \le N$ is a product of primes $\le N$`,
          r`Uniqueness only`,
          r`Neither — it's just algebra`,
        ],
        answer: 0,
        explain: r`We only need each $\frac1n$ to show up at least once among positive terms. Uniqueness upgrades the inequality to an exact identity.`,
      },
    },
    {
      title: 'So the product blows up',
      claim: r`$P_N \to \infty$ as $N \to \infty$.`,
      why: r`$P_N \ge \sum_{n \le N} 1/n$, and the harmonic series diverges.`,
      detail: r`This alone re-proves Euclid: if there were finitely many primes, $P_N$ would stop changing once $N$ passed the largest one — a fixed finite number — yet it must exceed every harmonic partial sum.`,
      concepts: ['harmonic'],
      check: {
        prompt: r`Why does $P_N \to \infty$ already imply there are infinitely many primes?`,
        options: [
          r`With finitely many primes, $P_N$ would be eventually constant, hence bounded`,
          r`Because $\infty$ is not prime`,
          r`It doesn't; we need the next steps`,
        ],
        answer: 0,
        explain: r`A product over a fixed finite set of primes is a fixed finite number.`,
      },
    },
    {
      title: 'Take logarithms',
      claim: r`$\displaystyle \log P_N = \sum_{p \le N} -\log\!\left(1 - \frac1p\right) \to \infty$.`,
      why: r`$\log$ turns the product into a sum, and $\log$ of something tending to $\infty$ tends to $\infty$.`,
      detail: r`$\log \prod \frac{1}{1 - 1/p} = \sum \log \frac{1}{1-1/p} = \sum -\log(1 - 1/p)$. Now we need to compare $-\log(1 - 1/p)$ with $1/p$.`,
      concepts: ['logarithm'],
    },
    {
      title: 'Compare each log term with 1/p',
      claim: r`For $0 \lt x \le \frac12$: $\ -\log(1 - x) \le x + x^2$.`,
      why: r`$-\log(1-x) = x + \frac{x^2}2 + \frac{x^3}3 + \cdots \le x + \frac{x^2}{2}(1 + x + x^2 + \cdots) = x + \frac{x^2}{2(1-x)} \le x + x^2$.`,
      detail: r`Start from the series $-\log(1-x) = \sum_{k \ge 1} \frac{x^k}{k}$.

For $k \ge 2$, $\frac1k \le \frac12$, so the tail $\sum_{k\ge2} \frac{x^k}{k} \le \frac12 \sum_{k \ge 2} x^k = \frac12 \cdot \frac{x^2}{1-x}$.

With $x \le \frac12$ we have $\frac{1}{1-x} \le 2$, so the tail is $\le x^2$. Apply with $x = 1/p$ (fine since $p \ge 2$).`,
      concepts: ['logarithm', 'series'],
    },
    {
      title: 'Conclude',
      claim: r`$\displaystyle \sum_{p \le N} \frac1p \;\ge\; \log P_N - 2 \;\to\; \infty$.`,
      why: r`Summing the bound: $\log P_N \le \sum_{p\le N} \frac1p + \sum_{p \le N} \frac1{p^2}$, and $\sum \frac1{p^2} \le \sum \frac1{n^2} \lt 2$.`,
      detail: r`$$\log P_N = \sum_{p \le N} -\log\Big(1 - \frac1p\Big) \le \sum_{p\le N}\frac1p + \sum_{p \le N}\frac{1}{p^2}.$$
The second sum is a sub-sum of $\sum_n \frac1{n^2} \lt 2$. Rearranging, $\sum_{p\le N} \frac1p \ge \log P_N - 2$, and the right side $\to \infty$. ∎

In fact $\log P_N \ge \log \sum_{n \le N} \frac 1n \ge \log\log N$, so $\sum_{p \le N} \frac1p \ge \log\log N - 2$. The true growth is $\log \log N + 0.2615\ldots$ (Mertens).`,
      concepts: ['harmonic', 'logarithm'],
      check: {
        prompt: r`Why does the $\sum 1/p^2$ term not spoil the argument?`,
        options: [
          r`It's bounded (by 2), while $\log P_N \to \infty$`,
          r`It's negative`,
          r`It also diverges, which helps`,
        ],
        answer: 0,
        explain: r`A bounded error can't stop something going to infinity: $\sum 1/p \ge (\text{something} \to \infty) - 2$.`,
      },
    },
    {
      title: 'Where Riemann enters',
      claim: r`For $s \gt 1$: $\displaystyle \zeta(s) = \sum_{n \ge 1} \frac{1}{n^s} = \prod_p \frac{1}{1 - p^{-s}}$.`,
      why: r`The same expansion with $p^{-s}$ in place of $p^{-1}$, now convergent, plus uniqueness of factorisation, gives Euler's product formula.`,
      detail: r`At $s = 1$ the product diverges — which is exactly what we just exploited. For $s \gt 1$ both sides converge and are equal; uniqueness of factorisation is what makes it an identity rather than an inequality.

Riemann (1859) extended $\zeta(s)$ to complex $s$ and showed the distribution of primes is controlled by its zeros. The Riemann Hypothesis — all non-trivial zeros have real part $\tfrac12$ — is equivalent to the sharpest form of the Prime Number Theorem's error term.`,
      concepts: ['series', 'primes'],
    },
  ],
  takeaway: r`Encode primes in a product, unique factorisation turns it into a sum over all integers, and analysis (log, series bounds) pulls information back about the primes.`,
};
