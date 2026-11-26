import { svg, grid, text } from '../figures.js';

const r = String.raw;

// F_4 = F_2[x]/(x^2 + x + 1): elements 0, 1, x, x+1 as 2-bit numbers.
const names = ['0', '1', 'x', 'x+1'];
const mul4 = (a, b) => {
  let p = 0;
  for (let i = 0; i < 2; i++) if ((b >> i) & 1) p ^= a << i;
  if (p & 4) p ^= 0b111; // x^2 = x + 1
  return p;
};
const S = 52;
const table = svg('0 0 270 270', 'Multiplication table of the field with four elements 0, 1, x and x plus 1. Every row except the zero row contains 1 exactly once, so every nonzero element has an inverse',
  text(S / 2 + 6, S / 2 + 6, '×', 'f-sm f-muted'),
  grid([names], 6 + S, 6, S, () => '', () => 'f-sm f-v'),
  grid(names.map((n) => [n]), 6, 6 + S, S, () => '', () => 'f-sm f-v'),
  grid(names.map((_, a) => names.map((__, b) => names[mul4(a, b)])), 6 + S, 6 + S, S,
    (i, j) => (mul4(i, j) === 1 ? 'f-hl' : ''), () => 'f-sm'));

export default {
  id: 'finitefields',
  field: 'Algebra',
  title: 'A field with 256 elements',
  attribution: 'Évariste Galois, "Sur la théorie des nombres", 1830; the byte field of QR codes, ISO/IEC 18004',
  statement: r`If $f$ is an irreducible polynomial of degree $n$ with coefficients in $\mathbb F_p = \mathbb Z/p$, then the polynomials taken mod $f$ form a field with $p^n$ elements. With $p = 2$ and $f = x^8 + x^4 + x^3 + x^2 + 1$, its elements are bytes: this is the field QR codes compute in.`,
  prereqs: ['polynomials', 'fields', 'gcd'],
  requiresTheorems: ['fta'],
  intro: r`Galois's other invention. Arithmetic on bytes mod 256 is no good for error correction because you can't divide: $2 \cdot 128 = 0$. This proof builds a different arithmetic on 8-bit strings where every nonzero byte can be divided by. The recipe is the one that builds $\mathbb Z/p$ from the integers, with primes replaced by irreducible polynomials.`,
  steps: [
    {
      title: 'Remainders mod f',
      claim: r`Every polynomial over $\mathbb F_p$ leaves a remainder of degree $\lt n$ on division by $f$, and there are exactly $p^n$ possible remainders.`,
      why: r`Division with remainder gives $g = qf + r$ with $\deg r \lt n$. A remainder is $a_0 + a_1 x + \dots + a_{n-1} x^{n-1}$, with $p$ choices for each of the $n$ coefficients.`,
      detail: r`This is the same move as $\mathbb Z/p$: every integer leaves one of $p$ remainders, and we compute with remainders only.

With $p = 2$ and $n = 8$ a remainder is a list of $8$ bits: **a byte**, with bit $i$ the coefficient of $x^i$. For example the byte $\mathtt{0x53} = 01010011$ is $x^6 + x^4 + x + 1$.`,
      concepts: ['polynomials'],
      check: {
        prompt: r`How many elements does this construction give with $p = 3$ and $f$ of degree $2$?`,
        options: [r`$9$`, r`$6$`, r`$8$`],
        answer: 0,
        explain: r`Remainders are $a_0 + a_1 x$ with $a_0, a_1 \in \{0, 1, 2\}$: $3^2 = 9$ of them.`,
      },
    },
    {
      title: 'Arithmetic mod f',
      claim: r`Add or multiply two remainders as polynomials, then reduce mod $f$. This is well defined and obeys the usual rules of arithmetic.`,
      figure: {
        svgs: [table],
        caption: r`The field with four elements, $\mathbb F_2[x]/(x^2 + x + 1)$. Multiplying uses $x^2 = x + 1$, so for instance $x \cdot x = x + 1$ and $x \cdot (x + 1) = x^2 + x = 1$. Every nonzero row has a $1$ in it (shaded): every nonzero element has an inverse.`,
      },
      why: r`It works exactly as congruences mod $n$ do: if $g \equiv g'$ and $h \equiv h' \pmod f$, then $f$ divides $g + h - (g' + h')$ and $gh - g'h' = g(h - h') + (g - g')h'$. The usual rules hold for polynomials, so they hold for remainders.`,
      detail: r`Over $\mathbb F_2$, coefficients add mod $2$, so adding two bytes is **bitwise XOR**, and every element is its own negative: $a + a = 0$.

Multiplying uses $f = 0$ as a rewriting rule. In the four-element field, $f = x^2 + x + 1$ gives $x^2 = -x - 1 = x + 1$ (signs don't matter mod $2$). So
$$x \cdot (x + 1) = x^2 + x = (x + 1) + x = 1.$$`,
      concepts: ['polynomials', 'modular'],
      check: {
        prompt: r`In the four-element field, what is $(x + 1)^2$?`,
        options: [r`$x$`, r`$x^2 + 1$`, r`$1$`],
        answer: 0,
        explain: r`$(x + 1)^2 = x^2 + 2x + 1 = x^2 + 1$ (since $2 = 0$), and $x^2 = x + 1$, so it is $x + 1 + 1 = x$. The second option is right but not yet reduced mod $f$.`,
      },
    },
    {
      title: 'Irreducible means you can divide',
      claim: r`If $f$ is irreducible, every nonzero remainder $g$ has an inverse mod $f$. If $f$ factors, some nonzero elements have none.`,
      why: r`Irreducible means the only divisors of $f$ are constants and constant multiples of $f$; since $f \nmid g$, $\gcd(g, f) = 1$. Euclid's algorithm for polynomials then gives Bézout: $ag + bf = 1$, so $ag \equiv 1 \pmod f$.`,
      detail: r`Euclid's algorithm works for polynomials for the same reason as for integers: each division strictly lowers the degree, so it stops, and running it backwards writes the last nonzero remainder, the gcd, as $ag + bf$. (This is Bézout's identity from the Fundamental Theorem of Arithmetic, with degree in place of size.)

If instead $f = gh$ with $g, h$ of smaller degree, then $g \cdot h \equiv 0$ while neither is $0$. An inverse of $g$ would give $h = g^{-1} g h \equiv 0$, a contradiction. That is the polynomial version of $2 \cdot 3 = 0$ in $\mathbb Z/6$.`,
      concepts: ['gcd', 'polynomials'],
      check: {
        prompt: r`Why can't $f = x^2 + 1$ be used over $\mathbb F_2$?`,
        options: [
          r`$x^2 + 1 = (x + 1)^2$, so $(x + 1)(x + 1) \equiv 0$ with $x + 1 \ne 0$`,
          r`It has degree $2$, which is too small`,
          r`Its constant term is $1$`,
        ],
        answer: 0,
        explain: r`Mod $2$, $(x + 1)^2 = x^2 + 2x + 1 = x^2 + 1$. So $x + 1$ is a zero divisor and has no inverse. $x^2 + x + 1$, also of degree $2$, works.`,
      },
    },
    {
      title: 'The field of bytes',
      claim: r`$f = x^8 + x^4 + x^3 + x^2 + 1$ is irreducible over $\mathbb F_2$. So bytes, with XOR for addition and multiplication mod $f$, form a field $\mathbb F_{256}$.`,
      why: r`If $f$ factored, one factor would have degree $\le 4$, and it could be taken irreducible. There are only $8$ irreducible polynomials of degree $\le 4$ over $\mathbb F_2$, and dividing $f$ by each leaves a nonzero remainder.`,
      detail: r`The eight candidates are $x$, $x + 1$, $x^2 + x + 1$, $x^3 + x + 1$, $x^3 + x^2 + 1$, $x^4 + x + 1$, $x^4 + x^3 + 1$ and $x^4 + x^3 + x^2 + x + 1$. Two are quick by hand: $f(0) = 1$, so $x$ is not a factor, and $f(1) = 1 + 1 + 1 + 1 + 1 = 1$, so $x + 1$ is not either. The other six take a few lines of long division each (or a computer, in microseconds).

The QR standard fixes this $f$, written as the number $285 = 2^8 + 2^4 + 2^3 + 2^2 + 1$. A sample product: $\mathtt{0x02} \cdot \mathtt{0x80} = x \cdot x^7 = x^8$, and $f = 0$ means $x^8 = x^4 + x^3 + x^2 + 1$, which is the byte $\mathtt{0x1D}$.`,
      concepts: ['polynomials'],
      check: {
        prompt: r`In this field, what is $\mathtt{0x02} \cdot \mathtt{0x80}$?`,
        options: [r`$\mathtt{0x1D}$`, r`$\mathtt{0x100}$`, r`$\mathtt{0x00}$`],
        answer: 0,
        explain: r`$x \cdot x^7 = x^8$, which is not a remainder; reducing with $x^8 = x^4 + x^3 + x^2 + 1$ gives $00011101 = \mathtt{0x1D}$. Ordinary arithmetic mod $256$ would give $0$, the zero divisor this construction avoids.`,
      },
    },
    {
      title: 'Conclude',
      claim: r`So $\mathbb F_p[x]/(f)$ is a field with $p^n$ elements, and $\mathbb F_{256}$ is one. $\blacksquare$`,
      why: r`Step 2 gives the rules of arithmetic, step 3 gives inverses of nonzero elements, and step 1 counts the elements.`,
      detail: r`Two facts the rest of the path doesn't need, stated without proof: the number of elements of a finite field is always a prime power (there is no field with $6$ or $10$ elements), and any two finite fields of the same size are the same up to renaming (Moore, 1893). So "the" field with $256$ elements makes sense, and choosing a different irreducible $f$ only relabels the bytes.`,
      concepts: ['fields'],
    },
  ],
  takeaway: r`Replace integers by polynomials and primes by irreducible polynomials, and the construction of $\mathbb Z/p$ builds a field of size $p^n$, including one whose elements are bytes.`,
};
