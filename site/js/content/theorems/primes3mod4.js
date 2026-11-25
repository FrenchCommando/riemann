import { svg, path, text, grid, line } from '../figures.js';

const r = String.raw;

// Multiplying odd residues mod 4.
const S = 56;
const table = svg('0 0 240 190', 'Multiplication table mod 4 for the odd classes 1 and 3: 1 times 1 is 1, 1 times 3 is 3, 3 times 1 is 3, 3 times 3 is 1',
  text(60, 40, '×', 'f-sm'),
  text(88 + S / 2, 40, '1', 'f-sm f-v'), text(88 + 3 * S / 2, 40, '3', 'f-sm f-v'),
  text(60, 60 + S / 2, '1', 'f-sm f-v'), text(60, 60 + 3 * S / 2, '3', 'f-sm f-v'),
  grid([['1', '3'], ['3', '1']], 88, 60, S, (i, j) => (i === 0 && j === 0 ? 'f-sq2' : i === 1 && j === 1 ? 'f-sq' : ''), () => 'f-big'));

// Chebyshev's bias: #{p ≤ x, p ≡ 3 mod 4} − #{p ≤ x, p ≡ 1 mod 4} for x ≤ 3000.
const N = 3000;
const sieve = new Uint8Array(N + 1);
const race = [[0, 0]];
let diff = 0, top = 0;
for (let n = 2; n <= N; n++) {
  if (sieve[n]) continue;
  for (let m = n * n; m <= N; m += n) sieve[m] = 1;
  if (n % 2) { race.push([n, diff]); diff += n % 4 === 3 ? 1 : -1; race.push([n, diff]); top = Math.max(top, diff); }
}
race.push([N, diff]);
const W = 280 / N, H = 140 / top;
const bias = svg('-30 -165 340 200', "Graph of the number of primes up to x that are 3 mod 4 minus the number that are 1 mod 4, for x up to 3000: it stays at or above zero throughout, Chebyshev's bias",
  path('M0 0H285M0 15V-150', 'f-axis'),
  line(race.map(([x, y]) => [W * x, -H * y]), 'f-curve'),
  ...[1000, 2000, 3000].map((x) => text(W * x, 14, String(x), 'f-pt')),
  text(-14, 0, '0', 'f-pt'), text(-16, -H * top, String(top), 'f-pt'),
  text(140, -150, '#(3 mod 4) − #(1 mod 4)', 'f-pt f-acc'));

export default {
  id: 'primes3mod4',
  field: 'Number theory',
  title: r`Infinitely many primes $\equiv 3 \pmod 4$`,
  attribution: "A variation on Euclid; general case Dirichlet, 1837",
  statement: r`There are infinitely many primes of the form $4k + 3$.`,
  prereqs: ['contradiction', 'primes', 'modular'],
  requiresTheorems: ['euclid'],
  intro: r`Euclid's trick, adapted to an arithmetic progression. Seeing why it works for $4k+3$ but not $4k+1$ is the lesson.`,
  steps: [
    {
      title: 'Odd primes come in two kinds',
      claim: r`Every odd prime is $\equiv 1$ or $\equiv 3 \pmod 4$.`,
      why: r`An odd number leaves remainder 1 or 3 on division by 4 (0 and 2 are even).`,
      detail: r`Examples: $5, 13, 17, 29 \equiv 1$; $3, 7, 11, 19, 23 \equiv 3 \pmod 4$.`,
      concepts: ['modular'],
    },
    {
      title: 'Ones are closed under multiplication',
      claim: r`A product of numbers $\equiv 1 \pmod 4$ is $\equiv 1 \pmod 4$.`,
      figure: {
        svgs: [table],
        caption: r`Odd classes mod 4 under multiplication. Ones only make ones (top left), so a number $\equiv 3$ needs a factor $\equiv 3$. But two threes also make a one (bottom right), which is why the trick fails for $4k + 1$.`,
      },
      why: r`Congruences multiply: $1 \cdot 1 \cdot \ldots \cdot 1 \equiv 1$.`,
      detail: r`So a number $\equiv 3 \pmod 4$ **cannot** have all its prime factors $\equiv 1$. If it is odd, at least one of its prime factors is $\equiv 3$.

The reverse is false: $3 \cdot 7 = 21 \equiv 1$. A number $\equiv 1$ can be built entirely from 3s — which is why this proof doesn't adapt to $4k+1$.`,
      concepts: ['modular'],
      check: {
        prompt: r`$N$ is odd and $N \equiv 3 \pmod 4$. What must be true?`,
        options: [
          r`$N$ is prime`,
          r`$N$ has at least one prime factor $\equiv 3 \pmod 4$`,
          r`All prime factors of $N$ are $\equiv 3 \pmod 4$`,
        ],
        answer: 1,
        explain: r`If every prime factor were $\equiv 1$, so would $N$ be. E.g. $15 = 3 \cdot 5$ has one of each.`,
      },
    },
    {
      title: 'Assume finitely many; build N',
      claim: r`Suppose $p_1, \dots, p_n$ are all the primes $\equiv 3 \pmod 4$, and let $N = 4p_1 p_2 \cdots p_n - 1$.`,
      why: r`$N \equiv -1 \equiv 3 \pmod 4$, and $N$ is odd. The "$-1$" (not "$+1$") is chosen to land in the $3$ class.`,
      detail: r`The list is non-empty since $3$ is on it. $4p_1\cdots p_n \equiv 0$, so $N \equiv -1 \equiv 3 \pmod 4$. Example with the list $\{3, 7\}$: $N = 4 \cdot 21 - 1 = 83$, a prime $\equiv 3$ not on the list.

Why not Euclid's $p_1 \cdots p_n + 1$? With an even number of 3-type primes the product is $\equiv 1$, so $+1$ gives $\equiv 2$ — useless.`,
      concepts: ['contradiction', 'modular'],
    },
    {
      title: 'Find a new prime',
      claim: r`Some prime $q \equiv 3 \pmod 4$ divides $N$, and $q$ is not any $p_i$.`,
      why: r`Previous step gives $q$. If $q = p_i$, then $q$ divides $4p_1\cdots p_n - N = 1$. Impossible.`,
      detail: r`$N$ is odd and $\equiv 3$, so by step 2 it has a prime factor $q \equiv 3 \pmod 4$.

If $q = p_i$: $q \mid 4p_1 \cdots p_n$ and $q \mid N$, so $q$ divides their difference, which is $1$. No prime divides 1. So $q$ is a prime $\equiv 3 \pmod 4$ missing from the list — contradiction. $\blacksquare$`,
      concepts: ['primes', 'divisibility'],
      check: {
        prompt: r`Why did we need $N$ odd?`,
        options: [
          r`So that 2 isn't one of its prime factors, and every prime factor is $\equiv 1$ or $3$`,
          r`Because primes are odd`,
          r`We didn't`,
        ],
        answer: 0,
        explain: r`The "closed under multiplication" argument is about odd primes. An even $N$ could have the factor $2$, which is in neither class.`,
      },
    },
    {
      title: "Beyond: Dirichlet's theorem",
      claim: r`Every progression $a, a + m, a + 2m, \dots$ with $\gcd(a, m) = 1$ contains infinitely many primes.`,
      figure: {
        svgs: [bias],
        caption: r`Both classes get their fair share in the long run (Dirichlet), but the race is lopsided: primes $\equiv 3 \pmod 4$ are never behind until $x = 26861$, the first prime at which the $1 \bmod 4$ side takes the lead (Chebyshev's bias). Littlewood proved the lead changes hands infinitely often.`,
      },
      why: r`Elementary tricks like this one only handle a few progressions. Dirichlet's proof uses analysis: $L$-functions, cousins of the zeta function.`,
      detail: r`$4k + 1$ can be done with a different trick ($-1$ is a square mod $p$ iff $p \equiv 1 \pmod 4$, applied to $N = (2p_1\cdots p_n)^2 + 1$). But no elementary trick handles all progressions.

Dirichlet (1837) defined $L(s, \chi) = \sum \chi(n) n^{-s}$, an Euler-product generalisation of $\zeta(s)$ that filters by residue class, and showed $\sum_{p \equiv a \ (m)} 1/p$ diverges — exactly the strategy of Euler's proof in this course, refined.`,
      concepts: ['primes'],
    },
  ],
  takeaway: r`Pick the constant so $N$ lands in the target class, then use that the other class is closed under multiplication.`,
};
