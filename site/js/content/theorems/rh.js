import { svg, path, text, dot } from '../figures.js';

const r = String.raw;

// The complex plane: critical strip 0 <= Re s <= 1, critical line Re s = 1/2,
// trivial zeros at -2, -4, -6, pole at 1, first five non-trivial zeros (and conjugates).
const X = 30, Y = 5; // units per 1 on the real / imaginary axis
const gammas = [14.1347, 21.0220, 25.0109, 30.4249, 32.9351];
const strip = svg('-215 -195 335 390', 'The complex plane with the critical strip between real part 0 and 1, the critical line at real part one half carrying the first non-trivial zeros, trivial zeros at -2, -4, -6, and the pole at 1',
  `<rect x="0" y="-190" width="${X}" height="380" class="f-strip"/>`,
  path('M-210 0H115M0 -190V190', 'f-axis'),
  path(`M${X / 2} -190V190`, 'f-alt'),
  ...gammas.flatMap((g) => [dot(X / 2, -Y * g, 'f-dot2', 3.5), dot(X / 2, Y * g, 'f-dot2', 3.5)]),
  ...[-2, -4, -6].map((x) => dot(X * x, 0, 'f-dot', 3.5)),
  path(`M${X - 5} -5L${X + 5} 5M${X - 5} 5L${X + 5} -5`, 'f-vec'),
  ...[-2, -4, -6].map((x) => text(X * x, 16, String(x).replace('-', '−'), 'f-pt')),
  text(-8, 12, '0', 'f-pt'), text(X + 10, 16, '1', 'f-pt'),
  text(X + 6, -Y * gammas[0], '½ + 14.13i', 'f-pt f-start'),
  text(X + 6, -Y * gammas[1], '½ + 21.02i', 'f-pt f-start'),
  text(X + 6, -180, 'Re s = ½', 'f-sm f-acc f-start'),
  text(-120, 40, 'trivial zeros', 'f-pt'), text(75, 30, 'pole', 'f-pt'));

export default {
  id: 'rh',
  kind: 'roadmap',
  field: 'Frontiers',
  title: 'The Riemann Hypothesis',
  attribution: 'Bernhard Riemann, 1859; a Millennium Prize problem since 2000',
  statement: r`Every non-trivial zero of the Riemann zeta function has real part $\frac12$. Equivalently, $\ \psi(x) = x + O\big(\sqrt{x}\,\log^2 x\big)$.`,
  figure: {
    svgs: [strip],
    caption: r`The complex $s$-plane. The non-trivial zeros lie in the shaded strip $0 \lt \operatorname{Re} s \lt 1$; the first ones, at heights $14.13, 21.02, 25.01, \dots$, sit on the line $\operatorname{Re} s = \frac12$. RH says they all do.`,
  },
  prereqs: ['complex', 'series', 'logarithm', 'primes'],
  requiresTheorems: ['chebyshev', 'vonmangoldt'],
  tagline: r`How regular are the primes? From Euclid to the zeros of $\zeta$.`,
  status: 'Machine-checked proof announced Nov 2026',
  intro: r`This is the destination the number-theory track has been heading for: Euclid, Euler's product, Chebyshev's bounds and von Mangoldt's formula. The analytic steps below are cited rather than proved here (they need complex analysis). The last step reports the proof announced in November 2026, what has been checked and what has not.`,
  steps: [
    {
      title: 'ζ on the complex plane',
      claim: r`$\zeta(s)$ extends from $\operatorname{Re} s \gt 1$ to all complex $s \ne 1$, with a simple pole at $s = 1$. It satisfies a functional equation relating $s$ and $1 - s$, has "trivial" zeros at $-2, -4, -6, \dots$, and all other zeros lie in the strip $0 \lt \operatorname{Re} s \lt 1$.`,
      cited: r`Riemann, 1859`,
      why: r`For $\operatorname{Re} s \gt 1$ Euler's product converges and none of its factors vanish, so $\zeta(s) \ne 0$ there. The functional equation $\xi(s) = \xi(1 - s)$, with $\xi(s) = \frac12 s(s-1)\pi^{-s/2}\Gamma(\tfrac s2)\zeta(s)$, mirrors that zero-free region to $\operatorname{Re} s \lt 0$, except for the trivial zeros forced by the poles of $\Gamma$.`,
      detail: r`So the non-trivial zeros live in the **critical strip** $0 \le \operatorname{Re} s \le 1$, and they come in symmetric sets: if $\rho$ is a zero, so are $\bar\rho$ (since $\zeta(\bar s) = \overline{\zeta(s)}$) and $1 - \rho$ (functional equation). The line $\operatorname{Re} s = \frac12$ is the axis of that symmetry.

How many zeros: the number with $0 \lt \operatorname{Im}\rho \le T$ is about $\frac{T}{2\pi}\log\frac{T}{2\pi e}$ (Riemann–von Mangoldt).`,
      concepts: ['complex'],
      check: {
        prompt: r`If $\rho = 0.7 + 50i$ were a zero, which of these would also have to be one?`,
        options: [r`$0.3 + 50i$`, r`$0.7 + 25i$`, r`$-0.7 + 50i$`],
        answer: 0,
        explain: r`The functional equation sends $\rho$ to $1 - \rho = 0.3 - 50i$, and conjugation then gives $0.3 + 50i$. A zero off the line comes with a mirror partner, which is why RH is about the line $\operatorname{Re} s = \frac12$.`,
      },
    },
    {
      title: 'Zeros control the primes',
      claim: r`$\displaystyle \psi(x) = x - \sum_{\rho} \frac{x^\rho}{\rho} - \log 2\pi - \tfrac12\log(1 - x^{-2})$, summing over non-trivial zeros $\rho$.`,
      cited: r`von Mangoldt, 1895 (the explicit formula)`,
      why: r`Apply Perron's formula to $-\zeta'/\zeta = \sum \Lambda(n) n^{-s}$ (the previous proof) and shift the contour left: each pole of $-\zeta'/\zeta$ leaves its residue. The pole of $\zeta$ at $1$ gives $x$; each zero $\rho$ gives $-x^\rho/\rho$.`,
      detail: r`Each zero $\rho = \beta + i\gamma$ contributes a wave $x^\rho/\rho = x^{\beta} e^{i\gamma\log x}/\rho$: amplitude $x^\beta/|\rho|$, oscillating in $\log x$ with frequency $\gamma$. Paired with its conjugate it becomes a real cosine wave. The primes are the sum of the smooth term $x$ and this "music of the zeros". With enough zeros, the formula reproduces the jumps of the staircase $\psi(x)$ at every prime power.`,
      concepts: ['complex'],
    },
    {
      title: 'The Prime Number Theorem',
      claim: r`$\zeta(s) \ne 0$ on the line $\operatorname{Re} s = 1$, and hence $\psi(x) \sim x$, equivalently $\pi(x) \sim \dfrac{x}{\log x}$.`,
      cited: r`Hadamard; de la Vallée Poussin, 1896`,
      why: r`If no zero has real part $1$, every term $x^\rho/\rho$ is $o(x)$, and a uniform version of this makes the sum $o(x)$. The non-vanishing on $\operatorname{Re} s = 1$ comes from the inequality $3 + 4\cos\theta + \cos 2\theta = 2(1 + \cos\theta)^2 \ge 0$ applied to $\log\zeta$.`,
      detail: r`The trick (Mertens' version): for $\sigma \gt 1$, $\ |\zeta(\sigma)^3\,\zeta(\sigma + it)^4\,\zeta(\sigma + 2it)| \ge 1$, because its log is $\sum_n \frac{\Lambda(n)}{n^\sigma\log n}\,(3 + 4\cos(t\log n) + \cos(2t\log n)) \ge 0$. If $\zeta(1 + it) = 0$, then as $\sigma \to 1^+$ the left side behaves like $(\sigma - 1)^{-3}(\sigma - 1)^{4}\cdot\text{bounded} \to 0$: contradiction.

This settles Chebyshev's question. It says nothing yet about the **size of the error**: that depends on how far right the zeros reach inside the strip.`,
      concepts: ['complex', 'logarithm'],
    },
    {
      title: 'The hypothesis, and what it means',
      claim: r`RH $\iff$ $\psi(x) = x + O(\sqrt x\,\log^2 x)$ $\iff$ $\pi(x) = \operatorname{Li}(x) + O(\sqrt x\,\log x)$, where $\operatorname{Li}(x) = \int_2^x \frac{dt}{\log t}$.`,
      cited: r`von Koch, 1901`,
      why: r`If every $\rho$ has $\operatorname{Re}\rho = \frac12$, each wave has size $\sqrt x/|\rho|$, and summing them (using the zero count) gives $\sqrt x\log^2 x$. Conversely, an error of size $x^{\theta}$ makes $-\zeta'/\zeta(s) - \frac{1}{s-1}$ analytic for $\operatorname{Re} s \gt \theta$, so there are no zeros there.`,
      detail: r`Both directions are standard. The "conversely" direction is partial summation: $\sum \Lambda(n) n^{-s} = s\int_1^\infty \psi(x)x^{-s-1}dx$, and splitting $\psi(x) = x + E(x)$ gives $\frac{s}{s-1}$ plus $s\int E(x)x^{-s-1}dx$, which converges for $\operatorname{Re} s \gt \theta$ if $E(x) = O(x^{\theta})$.

So RH is exactly the statement that primes are as regularly distributed as they could possibly be: the error can't be smaller than about $\sqrt x$, since the zeros on the line already produce waves of that size.`,
      concepts: ['complex'],
      check: {
        prompt: r`Suppose a zero had real part $0.9$. What could you still say about $\psi(x) - x$?`,
        options: [
          r`Only that it is $O(x^{0.9 + \varepsilon})$ or so, far weaker than $\sqrt x$`,
          r`Still $O(\sqrt x\log^2 x)$`,
          r`That $\psi(x) \sim x$ fails`,
        ],
        answer: 0,
        explain: r`That zero's wave alone has size about $x^{0.9}$. The Prime Number Theorem would survive (it only needs no zeros on $\operatorname{Re} s = 1$), but the error term would be much worse.`,
      },
    },
    {
      title: 'The evidence before 2026',
      claim: r`Infinitely many zeros lie on the line (Hardy, 1914), a positive proportion do (Selberg, 1942), more than 40% do (Conrey, 1989), and the first $10^{13}$ zeros all do (Gourdon, 2004).`,
      cited: r`Hardy 1914; Selberg 1942; Conrey 1989; Gourdon 2004`,
      why: r`Each result is a theorem about the zeros on the line; none excluded a zero off it. The strongest structural evidence came from function fields: for curves over finite fields the analogue of RH is a theorem.`,
      detail: r`**The function field analogue.** For a curve $C$ over $\mathbb{F}_q$ there is a zeta function counting its points over $\mathbb{F}_{q^n}$, and the analogue of RH says $|\#C(\mathbb{F}_{q}) - (q + 1)| \le 2g\sqrt q$, with $g$ the genus. For elliptic curves ($g = 1$) that is Hasse's bound from the Fermat roadmap. Weil proved it for all curves in the 1940s, and Deligne (1974) for all smooth projective varieties. Stepanov (1969) found an elementary proof for curves using an auxiliary polynomial that vanishes to high order at the points being counted, later simplified by Bombieri.

Why it didn't transfer: over $\mathbb{F}_q$ there is a Frobenius map whose eigenvalues *are* the zeros, and geometry to control them. Over $\mathbb{Z}$ no such structure was known.`,
      concepts: ['curves', 'complex'],
    },
    {
      title: 'Status, November 2026',
      claim: r`On 20 November 2026 Levent Alpöge announced a computer-checked proof of RH, and of GRH for Dirichlet $L$-functions, written in Lean together with Claude. As of 24 November it has been machine-verified, but no human-readable proof has been published.`,
      cited: r`Alpöge, announcement of 20 Nov 2026; Lean FRO and Mathlib Initiative, joint statement of 21 Nov 2026`,
      why: r`The Lean FRO and the Mathlib Initiative certified on 21 November that the code compiles, passes independent proof checkers, and proves Mathlib's own pre-existing statement of RH (so the statement was not quietly redefined). What is missing is understanding: the formal proof is reported at about 17 million lines, and mathematicians have said they don't yet know why it works.`,
      detail: r`What is reported, from the sources listed below:
- **What a Lean check establishes.** If the kernel and the checkers are sound, the conclusion follows from Mathlib's axioms, and the conclusion is the standard statement of RH. It does not tell anyone what the key ideas are, and it is not journal peer review.
- **The reported strategy.** Two stages: a weaker, intermittent estimate for a smoothed prime-counting error is shown to imply RH by classical methods (Landau, Turán, de la Vallée Poussin), and that estimate is proved by an argument described as a descendant of Stepanov's method for curves over finite fields, transported to the integers using the theta correspondence and Arakelov theory. Terence Tao's preliminary reading was that it appears to draw on the full power of the Langlands program and arithmetic geometry.
- **Not yet available.** A natural-language proof. A short sketch has been posted and criticised for its clarity.
- **The Clay Institute** lists the problem as "solution claimed". Its rules require publication, a two-year wait and general acceptance before any prize.

A note on sources: this site's walkthroughs were also written with Claude, the model involved in the proof. Everything in this step is taken from the reporting listed below, not from Claude's own knowledge, and the situation is changing day by day.`,
      concepts: [],
      check: {
        prompt: r`What does the Lean certification establish?`,
        options: [
          r`That the formal proof checks, and that its conclusion is Mathlib's standard statement of RH`,
          r`That mathematicians have read and understood the argument`,
          r`That the Clay Millennium Prize has been awarded`,
        ],
        answer: 0,
        explain: r`Machine verification is about correctness relative to the formal statement and axioms. Understanding, peer review and the prize are separate, and none of them had happened as of late November 2026.`,
      },
    },
    {
      title: 'What it unlocks',
      claim: r`Hundreds of results were proved "assuming RH" or "assuming GRH". If the proof stands, they become unconditional.`,
      cited: r`von Koch 1901; Miller 1976; Bach 1990`,
      why: r`Examples: $\pi(x) = \operatorname{Li}(x) + O(\sqrt x\log x)$; under GRH, every composite $n$ has a Miller–Rabin witness below $2\log^2 n$ (Bach), so testing just those bases is a deterministic polynomial-time primality test (Miller).`,
      detail: r`Some consequences for primes:
- **Gaps:** under RH, there is a prime between $x$ and $x + C\sqrt x\log x$ (Cramér). Unconditionally the best known is far weaker.
- **Primes in progressions:** GRH for Dirichlet $L$-functions gives the analogue of the RH error term for primes $\equiv a \pmod q$, and a bound on the least such prime.
- **Algorithms:** deterministic primality testing via Miller's test (AKS, 2002, already does this unconditionally, but more slowly).

None of this depends on how RH is proved, only on its truth, which is why a machine-checked proof matters even before anyone understands it.`,
      concepts: ['primes'],
    },
  ],
  takeaway: r`The primes are the sum of a smooth trend and waves, one per zero of $\zeta$; RH says no wave grows faster than $\sqrt x$. In November 2026 a machine-checked proof appeared, and the work of understanding it began.`,
  sources: [
    { label: "Alpöge's proof of the Riemann hypothesis (Wikipedia)", url: 'https://en.wikipedia.org/wiki/Alp%C3%B6ge%27s_proof_of_the_Riemann_hypothesis' },
    { label: "Al Jazeera, 21 Nov 2026: Has the world's most famous maths problem been cracked?", url: 'https://www.aljazeera.com/news/2026/11/21/riemann-hypothesis-has-the-worlds-most-famous-maths-problem-been-cracked' },
    { label: 'Riemann hypothesis (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Riemann_hypothesis' },
    { label: 'Millennium Prize Problems (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Millennium_Prize_Problems' },
  ],
};
