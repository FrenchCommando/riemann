import { svg, path, text, line } from '../figures.js';

const r = String.raw;

// Real points of y^2 = x^3 - x: an oval over [-1, 0] and a branch from x = 1.
const S = 45;
const branch = (x0, x1) => {
  const up = [], down = [];
  for (let x = x0; x <= x1 + 1e-9; x += 0.005) {
    const y = Math.sqrt(Math.max(0, x ** 3 - x));
    up.push([S * x, -S * y]); down.push([S * x, S * y]);
  }
  return [up, down];
};
const [ovalUp, ovalDown] = branch(-1, 0);
const [armUp, armDown] = branch(1, 2.25);
const curve = svg('-90 -150 220 300', 'The real points of the elliptic curve y squared equals x cubed minus x: a closed oval between x = -1 and 0, and an unbounded branch starting at x = 1',
  path('M-85 0H125M0 -145V145', 'f-axis'),
  ...[-1, 1, 2].map((x) => path(`M${S * x} -4V4`, 'f-axis')),
  text(-S, 44, '−1', 'f-pt'), text(S + 8, 16, '1', 'f-pt'), text(2 * S, 16, '2', 'f-pt'),
  line([...ovalUp, ...ovalDown.reverse()], 'f-curve', true),
  line([...armUp.reverse(), ...armDown], 'f-curve'),
  text(-40, -120, 'y² = x³ − x', 'f-sm f-acc'));

export default {
  id: 'flt',
  kind: 'roadmap',
  field: 'Frontiers',
  title: "Fermat's Last Theorem",
  attribution: 'Stated by Fermat c. 1637; proved by Andrew Wiles, with Richard Taylor, 1995',
  statement: r`For every $n \ge 3$ there are no positive integers $x, y, z$ with $x^n + y^n = z^n$.`,
  prereqs: ['curves', 'modular', 'primes'],
  requiresTheorems: ['flt4'],
  intro: r`The full proof runs to hundreds of pages of modern algebraic geometry, so this is a map rather than a walkthrough: each step either computes something you can check by hand or states a major theorem with its source. The route: turn a hypothetical solution into an elliptic curve so strange that it can't be "modular", then prove that every such curve is modular.`,
  steps: [
    {
      title: 'What is left to prove',
      claim: r`It suffices to show $x^p + y^p = z^p$ has no positive solutions for every prime $p \ge 5$.`,
      cited: r`Fermat ($n = 4$, previous proof); Euler, 1770 ($p = 3$)`,
      why: r`The $n = 4$ proof reduced everything to odd primes, and $p = 3$ was settled by Euler (with a gap later filled). From now on $p \ge 5$ is prime and, for contradiction, $a^p + b^p = c^p$ with $a, b, c$ positive and pairwise coprime.`,
      detail: r`Dividing out common factors, a solution can be assumed **primitive**: $\gcd(a, b, c) = 1$, and then pairwise coprime (a prime dividing two of them divides the third $p$-th power, hence the third number). Exactly one of $a, b, c$ is even, as with Pythagorean triples. By rearranging (and replacing a term by its negative, allowed since $p$ is odd) one can arrange $b$ even and $a \equiv -1 \pmod 4$. That normalisation is what makes the next steps' curve as nice as possible.`,
      concepts: ['primes', 'parity'],
    },
    {
      title: 'Why the obvious algebra fails',
      claim: r`Factoring $c^p = a^p + b^p = \prod_{k=0}^{p-1}(a + \zeta^k b)$ with $\zeta = e^{2\pi i/p}$ would work if factorisation into primes were unique in $\mathbb{Z}[\zeta]$, but often it is not.`,
      cited: r`Lamé and Kummer, 1847; Kummer proved Fermat for all **regular** primes`,
      why: r`Lamé's 1847 "proof" assumed unique factorisation in $\mathbb{Z}[\zeta]$. It fails, first for $p = 23$. Kummer's ideal theory repaired the argument for regular primes ($p$ not dividing the class number), which covers all $p \lt 37$ but not $37, 59, 67, \dots$`,
      detail: r`The same failure is easy to see in a smaller ring, $\mathbb{Z}[\sqrt{-5}] = \{a + b\sqrt{-5}\}$:
$$6 = 2 \cdot 3 = (1 + \sqrt{-5})(1 - \sqrt{-5}).$$
Use the norm $N(a + b\sqrt{-5}) = a^2 + 5b^2$, which is multiplicative. $N(2) = 4$, so a proper factor of $2$ would have norm $2$, but $a^2 + 5b^2 = 2$ has no integer solutions. So $2$ is irreducible, and the same check works for $3$ (norm $9$, would need norm $3$) and for $1 \pm \sqrt{-5}$ (norm $6$, would need norm $2$ or $3$). Two genuinely different factorisations into irreducibles.

This is why the 20th-century proof takes a completely different route.`,
      concepts: ['primes'],
      check: {
        prompt: r`Why can't $2$ factor in $\mathbb{Z}[\sqrt{-5}]$ (other than as a unit times $2$)?`,
        options: [
          r`A proper factor would have norm $2$, and $a^2 + 5b^2 = 2$ has no integer solutions`,
          r`Because $2$ is prime in $\mathbb{Z}$`,
          r`Because $\sqrt{-5}$ is not real`,
        ],
        answer: 0,
        explain: r`Norms multiply, and $N(2) = 4$, so a factorisation into non-units would be $2 \cdot 2$ in norms. Being prime in $\mathbb{Z}$ is not enough: $5 = -(\sqrt{-5})^2$ factors in this ring.`,
      },
    },
    {
      title: 'Elliptic curves and their numbers a_p',
      claim: r`An elliptic curve $E$ over $\mathbb{Q}$ has, for each prime $p$, an integer $a_p = p + 1 - \#E(\mathbb{F}_p)$, with $|a_p| \le 2\sqrt p$.`,
      cited: r`Hasse, 1933 (the bound)`,
      figure: {
        svgs: [curve],
        caption: r`The real points of $y^2 = x^3 - x$. Fermat's equation will be traded for a curve of this kind, and the curve studied through its point counts mod $p$.`,
      },
      why: r`Count solutions mod $p$, add the point at infinity. For $E: y^2 = x^3 - x$ and $p = 5$: the right side is $0, 0, 1, 4, 0$ for $x = 0, 1, 2, 3, 4$; squares mod 5 are $0, 1, 4$ (with $1$ and $4$ each hit twice). So $1 + 1 + 2 + 2 + 1 + 1 = 8$ points, and $a_5 = 5 + 1 - 8 = -2$.`,
      detail: r`Points on a curve mod $p$ are the arithmetic shadow of the curve. Heuristically each $x$ gives on average one $y$ (half the values are squares, each with two roots), so $\#E(\mathbb{F}_p) \approx p + 1$ and $a_p$ measures the deviation. Hasse's theorem caps it at $2\sqrt p$. That bound is the Riemann Hypothesis for the curve's zeta function over $\mathbb{F}_p$: there the analogue of RH is a theorem.

Elliptic curves also carry a group law (two points determine a third via the line through them), which is how Wiles's proof gets hold of them algebraically.`,
      concepts: ['curves'],
      check: {
        prompt: r`For $y^2 = x^3 - x$ mod $3$ there are $4$ points (including infinity). What is $a_3$?`,
        options: [r`$0$`, r`$-1$`, r`$4$`],
        answer: 0,
        explain: r`$a_3 = 3 + 1 - 4 = 0$. (For this curve $a_p = 0$ for every prime $p \equiv 3 \pmod 4$.)`,
      },
    },
    {
      title: 'Modular curves: the a_p come from a q-series',
      claim: r`For $E: y^2 + y = x^3 - x^2$, the numbers $a_p$ are the coefficients of $\displaystyle q\prod_{n \ge 1}(1 - q^n)^2(1 - q^{11n})^2 = q - 2q^2 - q^3 + 2q^4 + q^5 + \cdots$`,
      cited: r`Eichler, 1954; Shimura; conjectured in general by Taniyama, Shimura and Weil (1955–1967)`,
      why: r`Check $p = 2$: $y^2 + y$ is $0$ for both $y$, and $x^3 - x^2$ is $0$ for both $x$, so all $4$ pairs work: $5$ points, $a_2 = 2 + 1 - 5 = -2$. ✓ The product is a **modular form** of weight 2 and level 11. A curve whose $a_p$ match a modular form this way is called **modular**.`,
      detail: r`Check $p = 3$: $y^2 + y$ takes values $0, 2, 0$ for $y = 0, 1, 2$, so value $0$ has two $y$'s and value $1$ has none. $x^3 - x^2$ takes values $0, 0, 1$ for $x = 0, 1, 2$. That's $2 + 2 + 0 = 4$ points plus infinity: $a_3 = 3 + 1 - 5 = -1$. ✓ (And $p = 5$ gives $a_5 = 1$, matching the coefficient of $q^5$.)

Modular forms are functions on the upper half-plane with an enormous symmetry group, which makes their coefficients extremely rigid: forms of a given weight and **level** form a finite-dimensional space. The **modularity conjecture** said every elliptic curve over $\mathbb{Q}$ matches a weight-2 form, with level determined by the primes where the curve degenerates mod $p$ (here, only $p = 11$).`,
      concepts: ['curves'],
      check: {
        prompt: r`Expanding $q(1 - q)^2(1 - q^2)^2\cdots$, what is the coefficient of $q^2$?`,
        options: [r`$-2$`, r`$1$`, r`$2$`],
        answer: 0,
        explain: r`Up to $q^2$, the product is $q(1 - 2q + \cdots) = q - 2q^2 + \cdots$, matching $a_2 = -2$ from the point count.`,
      },
    },
    {
      title: 'The Frey curve',
      claim: r`From $a^p + b^p = c^p$, build $E: y^2 = x(x - a^p)(x + b^p)$. Its discriminant is $16\,(abc)^{2p}$, essentially a perfect $p$-th power.`,
      cited: r`Hellegouarch, 1970s; Frey, 1984; made precise by Serre, 1987`,
      why: r`A cubic $(x - e_1)(x - e_2)(x - e_3)$ gives discriminant $16\prod_{i \lt j}(e_i - e_j)^2$. Here the roots are $0, a^p, -b^p$, with differences $a^p$, $b^p$ and $a^p + b^p = c^p$.`,
      detail: r`$$\Delta = 16\,(a^p)^2 (b^p)^2 (a^p + b^p)^2 = 16\,(a^p b^p c^p)^2 = 16\,(abc)^{2p}.$$
The curve degenerates mod a prime $\ell$ exactly when $\ell \mid \Delta$, i.e. $\ell \mid abc$ (or $\ell = 2$), and always mildly (**semistable**, thanks to the normalisation in step 1). A discriminant that is a perfect $p$-th power is wildly unusual. Frey's insight: the mod-$p$ information of this curve "doesn't see" the primes dividing $abc$, so if it were modular, it should come from a modular form of tiny level.`,
      concepts: ['curves'],
      check: {
        prompt: r`What makes the Frey curve's discriminant a $p$-th power?`,
        options: [
          r`The three root differences are $a^p$, $b^p$ and $a^p + b^p = c^p$`,
          r`Every elliptic curve's discriminant is a $p$-th power`,
          r`The factor $16$`,
        ],
        answer: 0,
        explain: r`The Fermat equation is used exactly once: to turn the third difference $a^p + b^p$ into $c^p$.`,
      },
    },
    {
      title: "Ribet: Frey's curve can't be modular",
      claim: r`If the Frey curve were modular, it would correspond to a weight-2 modular form of level 2. There are none. So it is not modular.`,
      cited: r`Ribet, 1990 (announced 1986), proving Serre's epsilon conjecture`,
      why: r`Ribet's level-lowering theorem: when the mod-$p$ representation of a modular curve is unramified at a prime $\ell$, the matching modular form can be replaced by one of level with $\ell$ removed. For the Frey curve that strips every odd prime of $abc$, leaving level 2, and the space of weight-2 cusp forms of level 2 is zero.`,
      detail: r`Every step here is a deep theorem, so take this one as a black box. The shape of the argument: modularity gives a form $f$ of level $N = \prod_{\ell \mid abc} \ell$ (roughly). The $p$-th power discriminant makes the Galois representation on the curve's $p$-torsion points unramified at each odd $\ell \mid abc$. Ribet shows that then a form of level $N/\ell$ also matches mod $p$; repeat until the level is $2$. Since $\dim S_2(\Gamma_0(2)) = 0$, there is nothing to match: contradiction. So **modularity of semistable curves implies Fermat**.`,
      concepts: ['curves', 'contradiction'],
    },
    {
      title: 'Wiles: semistable curves are modular',
      claim: r`Every semistable elliptic curve over $\mathbb{Q}$ is modular. Hence the Frey curve can't exist, and Fermat's Last Theorem is true. $\qquad\blacksquare$`,
      cited: r`Wiles, *Annals of Mathematics* 1995; Taylor–Wiles, same issue (fixing a gap found in 1993)`,
      why: r`Wiles proved a modularity lifting theorem: if a curve's mod-$3$ representation is modular (known from Langlands–Tunnell), so is the curve, with a "3–5 switch" when the mod-3 picture degenerates. Taylor–Wiles supplied the key step after the 1993 announcement was found to have a gap.`,
      detail: r`The heart is an "$R = T$" theorem: a ring $R$ parametrising all ways of deforming a Galois representation equals a Hecke ring $T$ built from modular forms. Equality means every deformation, in particular the one coming from the curve, is modular.

**Afterwards:** Breuil, Conrad, Diamond and Taylor (2001) removed "semistable": every elliptic curve over $\mathbb{Q}$ is modular. The same circle of ideas, the Langlands program, is what reporting on the 2026 Riemann Hypothesis proof says it draws on.`,
      concepts: ['curves'],
      check: {
        prompt: r`What does the contradiction actually use about the Frey curve?`,
        options: [
          r`It is semistable (so Wiles applies) and Ribet shows it is not modular`,
          r`That it has no rational points`,
          r`That $p = 2$`,
        ],
        answer: 0,
        explain: r`Wiles: semistable implies modular. Ribet: the Frey curve is not modular. Both cannot hold, so the Fermat solution that built it cannot exist.`,
      },
    },
  ],
  takeaway: r`A Diophantine equation was solved by translating a solution into an object (an elliptic curve) and proving that object is too strange to exist. The bridge, modularity, is a special case of the Langlands program.`,
  sources: [
    { label: "Wiles's proof of Fermat's Last Theorem (Wikipedia)", url: 'https://en.wikipedia.org/wiki/Wiles%27s_proof_of_Fermat%27s_Last_Theorem' },
    { label: 'A. Wiles, Modular elliptic curves and Fermat\'s Last Theorem, Annals of Math. 141 (1995)', url: 'https://doi.org/10.2307/2118559' },
    { label: 'LMFDB: isogeny class 11.a (conductor 11), which contains y² + y = x³ − x²', url: 'https://www.lmfdb.org/EllipticCurve/Q/11/a/' },
  ],
};
