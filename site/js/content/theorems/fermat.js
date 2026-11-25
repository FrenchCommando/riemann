import { svg, text, dot } from '../figures.js';

const r = String.raw;

// Pascal's triangle, rows 0..7. An interior entry of row n is highlighted when n
// divides it: every interior entry in the prime rows, but not in rows 4 and 6.
const binom = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - i + 1)) / i; return c; };
const pascal = svg('0 0 340 250', "Pascal's triangle, rows 0 to 7. In rows 2, 3, 5 and 7 every interior entry is highlighted as divisible by the row number; in row 4 the 6, and in row 6 the 15s and 20, are not",
  ...Array.from({ length: 8 }, (_, n) => [
    text(16, 22 + 30 * n, String(n), 'f-pt'),
    ...Array.from({ length: n + 1 }, (_, k) => {
      const x = 180 + (k - n / 2) * 40, y = 22 + 30 * n, c = binom(n, k);
      const interior = k > 0 && k < n;
      return (interior && c % n === 0 ? dot(x, y, 'f-hl', 14) : '') + text(x, y, String(c), interior && c % n !== 0 ? 'f-sm f-muted' : 'f-sm');
    }),
  ].join('')));

export default {
  id: 'fermat',
  field: 'Number theory',
  title: "Fermat's Little Theorem",
  attribution: 'Stated by Fermat, 1640; proved by Euler, 1736',
  statement: r`If $p$ is prime, then $a^p \equiv a \pmod p$ for every integer $a$. If moreover $p \nmid a$, then $a^{p-1} \equiv 1 \pmod p$.`,
  prereqs: ['modular', 'binomial', 'induction', 'primes'],
  requiresTheorems: ['fta'],
  intro: r`The engine behind RSA and most primality tests. This proof is Euler's: binomial coefficients plus induction on $a$.`,
  steps: [
    {
      title: 'Key lemma: p divides the middle coefficients',
      claim: r`For $0 \lt k \lt p$, $\ p \mid \binom pk$.`,
      figure: {
        svgs: [pascal],
        caption: r`Highlighted: interior entries of row $n$ divisible by $n$. The prime rows $2, 3, 5, 7$ are fully highlighted; rows $4$ and $6$ are not ($4 \nmid 6$, $6 \nmid 15$, $6 \nmid 20$).`,
      },
      why: r`$\binom pk \cdot k!\,(p-k)! = p!$. The prime $p$ divides the right side, but divides none of the factors of $k!\,(p-k)!$ (all are less than $p$). By Euclid's lemma, $p \mid \binom pk$.`,
      detail: r`Write $p! = \binom pk \cdot k! \cdot (p-k)!$.

$p$ divides the left side. On the right, $k!$ and $(p-k)!$ are products of numbers $1, 2, \dots$, all **less than** $p$ when $0 \lt k \lt p$. A prime can't divide a number between 1 and $p-1$, so by Euclid's lemma $p$ doesn't divide $k!\,(p-k)!$.

So by Euclid's lemma once more, $p$ must divide the remaining factor $\binom pk$.

Example: row $p = 5$ is $1, 5, 10, 10, 5, 1$ — every middle entry is a multiple of 5. Compare $n = 4$: $1, 4, 6, 4, 1$ — and $4 \nmid 6$.`,
      concepts: ['binomial', 'primes'],
      check: {
        prompt: r`Why does the lemma fail for $n = 4$ (e.g. $4 \nmid \binom42 = 6$)?`,
        options: [
          r`Because 4 is not prime, so Euclid's lemma doesn't apply`,
          r`Because $\binom42$ is not an integer`,
          r`It doesn't fail`,
        ],
        answer: 0,
        explain: r`$4 \mid 4! = 6 \cdot 2! \cdot 2!$, but the 4 is "used up" by $2! \cdot 2! = 4$. For a prime, the factor can't hide in the denominator.`,
      },
    },
    {
      title: "The 'freshman's dream'",
      claim: r`$(a + 1)^p \equiv a^p + 1 \pmod p$.`,
      why: r`Expand with the binomial theorem; every middle term $\binom pk a^k$ is divisible by $p$.`,
      detail: r`$$(a+1)^p = a^p + \binom p{p-1} a^{p-1} + \cdots + \binom p1 a + 1.$$
Every term except the first and last has a coefficient $\binom pk$ with $0 \lt k \lt p$, which is $\equiv 0 \pmod p$ by the lemma. What survives modulo $p$ is $a^p + 1$.`,
      concepts: ['binomial', 'modular'],
    },
    {
      title: 'Induction on a ≥ 0',
      claim: r`$a^p \equiv a \pmod p$ for all $a \ge 0$.`,
      why: r`Base: $0^p = 0$. Step: if $a^p \equiv a$, then $(a+1)^p \equiv a^p + 1 \equiv a + 1$.`,
      detail: r`Let $P(a)$ be the statement $a^p \equiv a \pmod p$.

- $P(0)$: $0^p = 0$. ✓
- $P(a) \Rightarrow P(a+1)$: by the previous step, $(a+1)^p \equiv a^p + 1$, and by $P(a)$ this is $\equiv a + 1$. ✓

Intuition: raising to the $p$-th power commutes with "adding 1" mod $p$, and every non-negative $a$ is $0 + 1 + 1 + \cdots + 1$.`,
      concepts: ['induction', 'modular'],
      check: {
        prompt: r`Check the theorem numerically: what is $2^7 \bmod 7$?`,
        options: [r`$1$`, r`$2$`, r`$4$`],
        answer: 1,
        explain: r`$2^7 = 128 = 18 \cdot 7 + 2$. So $2^7 \equiv 2$, as predicted.`,
      },
    },
    {
      title: 'Negative a',
      claim: r`The congruence holds for all integers $a$.`,
      why: r`Any $a$ is congruent to some $b \in \{0, \dots, p-1\}$, and powers respect congruence: $a^p \equiv b^p \equiv b \equiv a$.`,
      detail: r`Pick $b \ge 0$ with $a \equiv b \pmod p$ (e.g. the remainder of $a$ on division by $p$). Congruences multiply, so $a^p \equiv b^p$. By the previous step $b^p \equiv b$, and $b \equiv a$.`,
      concepts: ['modular'],
    },
    {
      title: 'Divide by a',
      claim: r`If $p \nmid a$, then $a^{p-1} \equiv 1 \pmod p$.`,
      why: r`$a \cdot a^{p-1} \equiv a \cdot 1$, and we may cancel $a$ because $\gcd(a, p) = 1$.`,
      detail: r`We know $p \mid a^p - a = a(a^{p-1} - 1)$. By Euclid's lemma, $p \mid a$ or $p \mid a^{p-1} - 1$. The first is excluded, so $a^{p-1} \equiv 1$.

This is the form used in practice: e.g. the **Fermat primality test** picks $a$ and checks whether $a^{n-1} \equiv 1 \pmod n$. If not, $n$ is certainly composite.`,
      concepts: ['modular', 'primes'],
      check: {
        prompt: r`What is $3^{100} \bmod 101$? ($101$ is prime.)`,
        options: [r`$0$`, r`$1$`, r`$3$`],
        answer: 1,
        explain: r`$p = 101$, $p - 1 = 100$, and $101 \nmid 3$. So $3^{100} \equiv 1$.`,
      },
    },
  ],
  takeaway: r`Mod a prime, $x \mapsto x^p$ respects addition; induction from 0 then forces it to be the identity.`,
};
