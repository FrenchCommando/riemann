const r = String.raw;

export default {
  id: 'cantorpower',
  field: 'Sets & logic',
  title: "Cantor's theorem: no set is as big as its power set",
  attribution: 'Georg Cantor, 1891',
  statement: r`For every set $S$, there is no surjection $f : S \to \mathcal P(S)$. Hence $|\mathcal P(S)| \gt |S|$.`,
  prereqs: ['contradiction', 'functions', 'powerset'],
  requiresTheorems: ['cantor'],
  intro: r`The diagonal argument, stripped to its essence — no decimals, no lists, five lines. It shows there is no largest infinity.`,
  steps: [
    {
      title: 'Assume a surjection',
      claim: r`Suppose $f : S \to \mathcal P(S)$ is onto: every subset of $S$ equals $f(x)$ for some $x$.`,
      why: r`Proof by contradiction. We'll build a subset of $S$ that $f$ misses.`,
      detail: r`$f$ assigns to each element $x \in S$ a subset $f(x) \subseteq S$. "Onto" means every subset is hit. If we can name one subset that is not $f(x)$ for any $x$, we're done.`,
      concepts: ['contradiction', 'functions'],
    },
    {
      title: 'The diagonal set',
      claim: r`Let $D = \{x \in S : x \notin f(x)\}$.`,
      why: r`$D$ collects the elements that are not members of their own image. It is a perfectly good subset of $S$.`,
      detail: r`For each $x$ ask one yes/no question: is $x$ in the set $f(x)$? Put $x$ into $D$ exactly when the answer is **no**.

This is the diagonal again: think of a table with rows $x$ and columns $y$, entry "is $y \in f(x)$?". $D$ is the row obtained by flipping every diagonal entry.`,
      concepts: ['powerset'],
      check: {
        prompt: r`Let $S = \{1,2,3\}$ with $f(1) = \{1,2\}$, $f(2) = \varnothing$, $f(3) = \{1,3\}$. What is $D$?`,
        options: [r`$\{2\}$`, r`$\{1, 3\}$`, r`$\varnothing$`],
        answer: 0,
        explain: r`$1 \in f(1)$: out. $2 \notin f(2) = \varnothing$: in. $3 \in f(3)$: out. So $D = \{2\}$ — and indeed no $f(x)$ equals $\{2\}$.`,
      },
    },
    {
      title: 'D must be hit',
      claim: r`Since $f$ is onto, $D = f(d)$ for some $d \in S$.`,
      why: r`$D$ is a subset of $S$, and we assumed every subset is in the image.`,
      detail: r`This is the only place surjectivity is used. Now ask the diagonal question about $d$ itself.`,
      concepts: ['functions'],
    },
    {
      title: 'Is d in D?',
      claim: r`$d \in D \iff d \notin f(d) \iff d \notin D$. Contradiction.`,
      why: r`The first equivalence is the definition of $D$; the second uses $f(d) = D$. A statement equivalent to its own negation is impossible.`,
      detail: r`Two cases:
- If $d \in D$, then by definition of $D$, $d \notin f(d) = D$. Contradiction.
- If $d \notin D$, then $d \notin f(d)$, so $d$ meets the condition for $D$: $d \in D$. Contradiction.

Either way we're stuck, so no such $d$ exists, and $f$ is not onto. $\blacksquare$`,
      concepts: ['contradiction'],
    },
    {
      title: 'Strictly bigger',
      claim: r`$|S| \lt |\mathcal P(S)|$, so $|\mathbb N| \lt |\mathcal P(\mathbb N)| \lt |\mathcal P(\mathcal P(\mathbb N))| \lt \cdots$`,
      why: r`$x \mapsto \{x\}$ is an injection $S \to \mathcal P(S)$, so $\mathcal P(S)$ is at least as big; Cantor's theorem rules out equality.`,
      detail: r`Iterating gives an endless tower of infinite sizes. $\mathcal P(\mathbb N)$ has the same size as $\mathbb R$ (a subset of $\mathbb N$ is a 0/1 sequence, i.e. a binary expansion), which recovers the previous theorem.

Apply the argument to "the set of all sets" and you get **Russell's paradox**: $D = \{x : x \notin x\}$. That's why modern set theory forbids such a set.`,
      concepts: ['functions', 'powerset'],
      check: {
        prompt: r`Which map shows $|S| \le |\mathcal P(S)|$?`,
        options: [r`$x \mapsto \{x\}$`, r`$x \mapsto S$`, r`$x \mapsto \varnothing$`],
        answer: 0,
        explain: r`Different $x$ give different singletons, so $x \mapsto \{x\}$ is injective. The other two send everything to one set.`,
      },
    },
  ],
  takeaway: r`Diagonalisation in one line: $D = \{x : x \notin f(x)\}$ disagrees with every $f(x)$ about $x$.`,
};
