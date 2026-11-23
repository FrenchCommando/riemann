const r = String.raw;

export default {
  id: 'cantor',
  title: 'The real numbers are uncountable',
  attribution: 'Georg Cantor, diagonal argument, 1891',
  statement: r`There is no list $r_1, r_2, r_3, \dots$ containing every real number.`,
  prereqs: ['contradiction', 'countability', 'decimals'],
  intro: r`Some infinities are bigger than others. The diagonal trick in this proof reappears in Gödel's incompleteness theorem and Turing's halting problem.`,
  steps: [
    {
      title: 'Reduce to (0, 1)',
      claim: r`It suffices to show the interval $(0, 1)$ is uncountable.`,
      why: r`A list of all reals would contain all of $(0,1)$; deleting the others would give a list of $(0,1)$.`,
      detail: r`If $\mathbb{R}$ could be listed as $r_1, r_2, \dots$, go through the list and keep only the entries in $(0,1)$. That's still a sequence, now listing every element of $(0,1)$. So "$(0,1)$ uncountable" implies "$\mathbb{R}$ uncountable".`,
      concepts: ['countability'],
    },
    {
      title: 'Assume a complete list',
      claim: r`Suppose $r_1, r_2, r_3, \dots$ lists every number in $(0, 1)$.`,
      why: r`Proof by contradiction: we'll build a number in $(0,1)$ that the list misses.`,
      detail: r`Uncountable means "every list misses something". So we take an arbitrary list and show it misses something — equivalently, assume a complete list exists and reach a contradiction.`,
      concepts: ['contradiction', 'countability'],
      check: {
        prompt: r`What will the rest of the proof need to produce?`,
        options: [
          r`A rational number not on the list`,
          r`A specific $x \in (0,1)$ with $x \ne r_n$ for every $n$`,
          r`A bijection from $\mathbb{N}$ to $(0,1)$`,
        ],
        answer: 1,
        explain: r`One element not on the list breaks completeness. (It needn't be irrational — it just needs to be missing.)`,
      },
    },
    {
      title: 'Write out the digits',
      claim: r`Write $r_n = 0.d_{n1}\, d_{n2}\, d_{n3} \dots$ in decimal.`,
      why: r`Arrange the list as an infinite grid: row $n$ holds the digits of $r_n$.`,
      detail: r`$$\begin{array}{l}
r_1 = 0.\,\mathbf{d_{11}}\, d_{12}\, d_{13} \dots \\
r_2 = 0.\,d_{21}\, \mathbf{d_{22}}\, d_{23} \dots \\
r_3 = 0.\,d_{31}\, d_{32}\, \mathbf{d_{33}} \dots
\end{array}$$
The bold digits form the **diagonal**. (Some numbers have two expansions, like $0.5 = 0.4999\ldots$; pick either — the next step is designed so it doesn't matter.)`,
      concepts: ['decimals'],
    },
    {
      title: 'Change every diagonal digit',
      claim: r`Define $x = 0.e_1 e_2 e_3 \dots$ where $e_n = 5$ if $d_{nn} \ne 5$, and $e_n = 4$ if $d_{nn} = 5$.`,
      why: r`$x$ differs from $r_n$ in the $n$-th digit, for every $n$.`,
      detail: r`Go down the diagonal and change each digit. The specific rule (use 4 and 5) only matters for the next step; any rule that always changes the digit and never uses 0 or 9 works.

$x$ is between $0.444\ldots$ and $0.555\ldots$, so certainly $x \in (0,1)$.`,
      concepts: [],
      check: {
        prompt: r`Why avoid the digits 0 and 9 when building $x$?`,
        options: [
          r`So that $x$ is irrational`,
          r`So that $x$ has only one decimal expansion — differing digits then really mean different numbers`,
          r`No reason; it's just a convention`,
        ],
        answer: 1,
        explain: r`Two expansions can represent the same number only via trailing 0s/9s ($0.1999\ldots = 0.2$). An expansion with no 0s or 9s is the number's only one.`,
      },
    },
    {
      title: 'x is not on the list',
      claim: r`$x \ne r_n$ for every $n$.`,
      why: r`$x$'s $n$-th digit differs from $r_n$'s $n$-th digit, and $x$ has a unique expansion.`,
      detail: r`Suppose $x = r_n$ for some $n$. $x$ has only one decimal expansion (no 0s or 9s), so $r_n$'s expansion — whichever one we wrote — must be that one, digit for digit. But their $n$-th digits are $e_n \ne d_{nn}$. Contradiction.

Note this is for a **fixed but arbitrary** $n$, so it holds for all $n$.`,
      concepts: ['decimals'],
    },
    {
      title: 'Conclude',
      claim: r`The list misses $x \in (0,1)$, contradicting completeness. So $(0,1)$, and hence $\mathbb{R}$, is uncountable.`,
      why: r`We assumed the list was complete and found an element not on it.`,
      detail: r`**Why doesn't this prove $\mathbb{Q}$ is uncountable?** Run the argument on a list of rationals: you get an $x$ missing from the list, but nothing forces $x$ to be rational — so no contradiction. The proof works for $\mathbb{R}$ because *every* digit sequence is a real number.`,
      concepts: ['contradiction', 'countability'],
      check: {
        prompt: r`Apply the diagonal argument to a complete list of the rationals in $(0,1)$. What goes wrong?`,
        options: [
          r`Nothing — $\mathbb{Q}$ is uncountable too`,
          r`The diagonal number $x$ need not be rational, so it's allowed to be missing`,
          r`Rationals don't have decimal expansions`,
        ],
        answer: 1,
        explain: r`The constructed $x$ is real but typically irrational, so missing it doesn't contradict a list of rationals. $\mathbb{Q}$ is countable.`,
      },
    },
  ],
  takeaway: r`Diagonalisation: given any list, build an object that disagrees with the $n$-th entry in the $n$-th place.`,
};
