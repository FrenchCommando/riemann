import { svg, grid, text } from '../figures.js';

const r = String.raw;

// Row = program, column = input: does program i halt on input j? (sample values)
const H = [
  ['halts', 'loops', 'halts', 'halts', 'loops'],
  ['loops', 'loops', 'halts', 'loops', 'halts'],
  ['halts', 'halts', 'halts', 'loops', 'loops'],
  ['halts', 'loops', 'loops', 'loops', 'halts'],
  ['loops', 'halts', 'halts', 'halts', 'halts'],
];
const sym = (v) => (v === 'halts' ? '✓' : '∞');
const S = 40;
const haltTable = svg('0 0 320 300', 'A table: row i is program P i, column j is input P j, each entry says whether P i halts on P j. The diagonal is highlighted, and the program D below does the opposite of every diagonal entry',
  ...[1, 2, 3, 4, 5].map((j) => text(80 + S * (j - 1) + S / 2, 24, `P${'₁₂₃₄₅'[j - 1]}`, 'f-sm')),
  ...[1, 2, 3, 4, 5].map((i) => text(50, 40 + S * (i - 1) + S / 2, `P${'₁₂₃₄₅'[i - 1]}`, 'f-sm')),
  grid(H.map((row) => row.map(sym)), 80, 40, S, (i, j) => (i === j ? 'f-sq' : '')),
  text(50, 250 + S / 2, 'D', 'f-sm f-acc'),
  grid([H.map((row, i) => (row[i] === 'halts' ? '∞' : '✓'))], 80, 250, S, () => 'f-sq2', () => 'f-acc'));

export default {
  id: 'halting',
  field: 'Sets & logic',
  title: 'The halting problem is undecidable',
  attribution: 'Alan Turing, 1936',
  statement: r`There is no program $H$ that, given any program $P$ and input $x$, always halts and correctly answers whether $P$ halts on $x$.`,
  prereqs: ['contradiction', 'programs'],
  requiresTheorems: ['cantorpower'],
  intro: r`A hard limit on what computers can ever do, proved before electronic computers existed. It is Cantor's diagonal argument with "programs" in place of "sets".`,
  steps: [
    {
      title: 'Assume a halting decider',
      claim: r`Suppose $H(P, x)$ always halts, returning **yes** if $P$ halts on input $x$ and **no** otherwise.`,
      why: r`Proof by contradiction. Note $H$ must answer for *every* program and input, and must itself always stop.`,
      detail: r`"Just run $P$ on $x$ and see" is not a valid $H$: if $P$ runs forever, the simulation runs forever and never says **no**. The question is whether some cleverer program could always answer.`,
      concepts: ['contradiction', 'programs'],
      check: {
        prompt: r`Why isn't "simulate $P$ on $x$" a halting decider?`,
        options: [
          r`Simulation is too slow`,
          r`If $P$ never halts, the simulation never halts either, so it never answers **no**`,
          r`Programs can't simulate other programs`,
        ],
        answer: 1,
        explain: r`It answers **yes** correctly but never answers **no** — and a decider must always halt with an answer.`,
      },
    },
    {
      title: 'Build the contrarian program D',
      claim: r`Define $D(P)$: run $H(P, P)$; if it says **yes**, loop forever; if **no**, halt.`,
      figure: {
        svgs: [haltTable],
        caption: r`Row $P_i$, column $P_j$: does $P_i$ halt on input $P_j$? (✓ halts, $\infty$ loops.) $D$ reads the diagonal through $H$ and does the opposite, so its row differs from every row $P_i$ at column $P_i$. But $D$ is a program, so it would have to be one of the rows.`,
      },
      why: r`$D$ is a legitimate program: it calls $H$ as a subroutine and then does the opposite of what $H$ predicts about $P$ run on its own text.`,
      detail: r`In pseudocode:
$$\textbf{D}(P):\quad \text{if } H(P, P) = \text{yes then loop forever, else halt.}$$
Feeding $P$ its own source as input is allowed — programs are just strings. This is the diagonal: we look at the entry "$P$ on input $P$" and flip it.`,
      concepts: ['programs'],
    },
    {
      title: 'Run D on itself',
      claim: r`$D(D)$ halts $\iff H(D, D) = \text{no} \iff D(D)$ does not halt. Contradiction.`,
      why: r`The first equivalence is how $D$ is built; the second is $H$ being correct about $D$ on input $D$.`,
      detail: r`Two cases:
- If $D(D)$ halts, then $H(D,D)$ correctly says **yes**, so $D$ loops forever on $D$. Contradiction.
- If $D(D)$ runs forever, $H(D,D)$ says **no**, so $D$ halts on $D$. Contradiction.

So $H$ cannot exist. $\blacksquare$`,
      concepts: ['contradiction'],
      check: {
        prompt: r`This mirrors Cantor's theorem. What plays the role of the diagonal set $D = \{x : x \notin f(x)\}$?`,
        options: [
          r`The program $H$`,
          r`The program $D$, which halts on $P$ exactly when $P$ doesn't halt on $P$`,
          r`The list of all programs`,
        ],
        answer: 1,
        explain: r`Both disagree with entry $x$ at position $x$: $D$ halts on input $P$ iff $P$ does not halt on input $P$.`,
      },
    },
    {
      title: 'Consequences',
      claim: r`Many questions about programs are undecidable.`,
      why: r`If a decider for them existed, you could use it to build $H$.`,
      detail: r`**Reductions:** to show a problem is undecidable, show that solving it would solve halting. For example, "does $P$ ever print 'hello'?" is undecidable: modify $P$ to print 'hello' right before it would halt.

**Rice's theorem** generalises this: every non-trivial question about what a program computes is undecidable. That's why perfect virus scanners and perfect bug finders cannot exist — real tools must sometimes say "don't know" or be wrong.

It also connects to logic: Gödel's incompleteness theorem can be derived from the undecidability of halting.`,
      concepts: ['programs'],
    },
  ],
  takeaway: r`To rule out a universal decider, build a program that asks the decider about itself and does the opposite.`,
};
