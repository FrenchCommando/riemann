import { svg, rect, text } from '../figures.js';

const r = String.raw;

// Tennenbaum's picture, drawn with p = 7, q = 5 (49 vs 50: nearly a solution).
// Big square side p = 280; q-squares side 200 in opposite corners.
const tennenbaum = svg('0 0 340 340', 'A p by p square with two q by q squares in opposite corners: they overlap in a central square of side 2q minus p and leave two corner squares of side p minus q uncovered',
  rect(30, 30, 280, 280, 'f-line'),
  rect(30, 110, 200, 200, 'f-sq2'), rect(110, 30, 200, 200, 'f-sq2'),
  rect(110, 110, 120, 120, 'f-sq'),
  rect(30, 30, 80, 80, 'f-tri'), rect(230, 230, 80, 80, 'f-tri'),
  text(170, 16, 'p'), text(16, 210, 'q'), text(324, 130, 'q'),
  text(170, 170, '2q − p', 'f-sm'), text(70, 70, 'p − q', 'f-sm'), text(270, 270, 'p − q', 'f-sm'));

export default {
  id: 'sqrt2',
  field: 'Number theory',
  title: r`$\sqrt2$ is irrational`,
  attribution: 'Pythagorean school, c. 5th century BC',
  statement: r`There are no integers $p, q$ with $q \ne 0$ such that $\left(\frac pq\right)^2 = 2$.`,
  prereqs: ['contradiction', 'parity', 'gcd'],
  intro: r`The first proof that some lengths can't be expressed as ratios of whole numbers. The pattern — assume a fraction in lowest terms, then show both parts share a factor — reappears all over number theory.`,
  steps: [
    {
      title: 'Assume the opposite, in lowest terms',
      claim: r`Suppose $\sqrt2 = \frac pq$ with integers $p, q$, $q \ne 0$, and $\gcd(p,q) = 1$.`,
      why: r`This is a proof by contradiction, so we assume $\sqrt 2$ is rational. Any fraction can be reduced to lowest terms, so we may also assume $p$ and $q$ share no common factor.`,
      detail: r`"Rational" means "equal to some fraction". If $\sqrt2 = \frac{a}{b}$ for some integers, let $g = \gcd(a, b)$ and set $p = a/g$, $q = b/g$. Same value, and now $p$, $q$ have no common factor bigger than 1.

The point of insisting on lowest terms: we're going to show $p$ and $q$ are **both even**. That's only a contradiction because we said in advance they share no factor.`,
      concepts: ['contradiction', 'gcd'],
      check: {
        prompt: r`Why is it legitimate to assume $\gcd(p,q) = 1$?`,
        options: [
          r`Because $\sqrt2$ is irrational`,
          r`Because any fraction can be reduced without changing its value`,
          r`Because $p$ and $q$ are primes`,
        ],
        answer: 1,
        explain: r`Reducing a fraction never changes the number it represents — so if $\sqrt 2$ has *any* fraction form, it has one in lowest terms. (The first option assumes what we're proving.)`,
      },
    },
    {
      title: 'Clear the square root',
      claim: r`Then $p^2 = 2q^2$.`,
      why: r`Square both sides of $\sqrt2 = p/q$ to get $2 = p^2/q^2$, then multiply by $q^2$.`,
      detail: r`$$\sqrt 2 = \frac pq \;\Longrightarrow\; 2 = \frac{p^2}{q^2} \;\Longrightarrow\; 2q^2 = p^2.$$
Now everything is in integers — no square roots — which is where divisibility arguments work.`,
      concepts: [],
    },
    {
      title: 'p must be even',
      claim: r`$p^2$ is even, so $p$ is even: $p = 2k$.`,
      why: r`$p^2 = 2q^2$ is a multiple of 2. If $p$ were odd, $p^2$ would be odd. So $p$ is even.`,
      detail: r`Odd numbers square to odd numbers: $(2m+1)^2 = 4m^2 + 4m + 1 = 2(2m^2 + 2m) + 1$.

So "$p$ odd ⇒ $p^2$ odd", whose contrapositive is "$p^2$ even ⇒ $p$ even". Since $p^2 = 2q^2$ is visibly even, $p = 2k$ for some integer $k$.`,
      concepts: ['parity'],
      check: {
        prompt: r`From $p^2 = 2q^2$ alone, can we conclude $p$ is even?`,
        options: [
          r`No — we only know $p^2$ is even`,
          r`Yes — an odd $p$ would make $p^2$ odd`,
          r`Yes — because $q$ is even`,
        ],
        answer: 1,
        explain: r`The contrapositive of "odd squared is odd" does it. We don't know anything about $q$ yet.`,
      },
    },
    {
      title: 'Then q must be even too',
      claim: r`Substituting, $q^2 = 2k^2$, so $q$ is even.`,
      why: r`$(2k)^2 = 2q^2$ gives $4k^2 = 2q^2$, i.e. $q^2 = 2k^2$. The same argument as before shows $q$ is even.`,
      detail: r`$$p = 2k \;\Rightarrow\; p^2 = 4k^2 = 2q^2 \;\Rightarrow\; q^2 = 2k^2.$$
This has exactly the shape of $p^2 = 2q^2$ with the roles changed, so the previous step applies verbatim: $q^2$ is even, hence $q$ is even.`,
      concepts: ['parity'],
    },
    {
      title: 'Contradiction',
      claim: r`$p$ and $q$ are both divisible by 2, contradicting $\gcd(p,q) = 1$. So $\sqrt2$ is irrational.`,
      figure: {
        svgs: [tennenbaum],
        caption: r`A second proof by picture (Tennenbaum). If $p^2 = 2q^2$, the two green $q \times q$ squares have total area $p^2$, so the doubly-covered middle must equal the two uncovered corners: $(2q - p)^2 = 2(p - q)^2$, a smaller solution. (Drawn with $p = 7$, $q = 5$, where $49$ nearly equals $50$.)`,
      },
      why: r`We assumed no common factor, and derived the common factor 2. The assumption that $\sqrt2$ is rational must be false.`,
      detail: r`Recap of the logic: (rational) ⇒ (lowest-terms fraction exists) ⇒ (both parts even) ⇒ (not lowest terms). A statement implying its own negation is false.

**The picture above is a second proof.** Take the solution with $p$ smallest. Since $1 \lt \frac pq \lt 2$, both $2q - p$ and $p - q$ are positive and $2q - p \lt p$. Two $q \times q$ squares placed in opposite corners of the $p \times p$ square have total area $2q^2 = p^2$, so the area counted twice (the middle square) equals the area missed (the two corners): $(2q - p)^2 = 2(p - q)^2$. That's a solution with a smaller first number, a contradiction. This is **infinite descent**, the method Fermat later uses for $x^4 + y^4 = z^2$.

**Generalisation:** the same proof shows $\sqrt n$ is irrational whenever $n$ is not a perfect square — replace "even" with "divisible by a prime $\ell$ that appears an odd number of times in $n$".`,
      concepts: ['contradiction'],
      check: {
        prompt: r`What exactly is contradicted?`,
        options: [r`That $q \ne 0$`, r`That $p$ and $q$ share no common factor`, r`That $p^2 = 2q^2$`],
        answer: 1,
        explain: r`We derived $2 \mid p$ and $2 \mid q$, which is incompatible with $\gcd(p,q) = 1$.`,
      },
    },
  ],
  takeaway: r`Pattern: assume a rational in lowest terms, push a divisibility fact through an equation, and show it lands on both numerator and denominator.`,
};
