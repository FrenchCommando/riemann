import { svg, poly, text, dot } from '../figures.js';

const r = String.raw;

// Exponents 0..14 of α in F_16 on a circle; Frobenius doubles them mod 15.
// The orbits of 1, 3, 5 (needed by the QR format code) are drawn and coloured.
const pt = (k, rad) => {
  const a = (2 * Math.PI / 15) * k - Math.PI / 2;
  return [150 + rad * Math.cos(a), 150 + rad * Math.sin(a)];
};
const fmt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
const orbit = (e) => { const o = []; let k = e; do { o.push(k); k = (2 * k) % 15; } while (k !== e); return o; };
const colour = {};
[1, 3, 5].forEach((e, c) => orbit(e).forEach((k) => (colour[k] = c)));
const orbits = svg('0 0 300 300', 'The exponents 0 to 14 on a circle. Doubling mod 15 moves each exponent around its orbit. The orbit of 1 is 1, 2, 4, 8; the orbit of 3 is 3, 6, 12, 9; the orbit of 5 is 5, 10. Together they hold ten exponents, including all of 1 to 6',
  ...[1, 3, 5].map((e, c) => poly(orbit(e).map((k) => fmt(pt(k, 105))).join(' '), `f-c${c}`)),
  ...Array.from({ length: 15 }, (_, k) => dot(...pt(k, 105), `f-d${colour[k] ?? 3}`, colour[k] === undefined ? 4 : 7)),
  ...Array.from({ length: 15 }, (_, k) => text(...pt(k, 128), String(k), k >= 1 && k <= 6 ? 'f-sm f-v' : 'f-sm f-muted')));

export default {
  id: 'frobenius',
  field: 'Algebra',
  title: 'Frobenius: the symmetries of a finite field',
  attribution: 'Galois, 1830; named after Georg Frobenius (1896)',
  statement: r`In a field with $p^n$ elements, the map $\varphi(a) = a^p$ preserves $+$ and $\times$, fixes exactly the elements of $\mathbb F_p$, and has order $n$: $\varphi^n$ is the identity and no smaller power is. If a polynomial with coefficients in $\mathbb F_p$ has a root $\beta$, then $\beta^p, \beta^{p^2}, \dots$ are roots too.`,
  prereqs: ['binomial', 'polynomials', 'groups'],
  requiresTheorems: ['fermat', 'cyclicunits'],
  intro: r`Galois theory is about the symmetries of a field: the bijections that preserve $+$ and $\times$. Finite fields have the simplest kind. Every symmetry is a power of one map, raising to the $p$-th power, so the symmetry group is cyclic. That is the base case of the general theory, and it is also how the 15-bit format strip printed beside the corner squares of every QR code was designed.`,
  steps: [
    {
      title: "The freshman's dream",
      claim: r`In a field of characteristic $p$, $(a + b)^p = a^p + b^p$ and $(ab)^p = a^p b^p$.`,
      why: r`Expand with the binomial theorem: the middle coefficients $\binom pk$, $0 \lt k \lt p$, are divisible by $p$, and $p \cdot c = 0$ for every element $c$. The product rule holds in any commutative setting.`,
      detail: r`The divisibility of $\binom pk$ by $p$ is the key lemma of Fermat's Little Theorem: $p$ divides the numerator $p!$ but not the denominator $k!(p-k)!$.

So $\varphi$ preserves sums and products, and also $0$ and $1$. Over $\mathbb F_2$ it is squaring: $(a + b)^2 = a^2 + b^2$ because $2ab = 0$.`,
      concepts: ['binomial', 'fields'],
    },
    {
      title: 'A symmetry',
      claim: r`$\varphi$ is a bijection from the field to itself, so it is a symmetry (an automorphism) of the field.`,
      why: r`If $a^p = b^p$ then $(a - b)^p = 0$ by step 1, so $a = b$ (no zero divisors). A one-to-one map from a finite set to itself is onto.`,
      detail: r`On an infinite field of characteristic $p$, $\varphi$ can fail to be onto (on the field of rational functions $\mathbb F_p(t)$, nothing maps to $t$). Finiteness is what makes it a symmetry for free.`,
      concepts: ['functions', 'fields'],
    },
    {
      title: 'What it fixes',
      claim: r`$\varphi(a) = a$ exactly for the $p$ elements $0, 1, \dots, p - 1$ of $\mathbb F_p$.`,
      why: r`Those satisfy $a^p = a$ by Fermat's Little Theorem. And the fixed elements are roots of $x^p - x$, which has at most $p$ roots, so there are no others.`,
      detail: r`The copy of $\mathbb F_p$ inside the field is $\{0, 1, 1 + 1, \dots\}$, the multiples of $1$. Every symmetry fixes it, since it fixes $1$ and preserves sums; Frobenius fixes nothing more.`,
      concepts: ['polynomials', 'modular'],
      check: {
        prompt: r`In $\mathbb F_{256}$ ($p = 2$), which bytes satisfy $a^2 = a$?`,
        options: [r`Only $0$ and $1$`, r`All $256$`, r`The $16$ bytes of a subfield`],
        answer: 0,
        explain: r`They are the roots of $x^2 - x = x(x - 1)$: just $0$ and $1$, the copy of $\mathbb F_2$. (The subfield with 16 elements is fixed by $\varphi^4$, not by $\varphi$.)`,
      },
    },
    {
      title: 'Exactly n different symmetries',
      claim: r`$\varphi^n$ is the identity, but $\varphi^k$ is not for $0 \lt k \lt n$. So $\mathrm{id}, \varphi, \dots, \varphi^{n-1}$ are $n$ different symmetries.`,
      why: r`$\varphi^k(a) = a^{p^k}$. Every $a$ satisfies $a^{p^n} = a$ (for $a \ne 0$, $a^{p^n - 1} = 1$ by Lagrange). If $\varphi^k$ were the identity with $k \lt n$, all $p^n$ elements would be roots of $x^{p^k} - x$, a polynomial of degree $p^k \lt p^n$.`,
      detail: r`These are in fact all the symmetries: the Galois group of $\mathbb F_{p^n}$ over $\mathbb F_p$ is cyclic of order $n$, generated by $\varphi$. (Sketch: a symmetry is determined by where it sends a primitive element $\alpha$, and it must send $\alpha$ to a root of $\alpha$'s minimal polynomial, which has degree $n$ and therefore at most $n$ roots.) The Galois theory destination builds on this case.`,
      concepts: ['polynomials', 'groups'],
      check: {
        prompt: r`How many symmetries does $\mathbb F_{256}$ have?`,
        options: [r`$8$`, r`$256$`, r`$255$`],
        answer: 0,
        explain: r`$256 = 2^8$, so $n = 8$: the maps $a \mapsto a^{2^k}$ for $k = 0, \dots, 7$.`,
      },
    },
    {
      title: 'Roots come in orbits',
      claim: r`If $g$ has coefficients in $\mathbb F_p$ and $g(\beta) = 0$, then $g(\beta^p) = 0$. So the roots of $g$ fall into whole orbits $\beta, \beta^p, \beta^{p^2}, \dots$`,
      figure: {
        svgs: [orbits],
        caption: r`$\mathbb F_{16} = \mathbb F_2[x]/(x^4 + x + 1)$ has a primitive element $\alpha$, and Frobenius sends $\alpha^e$ to $\alpha^{2e}$: it doubles exponents mod $15$. The exponents split into orbits; the three drawn are the orbits of $1$, $3$ and $5$.`,
      },
      why: r`Apply $\varphi$ to $g(\beta) = 0$. It preserves sums and products and fixes the coefficients of $g$, so $0 = \varphi(g(\beta)) = g(\varphi(\beta)) = g(\beta^p)$.`,
      detail: r`Over the reals, the same argument with complex conjugation in place of $\varphi$ shows that a real polynomial's non-real roots come in conjugate pairs.

Consequence: the smallest polynomial over $\mathbb F_p$ with a given root $\beta$ (its **minimal polynomial**) must have the whole orbit as roots. In $\mathbb F_{16}$ the orbit of $\alpha$ has $4$ elements, the orbit of $\alpha^3$ has $4$, and the orbit of $\alpha^5 = \{\alpha^5, \alpha^{10}\}$ only $2$, so their minimal polynomials have degrees $4$, $4$ and $2$: $x^4 + x + 1$, $x^4 + x^3 + x^2 + x + 1$ and $x^2 + x + 1$.`,
      concepts: ['polynomials'],
      check: {
        prompt: r`In $\mathbb F_{16}$, what is the orbit of $\alpha^7$ under Frobenius?`,
        options: [r`$\alpha^7, \alpha^{14}, \alpha^{13}, \alpha^{11}$`, r`$\alpha^7, \alpha^{14}$`, r`$\alpha^7, \alpha^{49}$`],
        answer: 0,
        explain: r`Double mod $15$: $7 \to 14 \to 28 \equiv 13 \to 26 \equiv 11 \to 22 \equiv 7$. (The last option forgets that exponents live mod $15$, since $\alpha^{15} = 1$.)`,
      },
    },
    {
      title: 'The format strip of a QR code',
      claim: r`A QR code protects its $5$ format bits (error-correction level and mask) with $10$ check bits, using $g(x) = x^{10} + x^8 + x^5 + x^4 + x^2 + x + 1$. Its roots in $\mathbb F_{16}$ are the $10$ powers of $\alpha$ in the orbits of $1$, $3$ and $5$.`,
      cited: r`BCH codes: Hocquenghem, 1959; Bose and Ray-Chaudhuri, 1960. QR format information: ISO/IEC 18004`,
      why: r`To correct $3$ wrong bits, the BCH design asks for a polynomial over $\mathbb F_2$ with the six consecutive roots $\alpha, \alpha^2, \dots, \alpha^6$. By step 5 it must then contain their whole orbits, $\{1, 2, 4, 8\}$, $\{3, 6, 12, 9\}$ and $\{5, 10\}$: $10$ roots, so degree $10$, so $10$ check bits.`,
      detail: r`Multiply the three minimal polynomials from step 5:
$$(x^4 + x + 1)(x^4 + x^3 + x^2 + x + 1)(x^2 + x + 1) = x^{10} + x^8 + x^5 + x^4 + x^2 + x + 1.$$
The $5$ format bits become the coefficients of $x^{14}, \dots, x^{10}$, and the check bits are the remainder that makes the whole $15$-bit word a multiple of $g$. The **BCH bound** (cited) says that a nonzero multiple of a polynomial with $\delta - 1$ consecutive roots $\alpha, \dots, \alpha^{\delta - 1}$ has at least $\delta$ nonzero coefficients. Here $\delta = 7$: any two format words differ in at least $7$ bits (a computer confirms it for all $32$), so $3$ misread bits are corrected.

The strip is printed twice, around the corner squares, and read before anything else: the scanner needs the mask and the level to decode the rest.`,
      concepts: ['polynomials', 'codes'],
      check: {
        prompt: r`Why does asking for $6$ roots cost $10$ check bits rather than $6$?`,
        options: [
          r`Over $\mathbb F_2$, roots come in Frobenius orbits, and the orbits of $1, \dots, 6$ hold $10$ exponents`,
          r`Each root needs two bits`,
          r`Four bits are used for the mask`,
        ],
        answer: 0,
        explain: r`A polynomial with coefficients in $\mathbb F_2$ that has $\alpha^3$ as a root also has $\alpha^6, \alpha^{12}, \alpha^9$. The orbits add the roots $\alpha^8, \alpha^{12}, \alpha^9, \alpha^{10}$ for free, giving degree $10$.`,
      },
    },
  ],
  takeaway: r`One map, $a \mapsto a^p$, generates every symmetry of a finite field. Roots of polynomials over $\mathbb F_p$ come in its orbits, which is why codes over $\mathbb F_2$, like the QR format strip, are designed orbit by orbit.`,
};
