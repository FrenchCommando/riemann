import { svg, path, rect, text, grid, line } from '../figures.js';

const r = String.raw;

const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

// ---------- the dictionary ----------

const dictionary = svg('0 0 400 190', 'Two boxes joined by a double arrow. Left, the arithmetic side: counting roots of polynomials and points of curves mod p, Galois representations. Right, the analytic side: coefficients of modular forms, automorphic representations. Between them: the same L-function',
  rect(10, 20, 140, 150, 'f-tri'), rect(250, 20, 140, 150, 'f-sq'),
  text(80, 42, 'Arithmetic', 'f-sm f-v'), text(320, 42, 'Analysis', 'f-sm f-v'),
  text(80, 76, 'roots mod p', 'f-pt'), text(80, 98, 'points mod p', 'f-pt'), text(80, 120, 'Galois', 'f-pt'), text(80, 136, 'representations', 'f-pt'),
  text(320, 76, 'modular forms', 'f-pt'), text(320, 98, 'q-series coefficients', 'f-pt'), text(320, 120, 'automorphic', 'f-pt'), text(320, 136, 'representations', 'f-pt'),
  text(200, 88, '⟷', 'f-big f-acc'),
  text(200, 114, 'same', 'f-pt'), text(200, 129, 'L-function', 'f-pt'));

// ---------- x³ − x − 1 vs q ∏ (1 − qⁿ)(1 − q²³ⁿ) ----------

const N = 60;
const coef = new Array(N + 1).fill(0);
coef[0] = 1;
const times = (k) => { for (let i = N; i >= k; i--) coef[i] -= coef[i - k]; };
for (let n = 1; n <= N; n++) { times(n); if (23 * n <= N) times(23 * n); }
const aOf = (p) => coef[p - 1]; // coefficient of q^p
const roots = (p) => { let c = 0; for (let x = 0; x < p; x++) if ((((x * x * x - x - 1) % p) + p) % p === 0) c++; return c; };
const ps = [2, 3, 5, 7, 11, 13, 17, 19, 59];
const S = 34;
const cubic = svg('0 0 395 135', 'Table for the primes 2, 3, 5, 7, 11, 13, 17, 19 and 59: the number of roots of x cubed minus x minus 1 mod p, and the coefficient a p of the q-series. In every column the number of roots is a p plus 1',
  text(40, 14 + S / 2, 'p', 'f-sm'), text(40, 14 + 3 * S / 2, 'roots', 'f-pt'), text(40, 14 + 5 * S / 2, 'aₚ', 'f-sm'),
  grid([ps.map(String), ps.map((p) => String(roots(p))), ps.map((p) => String(aOf(p)))], 80, 14, S,
    (i, j) => (i === 0 ? '' : roots(ps[j]) === 3 ? 'f-sq' : ''), (i) => (i === 0 ? 'f-v f-sm' : 'f-sm')));

// ---------- Sato–Tate for y² + y = x³ − x² ----------

const ts = [];
for (let p = 3; p < 3000; p++) {
  if (!isPrime(p) || p === 11) continue;
  const sq = new Array(p).fill(0);
  for (let y = 0; y < p; y++) sq[(y * y + y) % p]++;
  let n = 1;
  for (let x = 0; x < p; x++) n += sq[(((x * x * x - x * x) % p) + p) % p];
  ts.push((p + 1 - n) / (2 * Math.sqrt(p)));
}
const BINS = 16, W = 280, HY = 210; // HY units per unit of density
const counts = new Array(BINS).fill(0);
ts.forEach((t) => counts[Math.min(BINS - 1, Math.floor(((t + 1) / 2) * BINS))]++);
const bw = W / BINS;
const semi = [];
for (let i = 0; i <= 100; i++) { const t = -1 + i / 50; semi.push([W * (t + 1) / 2, -HY * (2 / Math.PI) * Math.sqrt(Math.max(0, 1 - t * t))]); }
const satoTate = svg('-20 -190 320 220', `Histogram of a p over 2 root p for the curve y squared plus y equals x cubed minus x squared, over the ${ts.length} primes below 3000, closely following a semicircle`,
  ...counts.map((c, i) => rect(i * bw + 1, -HY * (c / ts.length / (2 / BINS)), bw - 2, HY * (c / ts.length / (2 / BINS)), 'f-bar')),
  line(semi, 'f-curve'),
  path(`M0 0H${W}`, 'f-axis'),
  text(0, 14, '−1', 'f-pt'), text(W / 2, 14, '0', 'f-pt'), text(W, 14, '1', 'f-pt'),
  text(W / 2, -176, 'aₚ / 2√p', 'f-sm'));

// ---------- content ----------

export default {
  id: 'langlands',
  kind: 'roadmap',
  field: 'Frontiers',
  title: 'The Langlands program',
  attribution: 'Robert Langlands, letter to André Weil, January 1967',
  statement: r`Counting solutions of equations modulo primes (arithmetic) and the coefficients of highly symmetric functions (analysis) are two descriptions of the same objects, matched by their $L$-functions.`,
  figure: {
    svgs: [dictionary],
    caption: r`The Langlands correspondence as a dictionary. Each entry on the left (how a polynomial or curve behaves mod every prime $p$) should have a partner on the right (a modular or automorphic form) with the same $L$-function.`,
  },
  prereqs: ['qr', 'curves', 'modular'],
  requiresTheorems: ['lagrange', 'primes3mod4', 'flt'],
  tagline: r`One dictionary between counting solutions mod $p$ and symmetric functions. Fermat's Last Theorem was one entry.`,
  status: 'Largely open; key cases proved',
  intro: r`Wiles's modularity theorem matched elliptic curves with modular forms. That turned out to be one entry in a much larger dictionary, conjectured by Langlands, which ties together reciprocity laws, $L$-functions and symmetry. This roadmap starts with examples you can check by hand, from Gauss to a cubic whose roots are predicted by a $q$-series, then states the conjectures and what is proved.`,
  steps: [
    {
      title: 'A first reciprocity law',
      claim: r`For a prime $p \ne 2, 5$: $\ x^2 \equiv 5 \pmod p$ has a solution exactly when $p \equiv \pm 1 \pmod 5$.`,
      cited: r`Quadratic reciprocity: conjectured by Euler and Legendre, proved by Gauss, 1796`,
      why: r`Quadratic reciprocity says that for odd primes $p, q$ with $q \equiv 1 \pmod 4$, $q$ is a square mod $p$ exactly when $p$ is a square mod $q$. With $q = 5$: the question becomes whether $p$ is a square mod $5$, and the squares mod 5 are $1$ and $4 \equiv -1$.`,
      detail: r`Why this is surprising: "is $5$ a square mod $p$?" is a question about arithmetic **mod $p$**, which changes completely from one prime to the next. The answer depends only on $p$ **mod 5**, a fixed, small modulus. Examples: $p = 11 \equiv 1$: $4^2 = 16 \equiv 5$ ✓. $p = 19 \equiv -1$: $9^2 = 81 = 76 + 5$ ✓. $p = 7 \equiv 2$: squares mod 7 are $1, 2, 4$, no $5$.

A rule of this shape, where how a polynomial factors mod $p$ is decided by a congruence condition on $p$, is called a **reciprocity law**. Gauss found eight proofs of this one; the search for higher reciprocity laws drove algebraic number theory for the next 150 years.`,
      concepts: ['qr'],
      check: {
        prompt: r`Does $x^2 \equiv 5$ have a solution mod $29$?`,
        options: [r`Yes, since $29 \equiv -1 \pmod 5$`, r`No, since $29 \equiv 1 \pmod 4$`, r`You have to try all $29$ values of $x$`],
        answer: 0,
        explain: r`$29 = 30 - 1 \equiv -1 \pmod 5$, so yes; indeed $11^2 = 121 = 116 + 5$. The rule saves trying all values. ($29 \bmod 4$ decides whether $-1$ is a square, a different question.)`,
      },
    },
    {
      title: 'When congruences are enough',
      claim: r`If the symmetry group of a polynomial's roots is **abelian**, how it factors mod $p$ depends only on $p$ mod some fixed $N$.`,
      cited: r`Kronecker–Weber theorem (Kronecker 1853, Weber 1886, Hilbert 1896); class field theory (Takagi 1920, Artin 1927)`,
      why: r`The roots of a polynomial over $\mathbb Q$ are permuted by its **Galois group**. When that group is abelian, Kronecker–Weber puts the roots inside a field generated by roots of unity, and for roots of unity the rule is visible: $x^n - 1$ splits into $n$ distinct roots mod $p$ exactly when $p \equiv 1 \pmod n$.`,
      detail: r`The roots-of-unity rule is group theory: the nonzero residues mod $p$ form a **cyclic** group of order $p - 1$ (there is a primitive root), and a cyclic group of order $m$ has $n$ elements with $x^n = 1$ exactly when $n \mid m$. One direction is Lagrange's theorem: the order of each root of $x^n - 1$ divides both $n$ and $p - 1$.

Class field theory is the full abelian reciprocity law: every abelian Galois group is described by congruence conditions. In Langlands's language, these conditions are characters $\chi : (\mathbb Z/N)^\times \to \mathbb C^\times$, the "automorphic forms for $\mathrm{GL}_1$", and their $L$-functions $\sum \chi(n) n^{-s}$ are Dirichlet's, the same ones from the primes-in-progressions proof.`,
      concepts: ['modular', 'groups'],
    },
    {
      title: 'When they are not: a cubic and a q-series',
      claim: r`For every prime $p \ne 23$, the number of roots of $x^3 - x - 1$ mod $p$ equals $a_p + 1$, where $\displaystyle \sum a_n q^n = q\prod_{n \ge 1}(1 - q^n)(1 - q^{23n}) = q - q^2 - q^3 + q^6 + \cdots$`,
      cited: r`Hecke; the example as presented in Serre, "On a theorem of Jordan", Bull. AMS 2003`,
      figure: {
        svgs: [cubic],
        caption: r`Count the roots of $x^3 - x - 1$ mod $p$, and read off $a_p$ from the $q$-series: the count is always $a_p + 1$. The first prime with three roots is $p = 59$. (Computed in your browser.)`,
      },
      why: r`The Galois group of $x^3 - x - 1$ is $S_3$, which is not abelian, so no congruence rule on $p$ can decide how it factors. Yet the product, a **modular form** of weight 1 and level 23, predicts it prime by prime. Check $p = 5$: $x = 2$ gives $8 - 2 - 1 = 5 \equiv 0$, and it is the only root, matching $a_5 = 0$.`,
      detail: r`Check $p = 2$: $x^3 - x - 1$ is $1$ at both $x = 0$ and $x = 1$, so no roots; and expanding the product, $q(1 - q)(1 - q^2)\cdots = q - q^2 - \cdots$ gives $a_2 = -1$. ✓

What a congruence can't see, a modular form can. Langlands's insight was that this is the general pattern: non-abelian reciprocity laws are given by automorphic forms. The level $23$ is not an accident: the discriminant of $x^3 - x - 1$ is $-23$.`,
      concepts: ['modular'],
      check: {
        prompt: r`Given $a_{59} = 2$, how many roots does $x^3 - x - 1$ have mod $59$?`,
        options: [r`$3$`, r`$2$`, r`$1$`],
        answer: 0,
        explain: r`Roots $= a_p + 1 = 3$: the cubic splits completely mod 59. (It can't have exactly 2 roots: the sum of the three roots of $x^3 - x - 1$ is $0$, so two roots force the third.)`,
      },
    },
    {
      title: 'Elliptic curves are the GL₂ case',
      claim: r`Modularity (every elliptic curve over $\mathbb Q$ matches a weight-2 modular form) is the same kind of statement, one dimension up: a 2-dimensional Galois representation matches an automorphic form for $\mathrm{GL}_2$.`,
      cited: r`Wiles; Taylor–Wiles 1995; Breuil–Conrad–Diamond–Taylor 2001; Khare–Wintenberger 2009 (Serre's conjecture)`,
      why: r`The Galois group acts on the points of order $\ell^k$ of an elliptic curve, a 2-dimensional representation. The trace of the "Frobenius at $p$" in it is exactly $a_p = p + 1 - \#E(\mathbb F_p)$, the point count from the Fermat roadmap, and modularity says those traces are a modular form's coefficients.`,
      detail: r`So the cubic in the previous step and the curves in Wiles's theorem are the same phenomenon: a representation of the Galois group whose Frobenius traces (root counts, point counts) are the coefficients of an automorphic form.

Wiles's own starting point was a piece of functoriality: the Langlands–Tunnell theorem, which makes the mod-3 representation of the curve modular. Khare and Wintenberger later proved Serre's modularity conjecture: every odd, irreducible 2-dimensional mod-$p$ representation comes from a modular form.`,
      concepts: ['curves'],
    },
    {
      title: "Langlands's conjectures",
      claim: r`**Reciprocity:** $n$-dimensional Galois representations correspond to automorphic representations of $\mathrm{GL}_n$, with equal $L$-functions. **Functoriality:** a map between the "dual groups" of two groups carries automorphic forms of one to automorphic forms of the other.`,
      cited: r`Langlands, letter to Weil (1967) and "Problems in the theory of automorphic forms" (1970)`,
      why: r`On both sides the $L$-function is an Euler product $\prod_p (\text{local factor at } p)^{-1}$. On the Galois side the local factor comes from Frobenius at $p$; on the automorphic side, from the Hecke eigenvalues at $p$. "Same $L$-function" means the local factors agree at almost every prime.`,
      detail: r`The 17-page handwritten letter asked Weil to read it as pure speculation, adding that if he couldn't, he surely had a wastebasket handy. Weil never replied, but had it typed, and the typed copy circulated among specialists. A scan is in the Institute for Advanced Study's Langlands archive (sources below).

The **Riemann zeta function** is the simplest entry: the trivial 1-dimensional representation matches the constant automorphic form on $\mathrm{GL}_1$, and its $L$-function is $\zeta(s) = \prod_p (1 - p^{-s})^{-1}$. Dirichlet $L$-functions are the other $\mathrm{GL}_1$ entries, and modular forms the $\mathrm{GL}_2$ entries.

A payoff Langlands had in view: **Artin's conjecture**, that the $L$-function of every non-trivial irreducible Galois representation is entire. Automorphic $L$-functions are known to be entire, so reciprocity would prove it.`,
      concepts: ['complex'],
      check: {
        prompt: r`In the elliptic-curve case, what is the "Frobenius trace at $p$"?`,
        options: [
          r`$a_p = p + 1 - \#E(\mathbb F_p)$`,
          r`The number $p$ itself`,
          r`The degree of the polynomial defining the curve`,
        ],
        answer: 0,
        explain: r`It's the point count's deviation from $p + 1$, the same $a_p$ that modularity matches with a modular form's $p$-th coefficient.`,
      },
    },
    {
      title: 'A consequence you can see: Sato–Tate',
      claim: r`For an elliptic curve over $\mathbb Q$ without complex multiplication, the numbers $a_p / 2\sqrt p \in [-1, 1]$ are distributed like the semicircle $\frac{2}{\pi}\sqrt{1 - t^2}$.`,
      cited: r`Conjectured by Sato and Tate, 1960s; proved by Clozel, Harris, Shepherd-Barron and Taylor (2008) and Barnet-Lamb, Geraghty, Harris and Taylor (2011)`,
      figure: {
        svgs: [satoTate],
        caption: r`$a_p / 2\sqrt p$ for $y^2 + y = x^3 - x^2$ over the primes below $3000$ (histogram, computed in your browser from the point counts), against the semicircle law (curve).`,
      },
      why: r`Hasse's bound puts every $a_p/2\sqrt p$ in $[-1, 1]$. The distribution inside that interval is controlled by the symmetric-power $L$-functions of the curve, and the proof shows they are automorphic: a case of functoriality ($\mathrm{GL}_2 \to \mathrm{GL}_{n+1}$), proved "potentially" by Taylor and collaborators.`,
      detail: r`Write $a_p = 2\sqrt p\cos\theta_p$. Sato–Tate says the angles $\theta_p$ follow the density $\frac{2}{\pi}\sin^2\theta$ on $[0, \pi]$, which is the semicircle in $t = \cos\theta$. It's the distribution of the trace of a random rotation in $\mathrm{SU}(2)$, and that is not a coincidence: $\mathrm{SU}(2)$ is the symmetry group the Langlands picture attaches to a non-CM curve.

The step from "each symmetric power $L$-function is analytic and non-zero on $\operatorname{Re} s = 1$" to "the angles are equidistributed" is the same argument as the Prime Number Theorem, one $L$-function at a time.`,
      concepts: ['curves', 'complex'],
      check: {
        prompt: r`According to Sato–Tate, where is $a_p / 2\sqrt p$ most often found?`,
        options: [r`Near $0$`, r`Near $\pm 1$`, r`Equally often everywhere in $[-1, 1]$`],
        answer: 0,
        explain: r`The semicircle density $\frac2\pi\sqrt{1 - t^2}$ peaks at $t = 0$ and vanishes at $\pm 1$: point counts close to $p + 1$ are the most common.`,
      },
    },
    {
      title: 'What is proved, and where it leads',
      claim: r`Proved: $\mathrm{GL}_1$ (class field theory), much of $\mathrm{GL}_2$ over $\mathbb Q$, the function-field case of $\mathrm{GL}_n$, the fundamental lemma, and geometric Langlands. Open: functoriality and reciprocity in general.`,
      cited: r`Drinfeld (GL₂ over function fields); L. Lafforgue, Fields Medal 2002 (GLₙ); Ngô, Fields Medal 2010 (fundamental lemma); Gaitsgory, Raskin and collaborators, 2024 (geometric Langlands)`,
      why: r`Over function fields (curves over $\mathbb F_q$), Drinfeld and Lafforgue proved reciprocity for $\mathrm{GL}_n$ using moduli spaces of "shtukas". Ngô's fundamental lemma removed a long-standing obstacle in the trace formula, Langlands's main tool for functoriality. The geometric version, where numbers are replaced by functions on a complex curve, was proved in a series of papers announced in 2024.`,
      detail: r`What remains open over $\mathbb Q$: reciprocity in dimension $\ge 3$ in general, functoriality beyond special cases, and Artin's conjecture in general (known for many 2-dimensional cases).

**And the Riemann Hypothesis.** The generalised Riemann Hypothesis is expected for every automorphic $L$-function, the whole right-hand column of the dictionary. Reporting on the November 2026 Lean proof of RH (see the Riemann Hypothesis roadmap) quotes Terence Tao's preliminary reading that it appears to use the full power of modern developments on the Langlands program and arithmetic geometry. If that holds up, the program that began with Gauss's reciprocity law will have supplied the tools for Riemann's problem.`,
      concepts: [],
    },
  ],
  takeaway: r`Reciprocity laws say that how equations behave mod $p$ is governed by analysis. Langlands conjectured one dictionary for all of them, organised by $L$-functions and symmetry groups; Fermat's Last Theorem and Sato–Tate are entries already proved.`,
  sources: [
    { label: 'Langlands program (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Langlands_program' },
    { label: 'R. P. Langlands, letter to André Weil, January 1967 (IAS archive, PDF)', url: 'https://publications.ias.edu/sites/default/files/letter-to-weil-1967-01-xx_rpl_0.pdf' },
    { label: 'J. Mueller, On the genesis of Langlands\' conjectures and his letter to André Weil, Bull. AMS 55 (2018)', url: 'https://www.ams.org/journals/bull/2018-55-04/S0273-0979-2018-01609-1' },
    { label: 'J.-P. Serre, On a theorem of Jordan, Bull. Amer. Math. Soc. 40 (2003)', url: 'https://doi.org/10.1090/S0273-0979-03-00992-3' },
    { label: 'Sato–Tate conjecture (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Sato%E2%80%93Tate_conjecture' },
    { label: 'Geometric Langlands correspondence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Geometric_Langlands_correspondence' },
  ],
};
