import { svg, path, text, dot } from '../figures.js';

const r = String.raw;

// A small Kakeya set in F_q^2, q odd: the lines y = m x + m² (one per slope m)
// plus the vertical line x = 0. A point (x, y) is on some line y = mx + m²
// exactly when x² + 4y is a square, so there are q(q+1)/2 + (q-1)/2 points.
export function kakeyaSet(q) {
  const squares = new Set(Array.from({ length: q }, (_, z) => (z * z) % q));
  const pts = [];
  for (let x = 0; x < q; x++) for (let y = 0; y < q; y++) {
    if (x === 0 || squares.has((x * x + 4 * y) % q)) pts.push([x, y]);
  }
  return pts;
}

const Q = 5, S = 44, O = 40;
const K = new Set(kakeyaSet(Q).map(([x, y]) => `${x},${y}`));
const gx = (x) => O + S * x, gy = (y) => O + S * (Q - 1 - y);
const onLine = (x, y) => y === (x + 1) % Q; // y = x + 1, slope m = 1
const plane = svg(`0 0 ${2 * O + S * (Q - 1)} ${2 * O + S * (Q - 1)}`, `The 25 points of the plane over the field with 5 elements, as a 5 by 5 grid. ${K.size} of them are filled: a set containing a full line in each of the 6 directions. The 5 points of the line y equals x plus 1 are ringed; it wraps around the edge of the grid`,
  path(`M${O - 22} ${gy(0) + 22}H${gx(Q - 1) + 20}M${O - 22} ${gy(0) + 22}V${gy(Q - 1) - 20}`, 'f-axis'),
  ...Array.from({ length: Q }, (_, i) => text(gx(i), gy(0) + 34, `${i}`, 'f-pt') + text(O - 32, gy(i), `${i}`, 'f-pt')),
  ...Array.from({ length: Q * Q }, (_, k) => {
    const x = k % Q, y = Math.floor(k / Q);
    return (K.has(`${x},${y}`) ? dot(gx(x), gy(y), 'f-dot2', 7) : dot(gx(x), gy(y), 'f-dot', 2.5)) +
      (onLine(x, y) ? dot(gx(x), gy(y), 'f-mark', 12) : '');
  }));

export default {
  id: 'dvir',
  field: 'Algebra',
  title: 'Kakeya sets over finite fields',
  attribution: 'Zeev Dvir, 2008; the question: Thomas Wolff, 1999',
  statement: r`Let $K \subseteq \mathbb F_q^n$ contain a line in every direction. Then
$$|K| \ge \binom{q + n - 1}{n} \ge \frac{q^n}{n!}.$$
So a Kakeya set over a finite field fills a fixed fraction of the whole space.`,
  figure: {
    svgs: [plane],
    caption: r`A Kakeya set in $\mathbb F_5^2$: the lines $y = mx + m^2$ for $m = 0, \dots, 4$ and the line $x = 0$, one in each of the $6$ directions. It has $${K.size}$ of the $25$ points; the theorem says at least $\binom{6}{2} = 15$. The line $y = x + 1$ (ringed) wraps around, since coordinates are taken mod $5$.`,
  },
  prereqs: ['polynomials', 'linsys', 'binomial'],
  requiresTheorems: ['finitefields'],
  intro: r`Wolff proposed the Kakeya problem over a finite field as a toy model of the real one: no tubes, no $\delta$, just lines of $q$ points. Experts expected it to be nearly as hard. Dvir solved it in a page, with the **polynomial method**: if $K$ were small, some low-degree polynomial would vanish on it, and vanishing on a line in every direction is too much for a low-degree polynomial. The argument doesn't transfer to the real numbers, but it changed how people attack the real problem.`,
  steps: [
    {
      title: 'Lines in a finite space',
      claim: r`A line in $\mathbb F_q^n$ is $\{a + tb : t \in \mathbb F_q\}$ with $b \ne 0$; it has exactly $q$ points, and its direction is $b$ up to a nonzero multiple. A **Kakeya set** contains at least one line in each direction.`,
      why: r`Different $t$ give different points because $b \ne 0$ and $\mathbb F_q$ is a field: $a + tb = a + sb$ means $(t - s)b = 0$, so $t = s$. Scaling $b$ by $c \ne 0$ only reparametrises the line ($t \mapsto t/c$).`,
      detail: r`There are $(q^n - 1)/(q - 1)$ directions: the nonzero vectors, grouped into classes of $q - 1$ multiples. In the plane that is $q + 1$: the slopes $m \in \mathbb F_q$ and the vertical. The figure has $6 = 5 + 1$ lines.

The whole space has $q^n$ points, and a Kakeya set needs a line of $q$ points in each of about $q^{n-1}$ directions. If the lines never met, that would be about $q^n$ points; the question is how much overlap can save.`,
      concepts: ['fields'],
      check: {
        prompt: r`How many directions are there in $\mathbb F_3^2$?`,
        options: [r`$4$`, r`$8$`, r`$9$`],
        answer: 0,
        explain: r`$(3^2 - 1)/(3 - 1) = 4$: slopes $0, 1, 2$ and the vertical. The $8$ nonzero vectors come in pairs $b, 2b$ pointing along the same line.`,
      },
    },
    {
      title: 'Counting monomials',
      claim: r`The polynomials in $n$ variables of degree at most $d$ have $\binom{d + n}{n}$ coefficients: one for each monomial $x_1^{a_1} \cdots x_n^{a_n}$ with $a_1 + \dots + a_n \le d$.`,
      why: r`Add a slack exponent $a_0 = d - (a_1 + \dots + a_n) \ge 0$. The monomials correspond to ways of writing $d = a_0 + a_1 + \dots + a_n$ with $a_i \ge 0$: lay out $d$ stars and $n$ bars in a row, $\binom{d + n}{n}$ ways to place the bars.`,
      detail: r`Check with $n = 2$, $d = 2$: the monomials are $1, x, y, x^2, xy, y^2$, six of them, and $\binom{4}{2} = 6$.

With $d = q - 1$, which is what the proof uses, the count is $\binom{q - 1 + n}{n}$, the number in the theorem.`,
      concepts: ['binomial'],
      check: {
        prompt: r`How many monomials of degree at most $1$ are there in $n$ variables?`,
        options: [r`$n + 1$`, r`$n$`, r`$2^n$`],
        answer: 0,
        explain: r`$1, x_1, \dots, x_n$, and $\binom{1 + n}{n} = n + 1$. Forgetting the constant $1$ gives $n$.`,
      },
    },
    {
      title: 'A polynomial through any small set',
      claim: r`If $|K| \lt \binom{q - 1 + n}{n}$, there is a nonzero polynomial $P$ of degree at most $q - 1$ with $P(k) = 0$ for every $k \in K$.`,
      why: r`Each condition $P(k) = 0$ is one linear equation in the coefficients of $P$. There are $|K|$ equations and $\binom{q - 1 + n}{n}$ unknowns, more unknowns than equations, so a nonzero solution exists.`,
      detail: r`Writing $P = \sum c_a x^a$ over the monomials $x^a$ of degree $\le q - 1$, the condition at a point $k$ is $\sum_a c_a k^a = 0$: the numbers $k^a$ are known, the $c_a$ are the unknowns. Linear in the $c_a$, homogeneous.

This is the whole "polynomial method" in one line: a set too small for its size class is the zero set of a polynomial of low degree. The rest of the proof shows a Kakeya set can't be.`,
      concepts: ['linsys'],
      check: {
        prompt: r`What are the unknowns in these linear equations?`,
        options: [r`The coefficients of $P$`, r`The coordinates of the points of $K$`, r`The directions of the lines`],
        answer: 0,
        explain: r`The points of $K$ are given; each one gives an equation $\sum_a c_a k^a = 0$ in the unknown coefficients $c_a$.`,
      },
    },
    {
      title: 'Vanishing on a line kills the top part',
      claim: r`Suppose such a $P$ exists, of degree $d \le q - 1$, and let $P_d$ be its part of degree exactly $d$. Then $P_d(b) = 0$ for every $b \in \mathbb F_q^n$.`,
      why: r`For each direction $b \ne 0$, $K$ contains a line $a + tb$. Then $g(t) = P(a + tb)$ is a polynomial in $t$ of degree at most $d \lt q$ with $q$ roots, so it is zero. Its coefficient of $t^d$ is $P_d(b)$.`,
      detail: r`**The coefficient of $t^d$.** Expanding $P(a + tb)$, only the degree-$d$ terms of $P$ can reach $t^d$, and there each variable $x_i$ contributes $tb_i$ to the top power: $P_d(a + tb) = t^d P_d(b) + (\text{lower powers of } t)$.

**The other points.** $d \ge 1$, since a nonzero constant can't vanish on $K$. So $P_d$ is homogeneous of degree at least $1$, and $P_d(0) = 0$. Every multiple of $b$ is covered too: $P_d(cb) = c^d P_d(b) = 0$.

**Where $d \lt q$ is used.** A nonzero polynomial in one variable of degree $\lt q$ has fewer than $q$ roots (the root bound), so $g$ vanishing at all $q$ points of $\mathbb F_q$ forces $g = 0$.`,
      concepts: ['polynomials'],
      check: {
        prompt: r`Why must $P(a + tb)$ be the zero polynomial in $t$?`,
        options: [
          r`It has degree $\lt q$ but vanishes at all $q$ values of $t$`,
          r`Because $P$ vanishes everywhere`,
          r`Because $b \ne 0$`,
        ],
        answer: 0,
        explain: r`The line lies in $K$, where $P$ vanishes, so $g(t) = 0$ for all $q$ values of $t$. A nonzero polynomial of degree $\lt q$ has fewer than $q$ roots.`,
      },
    },
    {
      title: 'No low-degree polynomial vanishes everywhere',
      claim: r`A nonzero polynomial in which each variable has degree less than $q$ is nonzero at some point of $\mathbb F_q^n$. This contradicts step 4, since $P_d \ne 0$ has degree $d \lt q$.`,
      why: r`Induction on $n$. For $n = 1$ it is the root bound. For $n \gt 1$ write $P = \sum_{j \lt q} P_j(x_1, \dots, x_{n-1})\,x_n^j$ with some $P_j \ne 0$; by induction $P_j(c) \ne 0$ at some point $c$, so $P(c, x_n)$ is a nonzero polynomial in $x_n$ of degree $\lt q$, and it is nonzero at some value of $x_n$.`,
      detail: r`The degree condition can't be dropped: $x^q - x$ is zero at every point of $\mathbb F_q$, by Fermat's little theorem for finite fields ($a^q = a$). That is why the proof stops at degree $q - 1$, and why the count is $\binom{q - 1 + n}{n}$ and not more.`,
      concepts: ['polynomials', 'induction'],
      check: {
        prompt: r`Which polynomial vanishes at every point of $\mathbb F_5$?`,
        options: [r`$x^5 - x$`, r`$x^4 - 1$`, r`$x^4 - x$`],
        answer: 0,
        explain: r`$a^5 = a$ for every $a \in \mathbb F_5$, and $x^5 - x$ has degree $5 = q$. $x^4 - 1$ vanishes at the four nonzero elements but is $-1$ at $0$; $x^4 - x$ is $16 - 2 \equiv 4$ at $2$.`,
      },
    },
    {
      title: 'Conclude',
      claim: r`So no such $P$ exists, and $|K| \ge \binom{q - 1 + n}{n} = \frac{q(q+1)\cdots(q + n - 1)}{n!} \ge \frac{q^n}{n!}$. $\blacksquare$`,
      why: r`Step 3 would produce $P$ if $K$ were smaller; steps 4 and 5 show it can't exist. The product has $n$ factors, each at least $q$.`,
      detail: r`In the plane the bound is $\binom{q+1}{2} = q(q+1)/2$, about half the plane, and the figure's construction has $q(q+1)/2 + (q - 1)/2$ points, so for $n = 2$ the bound is nearly exact.

In higher dimensions $1/n!$ is far from the truth. Dvir, Kopparty, Saraf and Sudan (2009) improved it to about $q^n/2^n$ by asking $P$ to vanish to high order at each point of $K$, the "method of multiplicities".

Over $\mathbb R$ the argument has nothing to grip: real lines have infinitely many points, and the real problem is about $\delta$-tubes, which a polynomial can't "vanish on". What carried over is the idea that the hard examples sit near low-degree algebraic surfaces, which became central to the 3D work.`,
      concepts: ['binomial'],
    },
  ],
  takeaway: r`A small set lies in the zero set of a low-degree polynomial, and a low-degree polynomial can't vanish on a line in every direction. So Kakeya sets over $\mathbb F_q$ have at least $q^n/n!$ points.`,
  sources: [
    { label: 'Kakeya set: Kakeya sets in vector spaces over finite fields (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kakeya_set#Kakeya_sets_in_vector_spaces_over_finite_fields' },
    { label: 'Dvir, On the size of Kakeya sets in finite fields, J. Amer. Math. Soc. 22 (2009), arXiv:0803.2336', url: 'https://arxiv.org/abs/0803.2336' },
  ],
};
