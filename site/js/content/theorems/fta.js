import { svg, path, text } from '../figures.js';

const r = String.raw;

// Two factor trees of 360. Nodes: [label, x, y, parentIndex]; primes are leaves.
const tree = (label, nodes) => svg('0 0 230 195', label,
  ...nodes.filter((n) => n[3] !== undefined).map(([, x, y, pi]) =>
    path(`M${nodes[pi][1]} ${nodes[pi][2] + 11}L${x} ${y - 11}`, 'f-axis')),
  ...nodes.map(([t, x, y], i) => text(x, y, t, nodes.some((n) => n[3] === i) ? '' : 'f-acc f-v')));
const tree1 = tree('Factor tree: 360 splits as 8 times 45; 8 as 2 times 4, 4 as 2 times 2; 45 as 5 times 9, 9 as 3 times 3', [
  ['360', 115, 20], ['8', 60, 70, 0], ['45', 170, 70, 0],
  ['2', 30, 120, 1], ['4', 90, 120, 1], ['2', 70, 170, 4], ['2', 110, 170, 4],
  ['5', 145, 120, 2], ['9', 200, 120, 2], ['3', 180, 170, 8], ['3', 220, 170, 8]]);
const tree2 = tree('Factor tree: 360 splits as 12 times 30; 12 as 3 times 4, 4 as 2 times 2; 30 as 5 times 6, 6 as 2 times 3', [
  ['360', 115, 20], ['12', 60, 70, 0], ['30', 170, 70, 0],
  ['3', 30, 120, 1], ['4', 90, 120, 1], ['2', 70, 170, 4], ['2', 110, 170, 4],
  ['5', 145, 120, 2], ['6', 200, 120, 2], ['2', 180, 170, 8], ['3', 220, 170, 8]]);

export default {
  id: 'fta',
  field: 'Number theory',
  title: 'Fundamental Theorem of Arithmetic',
  attribution: 'Euclid (key lemma); first complete proof Gauss, 1801',
  statement: r`Every integer $n \ge 2$ is a product of primes, and this factorisation is unique up to the order of the factors.`,
  figure: {
    svgs: [tree1, tree2],
    caption: r`Two different ways to break down $360$ end in the same primes: $2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 \cdot 5$. Existence says the splitting always ends; uniqueness says the leaves never depend on the choices.`,
  },
  prereqs: ['induction', 'primes', 'divisibility', 'gcd'],
  intro: r`Existence is easy. Uniqueness is the real content — it fails in other number systems (in $\mathbb{Z}[\sqrt{-5}]$, $6 = 2 \cdot 3 = (1+\sqrt{-5})(1-\sqrt{-5})$). The proof routes through Bézout's identity and Euclid's lemma.`,
  steps: [
    {
      title: 'Existence by strong induction',
      claim: r`Every $n \ge 2$ is a product of primes.`,
      why: r`If $n$ is prime, done. Otherwise $n = ab$ with $1 \lt a, b \lt n$; by strong induction $a$ and $b$ are products of primes, so $n$ is too.`,
      detail: r`Strong induction lets us assume the result for **every** number below $n$, not just $n - 1$.

- Base: $n = 2$ is prime.
- Step: take $n \ge 3$ and assume every $m$ with $2 \le m \lt n$ factors into primes. If $n$ is prime, it's a product of one prime. If not, $n = ab$ with both factors strictly between 1 and $n$. Each factors; concatenate the two lists.`,
      concepts: ['induction', 'primes'],
      check: {
        prompt: r`Why does ordinary induction ($n \to n+1$) not work well here?`,
        options: [
          r`Because knowing how $n$ factors says nothing about how $n + 1$ factors`,
          r`Because there are infinitely many primes`,
          r`Because $n + 1$ is always prime`,
        ],
        answer: 0,
        explain: r`$n$ and $n+1$ share no prime factors at all. The useful smaller numbers are the factors $a, b$ of $n$.`,
      },
    },
    {
      title: "Bézout's identity",
      claim: r`For integers $a, b$ not both 0, there are integers $x, y$ with $ax + by = \gcd(a, b)$.`,
      why: r`Let $d$ be the smallest positive value of $ax + by$. Division with remainder shows $d$ divides $a$ and $b$; and any common divisor of $a, b$ divides $d$. So $d = \gcd(a,b)$.`,
      detail: r`Let $S = \{ax + by \gt 0 : x, y \in \mathbb{Z}\}$. It's non-empty (try $x = a, y = b$), so by well-ordering it has a least element $d = ax_0 + by_0$.

**$d \mid a$:** divide, $a = qd + r$ with $0 \le r \lt d$. Then $r = a - q(ax_0 + by_0) = a(1 - qx_0) + b(-qy_0)$ has the form $ax + by$. If $r \gt 0$ it would be an element of $S$ smaller than $d$ — impossible. So $r = 0$. Same for $b$.

**$d$ is the greatest:** any $c$ dividing $a$ and $b$ divides $ax_0 + by_0 = d$, so $c \le d$.`,
      concepts: ['induction', 'divisibility', 'gcd'],
      check: {
        prompt: r`In showing $d \mid a$, why must the remainder $r$ be $0$?`,
        options: [
          r`Because $r$ has the form $ax + by$ and is smaller than $d$, the least positive such value`,
          r`Because $a$ is prime`,
          r`Because remainders are always 0`,
        ],
        answer: 0,
        explain: r`A positive $r$ would beat $d$ for "smallest positive $ax + by$". Minimality forces $r = 0$.`,
      },
    },
    {
      title: "Euclid's lemma",
      claim: r`If $p$ is prime and $p \mid ab$, then $p \mid a$ or $p \mid b$.`,
      why: r`If $p \nmid a$ then $\gcd(p, a) = 1$, so $px + ay = 1$. Multiply by $b$: $b = pbx + (ab)y$, and $p$ divides both terms.`,
      detail: r`Suppose $p \nmid a$. The only positive divisors of $p$ are 1 and $p$, and $p$ doesn't divide $a$, so $\gcd(p, a) = 1$. Bézout gives $px + ay = 1$.

Multiply through by $b$:
$$b = p(bx) + (ab)y.$$
$p$ divides $p(bx)$ obviously, and divides $(ab)y$ because $p \mid ab$. So $p$ divides the sum, $b$.

By induction this extends: if $p \mid a_1 a_2 \cdots a_k$ then $p$ divides some $a_i$. **This is where primality is essential:** $6 \mid 4 \cdot 9$ but $6 \nmid 4$ and $6 \nmid 9$.`,
      concepts: ['primes', 'gcd', 'divisibility'],
      check: {
        prompt: r`Where does the proof use that $p$ is prime?`,
        options: [
          r`To conclude $\gcd(p, a) = 1$ from $p \nmid a$`,
          r`To apply the division algorithm`,
          r`It doesn't — the lemma holds for any $p$`,
        ],
        answer: 0,
        explain: r`For composite $p$, $p \nmid a$ doesn't make them coprime ($6 \nmid 4$ but $\gcd(6,4) = 2$), and the lemma fails.`,
      },
    },
    {
      title: 'Uniqueness',
      claim: r`If $p_1 \cdots p_r = q_1 \cdots q_s$ (all primes), the two lists are the same up to order.`,
      why: r`$p_1$ divides $q_1 \cdots q_s$, so by Euclid's lemma $p_1 \mid q_j$ for some $j$, hence $p_1 = q_j$. Cancel it and repeat (induction on $r$).`,
      detail: r`Induct on $r$, the length of the shorter list (swap names if needed).

$p_1$ divides the left side, hence the right side $q_1 \cdots q_s$. By the extended Euclid's lemma, $p_1 \mid q_j$ for some $j$. But $q_j$ is prime — its only divisors are 1 and itself — and $p_1 \gt 1$, so $p_1 = q_j$.

Cancel this common factor from both sides. We get two shorter prime factorisations of the same number $n / p_1$; by the induction hypothesis they match up to order. Adding $p_1 = q_j$ back, so do the originals. (When $r = 1$: $p_1 = q_1 \cdots q_s$ is prime, forcing $s = 1$.)`,
      concepts: ['induction', 'primes'],
    },
  ],
  takeaway: r`Uniqueness is really Euclid's lemma, which is really Bézout. "Primes divide products only by dividing a factor" is the property that makes $\mathbb{Z}$ special.`,
};
