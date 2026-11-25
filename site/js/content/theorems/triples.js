import { svg, path, text, dot } from '../figures.js';

const r = String.raw;

// Rational points on the unit circle from small primitive triples, and the line
// of slope 1/2 through (-1, 0) that picks out (3/5, 4/5). Scale: 1 = 100 units.
const triples = [[3, 4, 5], [5, 12, 13], [15, 8, 17], [7, 24, 25], [21, 20, 29], [9, 40, 41], [35, 12, 37]];
const pts = [];
for (const [a, b, c] of triples) {
  for (const [x, y] of [[a, b], [b, a]]) for (const sx of [1, -1]) for (const sy of [1, -1]) pts.push([sx * x / c, sy * y / c]);
}
const circle = svg('-130 -130 260 260', 'Unit circle with rational points from Pythagorean triples, and the line through (-1, 0) with slope one half meeting the circle at (3/5, 4/5)',
  path('M-125 0H125M0 -125V125', 'f-axis'),
  '<circle cx="0" cy="0" r="100" class="f-line"/>',
  path('M-100 0L100 -100', 'f-arc'),
  ...pts.map(([x, y]) => dot(100 * x, -100 * y, 'f-dot', 2.6)),
  dot(-100, 0, 'f-dot2', 4), dot(60, -80, 'f-dot2', 4),
  text(-104, 16, '(−1, 0)', 'f-sm'), text(88, -92, '(3/5, 4/5)', 'f-sm'), text(-8, -62, 'slope ½', 'f-sm f-acc'));

export default {
  id: 'triples',
  field: 'Number theory',
  title: 'All Pythagorean triples',
  attribution: 'Euclid, Elements X.29 (lemma 1); the first step toward Fermat',
  statement: r`Every solution of $x^2 + y^2 = z^2$ in positive integers with $\gcd(x, y) = 1$ and $y$ even is
$$x = m^2 - n^2, \qquad y = 2mn, \qquad z = m^2 + n^2$$
for coprime integers $m \gt n \gt 0$ of opposite parity, and every such $m, n$ gives one.`,
  figure: {
    svgs: [circle],
    caption: r`Divide by $z^2$: a primitive triple is a rational point on the circle $X^2 + Y^2 = 1$. The line through $(-1, 0)$ with rational slope $t = \frac{n}{m}$ meets the circle again at $\big(\frac{m^2 - n^2}{m^2 + n^2}, \frac{2mn}{m^2 + n^2}\big)$; here $t = \frac12$ gives $(3, 4, 5)$.`,
  },
  prereqs: ['parity', 'gcd', 'primes', 'modular'],
  requiresTheorems: ['pythagoras', 'fta'],
  intro: r`Pythagoras says which lengths fit a right triangle; this says exactly which **whole numbers** do. It's the base case of Fermat's Last Theorem: for squares there are infinitely many solutions, and the next proof uses this list to show that for fourth powers there are none.`,
  steps: [
    {
      title: 'Primitive solutions are pairwise coprime',
      claim: r`If $x^2 + y^2 = z^2$ and $\gcd(x, y) = 1$, then $x, y, z$ are pairwise coprime.`,
      why: r`A prime dividing $z$ and $x$ divides $z^2 - x^2 = y^2$, hence $y$ (Euclid's lemma), contradicting $\gcd(x, y) = 1$. Same for $z$ and $y$.`,
      detail: r`Any solution reduces to one with $\gcd(x, y) = 1$: if $g = \gcd(x, y)$, then $g^2 \mid x^2 + y^2 = z^2$, so $g \mid z$, and $(x/g, y/g, z/g)$ is again a solution. So it is enough to find the **primitive** ones.

For pairwise coprimality: suppose a prime $p$ divides both $x$ and $z$. Then $p \mid z^2 - x^2 = y^2$, and since $p$ is prime, $p \mid y$. So $p$ divides both $x$ and $y$, which is impossible. The same argument works for $y$ and $z$.`,
      concepts: ['gcd', 'primes'],
    },
    {
      title: 'Exactly one leg is even',
      claim: r`In a primitive solution, one of $x, y$ is even and the other is odd; $z$ is odd.`,
      why: r`Both even contradicts coprimality. Both odd gives $z^2 \equiv 1 + 1 = 2 \pmod 4$, but squares are $0$ or $1 \bmod 4$.`,
      detail: r`Squares mod 4: $(2k)^2 = 4k^2 \equiv 0$ and $(2k+1)^2 = 4k^2 + 4k + 1 \equiv 1$. So a square is never $\equiv 2$ or $3 \pmod 4$.

If $x, y$ were both odd, $z^2 = x^2 + y^2 \equiv 2 \pmod 4$: impossible. They can't both be even since they are coprime. So exactly one is even; call it $y$. Then $z^2 = x^2 + y^2 \equiv 1 + 0$, so $z$ is odd.`,
      concepts: ['parity', 'modular'],
      check: {
        prompt: r`Why can't $x$ and $y$ both be odd?`,
        options: [
          r`Then $x^2 + y^2 \equiv 2 \pmod 4$, which is not a square mod 4`,
          r`Then $z$ would be even, and that's a contradiction`,
          r`Two odd numbers can't be coprime`,
        ],
        answer: 0,
        explain: r`Odd squares are $1 \bmod 4$, so the sum is $2 \bmod 4$, and no square is. ($z$ even is not by itself a contradiction: it's the mod-4 count that rules it out. And odd numbers like 3 and 5 are coprime.)`,
      },
    },
    {
      title: 'Factor the difference of squares',
      claim: r`With $z + x = 2u$ and $z - x = 2v$: $\ \big(\tfrac{y}{2}\big)^2 = uv$, and $\gcd(u, v) = 1$.`,
      why: r`$y^2 = z^2 - x^2 = (z + x)(z - x)$. Both factors are even ($x, z$ odd), so $u, v$ are integers and $y^2 = 4uv$. A common divisor of $u, v$ divides $u + v = z$ and $u - v = x$.`,
      detail: r`Since $x$ and $z$ are both odd, $z + x$ and $z - x$ are even, so $u = \frac{z + x}{2}$ and $v = \frac{z - x}{2}$ are positive integers, and
$$y^2 = (z + x)(z - x) = 4uv \quad\Longrightarrow\quad \Big(\frac y2\Big)^2 = uv.$$
($y$ is even, so $\frac y2$ is an integer.) If $d$ divides $u$ and $v$, it divides $u + v = z$ and $u - v = x$, which are coprime. So $d = 1$.`,
      concepts: ['divisibility', 'gcd'],
    },
    {
      title: 'Coprime factors of a square are squares',
      claim: r`If $\gcd(u, v) = 1$ and $uv$ is a perfect square, then $u$ and $v$ are perfect squares.`,
      why: r`In the prime factorisation of $uv$ every exponent is even. Coprime means each prime of $uv$ comes entirely from $u$ or entirely from $v$, so $u$ and $v$ also have only even exponents.`,
      detail: r`By the Fundamental Theorem of Arithmetic, write $uv = w^2 = \prod p^{2e_p}$. A prime $p$ dividing $uv$ divides exactly one of $u, v$ (not both, since they are coprime). So the full power $p^{2e_p}$ sits inside that one factor. Every exponent in $u$, and in $v$, is therefore even: $u = m^2$ and $v = n^2$ for some positive integers $m, n$.

Coprimality matters: $2 \cdot 8 = 16$ is a square but neither factor is.`,
      concepts: ['primes'],
      check: {
        prompt: r`$u = 2$, $v = 18$: $uv = 36$ is a square, yet neither factor is. Which hypothesis fails?`,
        options: [r`$\gcd(u, v) = 1$`, r`$uv$ is a square`, r`None; the lemma is false`],
        answer: 0,
        explain: r`$\gcd(2, 18) = 2$: the prime 2 is shared, so its even total exponent is split $1 + 1$ between the factors.`,
      },
    },
    {
      title: 'Read off the formula',
      claim: r`$x = m^2 - n^2$, $y = 2mn$, $z = m^2 + n^2$, with $m \gt n \gt 0$ coprime and of opposite parity. Conversely, all such $m, n$ give primitive triples.`,
      why: r`$z = u + v = m^2 + n^2$, $x = u - v = m^2 - n^2$, and $\frac y2 = \sqrt{uv} = mn$. The conditions on $m, n$ are exactly what keeps the triple primitive.`,
      detail: r`From $u = m^2$, $v = n^2$: $z = u + v$, $x = u - v$ and $y = 2\sqrt{uv} = 2mn$. Here $m \gt n$ because $x \gt 0$; $\gcd(m, n) = 1$ because $\gcd(u, v) = 1$; and $m, n$ have opposite parity because $z = m^2 + n^2$ is odd.

**Conversely**, the identity
$$(m^2 - n^2)^2 + (2mn)^2 = m^4 + 2m^2n^2 + n^4 = (m^2 + n^2)^2$$
shows every such pair gives a solution, and those conditions make it primitive. Examples: $(m, n) = (2, 1) \mapsto (3, 4, 5)$; $(3, 2) \mapsto (5, 12, 13)$; $(4, 1) \mapsto (15, 8, 17)$. $\qquad\blacksquare$`,
      concepts: ['parity', 'gcd'],
      check: {
        prompt: r`Which $(m, n)$ gives the triple $(7, 24, 25)$?`,
        options: [r`$(4, 3)$`, r`$(5, 2)$`, r`$(5, 0)$`],
        answer: 0,
        explain: r`$m^2 + n^2 = 25$ and $m^2 - n^2 = 7$ give $m^2 = 16$, $n^2 = 9$, and $2mn = 24$. $(5, 2)$ gives $(21, 20, 29)$; $n = 0$ isn't allowed (a leg would be $0$).`,
      },
    },
  ],
  takeaway: r`Factor, use coprimality, and let unique factorisation force each factor to be a square. The next proof runs this machine twice to get infinite descent.`,
};
