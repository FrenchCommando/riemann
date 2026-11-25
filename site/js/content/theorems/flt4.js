import { svg, path, text, dot } from '../figures.js';

const r = String.raw;

// Infinite descent: each solution produces a strictly smaller one, hopping left
// along the positive integers forever, which is impossible.
const hops = [300, 190, 120, 76, 48];
const descent = svg('0 0 340 120', 'A number line of positive integers: a solution with value z produces a smaller one, which produces a smaller one, forever, hopping toward 0',
  path('M20 80H330', 'f-axis'),
  path('M20 72V88', 'f-mark'),
  text(20, 102, '0', 'f-pt'),
  ...hops.map((x) => dot(x, 80, 'f-dot2', 4)),
  ...hops.slice(0, -1).map((x, i) => path(`M${x} 72Q${(x + hops[i + 1]) / 2} ${30 - 4 * i} ${hops[i + 1]} 72`, 'f-arc')),
  text(300, 102, 'z', 'f-sm'), text(190, 102, 'c', 'f-sm'), text(120, 102, 'c′', 'f-sm'), text(76, 102, 'c″', 'f-sm'),
  text(34, 60, '…', 'f-acc'));

export default {
  id: 'flt4',
  field: 'Number theory',
  title: r`Fermat for $n = 4$: no solutions to $x^4 + y^4 = z^4$`,
  attribution: 'Pierre de Fermat, c. 1640: infinite descent, his only surviving proof',
  statement: r`There are no positive integers with $x^4 + y^4 = z^2$. In particular $x^4 + y^4 = z^4$ has none, and Fermat's Last Theorem reduces to odd prime exponents.`,
  figure: {
    svgs: [descent],
    caption: r`Infinite descent: every solution would produce a strictly smaller one. Positive integers can't decrease forever, so there is no first solution.`,
  },
  prereqs: ['induction', 'contradiction', 'parity', 'gcd'],
  requiresTheorems: ['triples'],
  intro: r`Fermat wrote in a margin that $x^n + y^n = z^n$ has no solutions for $n \ge 3$ and that the margin was too small for his proof. For $n = 4$ he did leave a proof, and it is a gem: assume a smallest solution and build a smaller one. It also cuts the full problem down to odd primes, which is where Wiles picked it up 350 years later.`,
  steps: [
    {
      title: 'Prove something stronger',
      claim: r`Suppose $x^4 + y^4 = z^2$ has a positive solution, and take one with $z$ as small as possible.`,
      why: r`A solution of $x^4 + y^4 = z^4$ gives one of $x^4 + y^4 = (z^2)^2$, so ruling out squares on the right is stronger. Well-ordering lets us pick a minimal $z$; we'll build a solution with smaller $z$.`,
      detail: r`Proving more can be easier: the weaker hypothesis "the right side is a square" is exactly what survives the descent, while "the right side is a fourth power" would not.

The set of values $z$ over all positive solutions is a non-empty set of positive integers (if any solution exists), so it has a least element: this is **well-ordering**, the principle behind "minimal counterexample" arguments.`,
      concepts: ['induction', 'contradiction'],
    },
    {
      title: 'Turn it into a Pythagorean triple',
      claim: r`In a minimal solution $\gcd(x, y) = 1$, so $(x^2, y^2, z)$ is a primitive triple. With $y$ even: $x^2 = m^2 - n^2$, $y^2 = 2mn$, $z = m^2 + n^2$.`,
      why: r`If a prime $p$ divided $x$ and $y$, then $p^4 \mid z^2$, so $p^2 \mid z$, and $(x/p, y/p, z/p^2)$ would be a smaller solution. Then $(x^2)^2 + (y^2)^2 = z^2$ is a primitive triple; apply the classification.`,
      detail: r`Minimality forces $\gcd(x, y) = 1$, as above. Then $\gcd(x^2, y^2) = 1$ too, so $(x^2, y^2, z)$ is a **primitive** Pythagorean triple. Exactly one of $x^2, y^2$ is even; name the variables so it's $y$. The previous proof gives coprime $m \gt n \gt 0$ of opposite parity with
$$x^2 = m^2 - n^2, \qquad y^2 = 2mn, \qquad z = m^2 + n^2.$$`,
      concepts: ['gcd'],
    },
    {
      title: 'A second triple',
      claim: r`$x^2 + n^2 = m^2$ is again a primitive triple, with $n$ even: $\ x = r^2 - s^2$, $n = 2rs$, $m = r^2 + s^2$ for coprime $r \gt s \gt 0$.`,
      why: r`Rearrange $x^2 = m^2 - n^2$. It's primitive since $\gcd(m, n) = 1$. $x$ is odd, so the even leg must be $n$.`,
      detail: r`From step 2, $x^2 + n^2 = m^2$ with $\gcd(m, n) = 1$, so it's a primitive triple (pairwise coprime). $x$ is odd (because $x^2$ is the odd leg of the first triple), and a primitive triple has exactly one even leg, so $n$ is even and $m$ is odd. Classify once more:
$$x = r^2 - s^2, \qquad n = 2rs, \qquad m = r^2 + s^2,$$
with $\gcd(r, s) = 1$.`,
      concepts: ['parity', 'gcd'],
      check: {
        prompt: r`Why must $n$, and not $x$, be the even leg of $x^2 + n^2 = m^2$?`,
        options: [
          r`$x$ is odd, and a primitive triple has exactly one even leg`,
          r`Because $n \lt m$`,
          r`It's a convention; either works`,
        ],
        answer: 0,
        explain: r`In the first triple, $y^2$ is the even leg, so $x^2$ (hence $x$) is odd. The classification needs the even leg in the "$2mn$" slot, so it must be $n$.`,
      },
    },
    {
      title: 'Three coprime factors of a square',
      claim: r`$\big(\tfrac y2\big)^2 = rsm$ with $r, s, m$ pairwise coprime, so $r = a^2$, $s = b^2$, $m = c^2$.`,
      why: r`$y^2 = 2mn = 4rsm$. $\gcd(r, s) = 1$, and $\gcd(r, m) = \gcd(r, r^2 + s^2) = \gcd(r, s^2) = 1$, likewise for $s$. Coprime factors of a square are squares.`,
      detail: r`Substituting $n = 2rs$ into $y^2 = 2mn$ gives $y^2 = 4rsm$, so $\big(\frac y2\big)^2 = r \cdot s \cdot m$ ($y$ is even).

Pairwise coprime: $\gcd(r, s) = 1$ from the classification. A prime dividing $r$ and $m = r^2 + s^2$ divides $s^2$, hence $s$, which is impossible; same for $s$ and $m$.

The lemma from the previous proof (coprime factors of a square are squares) works for any number of pairwise coprime factors, by the same prime-by-prime argument. So $r = a^2$, $s = b^2$, $m = c^2$ for positive integers $a, b, c$.`,
      concepts: ['gcd', 'primes'],
    },
    {
      title: 'A smaller solution',
      claim: r`$a^4 + b^4 = c^2$ with $c \lt z$, contradicting minimality. $\qquad\blacksquare$`,
      why: r`$c^2 = m = r^2 + s^2 = a^4 + b^4$. And $c \le c^2 = m \lt m^2 + n^2 = z$ because $n \gt 0$.`,
      detail: r`Substitute into $m = r^2 + s^2$:
$$c^2 = (a^2)^2 + (b^2)^2 = a^4 + b^4.$$
So $(a, b, c)$ is a positive solution of the same equation. Its size: $c \le c^2 = m \le m^2 \lt m^2 + n^2 = z$. That contradicts the choice of $z$ as the smallest, so no solution exists.

Unwound, this is **infinite descent**: any solution yields a smaller one, which yields a smaller one, and positive integers can't decrease forever.`,
      concepts: ['induction', 'contradiction'],
      check: {
        prompt: r`Where does the proof use $n \gt 0$?`,
        options: [
          r`To get $c \lt z$ strictly, via $m^2 \lt m^2 + n^2$`,
          r`To make $n$ even`,
          r`Nowhere; it's just part of the classification`,
        ],
        answer: 0,
        explain: r`Without strict decrease there is no descent. $c \le m \le m^2$, and $m^2 \lt m^2 + n^2 = z$ needs $n \ne 0$.`,
      },
    },
    {
      title: 'Only odd primes are left',
      claim: r`If $x^p + y^p = z^p$ has no positive solutions for every odd prime $p$, then Fermat's Last Theorem holds for all $n \ge 3$.`,
      why: r`Every $n \ge 3$ is divisible by $4$ or by an odd prime. If $n = dk$, a solution for $n$ gives the solution $(x^k)^d + (y^k)^d = (z^k)^d$ for exponent $d$.`,
      detail: r`If $n \ge 3$ has no odd prime factor, it is a power of 2 that is at least 4, so $4 \mid n$. Otherwise some odd prime $p \mid n$.

Write $n = dk$ with $d = 4$ or $d = p$. A solution $x^n + y^n = z^n$ gives $(x^k)^d + (y^k)^d = (z^k)^d$, a solution for exponent $d$. Exponent 4 is impossible by this proof. So the whole theorem comes down to odd primes $p$: Euler handled $p = 3$, Dirichlet and Legendre $p = 5$, Lamé $p = 7$, Kummer all "regular" primes, and Wiles all of them.`,
      concepts: ['divisibility', 'primes'],
      check: {
        prompt: r`What does this proof give for $n = 12$?`,
        options: [
          r`Fermat for $n = 12$, since $4 \mid 12$`,
          r`Nothing; $12$ needs its own proof`,
          r`Only the case $n = 3$`,
        ],
        answer: 0,
        explain: r`A solution for $n = 12$ gives one for $n = 4$: $(x^3)^4 + (y^3)^4 = (z^3)^4$. (It would also give one for $n = 3$, but that case needs a different proof.)`,
      },
    },
  ],
  takeaway: r`Infinite descent: from any solution build a strictly smaller one. Combined with "minimal counterexample", it proves non-existence.`,
};
