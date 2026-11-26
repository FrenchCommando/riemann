import { svg, poly, text, dot } from '../figures.js';

const r = String.raw;

// Residues 1..12 mod 13 on a clock (k at the k o'clock position). The powers of 2
// visit all twelve (a 12-pointed star); the powers of 3 only 1, 3, 9 (a triangle).
const pt = (k, rad) => {
  const a = (Math.PI / 6) * k - Math.PI / 2;
  return [150 + rad * Math.cos(a), 150 + rad * Math.sin(a)];
};
const fmt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
const powers = (g) => { const out = []; let x = 1; do { out.push(x); x = (x * g) % 13; } while (x !== 1); return out; };
const star = svg('0 0 300 300', 'The twelve nonzero residues mod 13 on a clock face. Following the powers of 2, 1, 2, 4, 8, 3, 6, 12, 11, 9, 5, 10, 7, visits every residue once and draws a twelve-pointed star. The powers of 3 only visit 1, 3 and 9, a triangle',
  poly(powers(2).map((k) => fmt(pt(k, 105))).join(' '), 'f-c0'),
  poly(powers(3).map((k) => fmt(pt(k, 105))).join(' '), 'f-c2'),
  ...Array.from({ length: 12 }, (_, i) => dot(...pt(i + 1, 105), [1, 3, 9].includes(i + 1) ? 'f-d2' : 'f-d0', 6)),
  ...Array.from({ length: 12 }, (_, i) => text(...pt(i + 1, 128), String(i + 1), 'f-sm')));

export default {
  id: 'cyclicunits',
  field: 'Algebra',
  title: 'Every finite field has a primitive element',
  attribution: 'Gauss, Disquisitiones Arithmeticae, 1801 (for Z/p); Galois, 1830',
  statement: r`In a field with $q$ elements, some element $\alpha$ has order $q - 1$: the nonzero elements are exactly $1, \alpha, \alpha^2, \dots, \alpha^{q-2}$.`,
  figure: {
    svgs: [star],
    caption: r`In $\mathbb F_{13}$ the powers of $2$ are $1, 2, 4, 8, 3, 6, 12, 11, 9, 5, 10, 7$ and then $1$ again: every nonzero residue appears, so $2$ is primitive. The powers of $3$ cycle through $1, 3, 9$ only, because $3$ has order $3$.`,
  },
  prereqs: ['polynomials', 'groups'],
  requiresTheorems: ['lagrange', 'finitefields'],
  intro: r`Multiplying bytes by "multiply, then reduce mod $f$" is slow. QR encoders instead write every nonzero byte as a power of one fixed byte and add exponents, the way slide rules add logarithms. This proof shows such an element always exists, by counting.`,
  steps: [
    {
      title: 'Orders divide q − 1',
      claim: r`The nonzero elements form a group of size $q - 1$ under multiplication, so the order of every nonzero element divides $q - 1$.`,
      why: r`Products of nonzero elements are nonzero (no zero divisors), and every nonzero element has an inverse. By Lagrange, the order of $a$, the size of the subgroup $\{1, a, a^2, \dots\}$, divides the size of the group.`,
      detail: r`So $a^{q-1} = 1$ for every $a \ne 0$, which is Fermat's Little Theorem when the field is $\mathbb F_p$. The question is whether some element has order exactly $q - 1$, rather than a proper divisor of it.`,
      concepts: ['groups', 'fields'],
    },
    {
      title: 'Few elements of each order',
      claim: r`For each $d$ dividing $q - 1$, at most $\varphi(d)$ elements have order exactly $d$.`,
      why: r`If some $a$ has order $d$, then $1, a, \dots, a^{d-1}$ are $d$ different roots of $x^d - 1$. That polynomial has at most $d$ roots, so these are all of them, and every element of order $d$ is some $a^k$. Among those, $a^k$ has order $d$ exactly when $\gcd(k, d) = 1$: $\varphi(d)$ choices.`,
      detail: r`The order of $a^k$ is $d / \gcd(k, d)$: $(a^k)^m = 1$ exactly when $d \mid km$, i.e. when $\frac{d}{\gcd(k,d)} \mid m$.

Example in $\mathbb F_{13}$, $d = 3$: the roots of $x^3 - 1$ are $1, 3, 9$, and the two with order exactly $3$ are $3$ and $9$, matching $\varphi(3) = 2$. If no element has order $d$, the count is $0$, which is also $\le \varphi(d)$.`,
      concepts: ['polynomials', 'groups'],
      check: {
        prompt: r`How many elements of $\mathbb F_{13}$ have order exactly $4$?`,
        options: [r`$1$`, r`$2$`, r`$4$`],
        answer: 1,
        explain: r`$\varphi(4) = 2$, and indeed $5$ and $8$ do: $5^2 = 25 \equiv 12 = -1$, so $5^4 = 1$ but $5^2 \ne 1$. ($8 = 5^3$.)`,
      },
    },
    {
      title: "Gauss's count",
      claim: r`For every $n$, $\sum_{d \mid n} \varphi(d) = n$.`,
      why: r`Write the fractions $\frac1n, \frac2n, \dots, \frac nn$ in lowest terms. Each denominator divides $n$, and exactly $\varphi(d)$ of them end up with denominator $d$: the numerators coprime to $d$.`,
      detail: r`For $n = 12$: the denominators $1, 2, 3, 4, 6, 12$ occur $1, 1, 2, 2, 2, 4$ times ($\frac{12}{12}$; $\frac{6}{12}$; $\frac{4}{12}, \frac{8}{12}$; $\frac{3}{12}, \frac{9}{12}$; $\frac{2}{12}, \frac{10}{12}$; and $\frac{1}{12}, \frac{5}{12}, \frac{7}{12}, \frac{11}{12}$), and $1 + 1 + 2 + 2 + 2 + 4 = 12$.`,
      concepts: ['gcd'],
      check: {
        prompt: r`What is $\varphi(1) + \varphi(2) + \varphi(3) + \varphi(6)$?`,
        options: [r`$6$`, r`$5$`, r`$8$`],
        answer: 0,
        explain: r`$1 + 1 + 2 + 2 = 6$, as the count predicts for $n = 6$.`,
      },
    },
    {
      title: 'Squeeze',
      claim: r`Every bound in step 2 is an equality. In particular $\varphi(q - 1) \ge 1$ elements have order $q - 1$. $\blacksquare$`,
      why: r`Let $N(d)$ be the number of elements of order $d$. Every nonzero element has some order dividing $q - 1$, so $\sum_d N(d) = q - 1 = \sum_d \varphi(d)$. With $N(d) \le \varphi(d)$ term by term, no term can fall short.`,
      detail: r`Spelled out: $\sum_d (\varphi(d) - N(d)) = 0$ with every term $\ge 0$, so every term is $0$. Taking $d = q - 1$: there are $\varphi(q - 1)$ primitive elements, and $\varphi$ of anything is at least $1$.

The proof shows they exist without saying which. For $\mathbb Z/p$ there is no known formula for a primitive root; in practice one tests $2, 3, 5, \dots$ until one works.`,
      concepts: ['groups'],
    },
    {
      title: 'Logarithm tables in QR encoders',
      claim: r`In $\mathbb F_{256}$ built from $x^8 + x^4 + x^3 + x^2 + 1$, the byte $\alpha = x$ (that is, $\mathtt{0x02}$) is primitive. So $ab = \alpha^{(\log a + \log b) \bmod 255}$.`,
      why: r`The order of $\alpha$ divides $255 = 3 \cdot 5 \cdot 17$. It is $255$ unless $\alpha^{255/3}$, $\alpha^{255/5}$ or $\alpha^{255/17}$ equals $1$, and computing $\alpha^{85}$, $\alpha^{51}$ and $\alpha^{15}$ shows none does.`,
      detail: r`The test works because any proper divisor of $255$ divides $85$, $51$ or $15$. A polynomial whose root $x$ is primitive is called a **primitive polynomial**; the QR standard chose one, so the encoder can start from $1$ and keep multiplying by $2$ (shift left, XOR with $\mathtt{0x11D}$ on overflow) to list all $255$ powers.

It stores two tables: $\exp[i] = \alpha^i$ and its inverse $\log$. Then multiplication is two lookups, an addition mod $255$, and a lookup. The QR code on the Reed–Solomon page of this site is computed exactly this way.`,
      concepts: ['groups', 'logarithm'],
      check: {
        prompt: r`If $\log a = 200$ and $\log b = 100$, what is $\log(ab)$?`,
        options: [r`$45$`, r`$300$`, r`$100$`],
        answer: 0,
        explain: r`$200 + 100 = 300$, and exponents live mod $255$ because $\alpha^{255} = 1$: $300 - 255 = 45$.`,
      },
    },
  ],
  takeaway: r`Counting alone forces a generator: each order $d$ has room for at most $\varphi(d)$ elements, and those maxima add up to exactly $q - 1$.`,
};
