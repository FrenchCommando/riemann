// Concept graph. Each concept: prerequisites, a primer shown when the learner is
// weak on it, and one diagnostic/practice question.
// Text format: paragraphs separated by blank lines; inline $math$, display $$math$$.
// Inside math use \lt / \gt instead of < / > (content is injected as HTML).

const r = String.raw;

export const concepts = [
  {
    id: 'implication',
    name: 'Implications & contrapositive',
    prereqs: [],
    summary: 'What "if P then Q" commits you to, and its equivalent contrapositive.',
    primer: r`A statement "if $P$ then $Q$" ($P \Rightarrow Q$) only fails when $P$ is true and $Q$ is false.

Its **contrapositive** "if not $Q$ then not $P$" is logically equivalent — proving one proves the other. The **converse** "if $Q$ then $P$" is a different statement and may be false.

Example: "if $n$ is divisible by 4 then $n$ is even" is true; its converse "if $n$ is even then $n$ is divisible by 4" is false ($n = 6$).`,
    q: {
      prompt: r`What is the contrapositive of "if $n^2$ is even, then $n$ is even"?`,
      options: [
        r`If $n$ is even, then $n^2$ is even.`,
        r`If $n$ is odd, then $n^2$ is odd.`,
        r`If $n^2$ is odd, then $n$ is odd.`,
      ],
      answer: 1,
      explain: r`Negate both sides and swap them: "not ($n$ even)" ⇒ "not ($n^2$ even)", i.e. $n$ odd ⇒ $n^2$ odd. The first option is the converse.`,
    },
  },
  {
    id: 'contradiction',
    name: 'Proof by contradiction',
    prereqs: ['implication'],
    summary: 'Assume the statement is false and derive something impossible.',
    primer: r`To prove $S$, assume $\neg S$ and reason until you reach a statement that is certainly false (like $1 = 0$, or "$q$ is both even and odd", or something contradicting an earlier assumption). Since valid reasoning from true premises can't produce a falsehood, the assumption $\neg S$ must be false — so $S$ is true.

The skill is choosing the assumption so that it gives you something concrete to work with: "suppose there are only finitely many primes $p_1, \dots, p_n$" hands you a list you can build with.`,
    q: {
      prompt: r`To prove "there is no largest integer" by contradiction, what do you assume?`,
      options: [
        r`Every integer has a larger integer.`,
        r`There is some integer $N$ that is at least as large as every integer.`,
        r`There is no integer at all.`,
      ],
      answer: 1,
      explain: r`You assume the negation of the claim: a largest integer $N$ exists. Then $N + 1 \gt N$ contradicts it.`,
    },
  },
  {
    id: 'divisibility',
    name: 'Divisibility & division with remainder',
    prereqs: [],
    summary: 'a | b, its basic rules, and the division algorithm.',
    primer: r`$a \mid b$ ("$a$ divides $b$") means $b = ak$ for some integer $k$.

Key rule: if $a \mid b$ and $a \mid c$, then $a \mid (b \pm c)$, and more generally $a \mid (bx + cy)$ for any integers $x, y$. Proof: $b = ak$, $c = al$ gives $bx + cy = a(kx + ly)$.

**Division algorithm:** for integers $a$ and $d \gt 0$ there are unique integers $q, r$ with $a = qd + r$ and $0 \le r \lt d$.`,
    q: {
      prompt: r`If $d \mid 84$ and $d \mid 85$, what must be true?`,
      options: [r`$d \mid 169$ only`, r`$d = 1$ or $d = -1$`, r`$d \mid 7$`],
      answer: 1,
      explain: r`$d$ divides the difference $85 - 84 = 1$, so $d = \pm 1$. (It also divides 169, but that's weaker.)`,
    },
  },
  {
    id: 'parity',
    name: 'Even and odd',
    prereqs: ['divisibility'],
    summary: 'Even means n = 2k, odd means n = 2k + 1; how parity behaves under squaring.',
    primer: r`$n$ is **even** if $n = 2k$, **odd** if $n = 2k + 1$, for some integer $k$. Every integer is exactly one of these (division by 2 leaves remainder 0 or 1).

Squaring preserves parity: $(2k)^2 = 2(2k^2)$ is even and $(2k+1)^2 = 2(2k^2 + 2k) + 1$ is odd. So by contrapositive: **if $n^2$ is even, $n$ is even.**`,
    q: {
      prompt: r`Suppose $m^2$ is even. Which is correct?`,
      options: [r`$m$ could be odd`, r`$m$ is even, and $m^2$ is divisible by 4`, r`$m$ is even, but $m^2$ need not be divisible by 4`],
      answer: 1,
      explain: r`If $m$ were odd, $m^2$ would be odd. So $m = 2k$ and $m^2 = 4k^2$.`,
    },
  },
  {
    id: 'primes',
    name: 'Primes & prime divisors',
    prereqs: ['divisibility'],
    summary: 'Definition of a prime; every integer > 1 has a prime divisor.',
    primer: r`An integer $p \gt 1$ is **prime** if its only positive divisors are $1$ and $p$.

**Fact:** every integer $n \gt 1$ has at least one prime divisor. Take the smallest divisor $d \gt 1$ of $n$. If $d$ had a divisor $e$ with $1 \lt e \lt d$, then $e$ would also divide $n$ and be smaller than $d$ — impossible. So $d$ is prime.`,
    q: {
      prompt: r`What is the smallest prime divisor of $91$?`,
      options: [r`$91$ is prime`, r`$3$`, r`$7$`, r`$13$`],
      answer: 2,
      explain: r`$91 = 7 \times 13$. It isn't divisible by 2, 3 or 5.`,
    },
  },
  {
    id: 'gcd',
    name: 'GCD & lowest terms',
    prereqs: ['divisibility'],
    summary: 'Greatest common divisor; every fraction reduces to lowest terms.',
    primer: r`$\gcd(a, b)$ is the largest integer dividing both $a$ and $b$. $a$ and $b$ are **coprime** if $\gcd(a,b) = 1$.

Every fraction $p/q$ can be reduced to **lowest terms**: divide top and bottom by $g = \gcd(p,q)$. The result $p'/q'$ has the same value and $\gcd(p', q') = 1$ — in particular, $p'$ and $q'$ are not both even.`,
    q: {
      prompt: r`Why can any rational number be written as $p/q$ with $\gcd(p,q) = 1$?`,
      options: [
        r`Because rational numbers are defined that way`,
        r`Divide numerator and denominator by their gcd; the value doesn't change`,
        r`Only if $q$ is prime`,
      ],
      answer: 1,
      explain: r`$\frac{p}{q} = \frac{p/g}{q/g}$ with $g = \gcd(p,q)$, and $p/g$, $q/g$ share no common factor above 1.`,
    },
  },
  {
    id: 'induction',
    name: 'Induction & well-ordering',
    prereqs: ['implication'],
    summary: 'Ordinary and strong induction; every non-empty set of naturals has a least element.',
    primer: r`**Induction:** if $P(0)$ holds and $P(n) \Rightarrow P(n+1)$ for every $n$, then $P(n)$ holds for all $n \ge 0$.

**Strong induction:** if $P(n)$ follows from "$P(k)$ for all $k \lt n$", then $P(n)$ holds for all $n$. Useful when $n$ breaks into smaller pieces that aren't just $n-1$.

**Well-ordering** (equivalent): every non-empty set of positive integers has a smallest element. This powers "minimal counterexample" arguments.`,
    q: {
      prompt: r`You want to prove every integer $n \ge 2$ is a product of primes. Which induction fits?`,
      options: [
        r`Ordinary induction: from $n$ to $n+1$`,
        r`Strong induction: if $n = ab$, use the result for $a$ and $b$, both smaller than $n$`,
        r`Induction doesn't apply to primes`,
      ],
      answer: 1,
      explain: r`Knowing $n$ factors tells you nothing about $n+1$. But a composite $n = ab$ splits into smaller numbers — exactly what strong induction lets you assume.`,
    },
  },
  {
    id: 'modular',
    name: 'Modular arithmetic',
    prereqs: ['divisibility'],
    summary: 'a ≡ b (mod n), and that congruences add and multiply.',
    primer: r`$a \equiv b \pmod n$ means $n \mid (a - b)$: $a$ and $b$ leave the same remainder on division by $n$.

Congruences respect $+$ and $\times$: if $a \equiv a'$ and $b \equiv b'$, then $a + b \equiv a' + b'$ and $ab \equiv a'b'$. So you can reduce at every step: $7 \cdot 8 \equiv 2 \cdot 3 = 6 \equiv 1 \pmod 5$.

**Cancellation:** if $ax \equiv ay \pmod p$ with $p$ prime and $p \nmid a$, then $x \equiv y$. (Division by $a$ is allowed when $\gcd(a, p) = 1$.)`,
    q: {
      prompt: r`What is $3^4 \bmod 5$?`,
      options: [r`$1$`, r`$2$`, r`$4$`, r`$81$`],
      answer: 0,
      explain: r`$3^2 = 9 \equiv 4 \equiv -1$, so $3^4 \equiv (-1)^2 = 1 \pmod 5$. Check: $81 = 16 \cdot 5 + 1$.`,
    },
  },
  {
    id: 'binomial',
    name: 'Binomial theorem',
    prereqs: ['primes'],
    summary: 'Expanding (a + b)^n with binomial coefficients.',
    primer: r`$$(a+b)^n = \sum_{k=0}^{n} \binom{n}{k} a^k b^{n-k}, \qquad \binom{n}{k} = \frac{n!}{k!\,(n-k)!}.$$

$\binom{n}{k}$ counts the ways to pick which $k$ of the $n$ factors $(a+b)$ contribute an $a$. It is always an integer. The two end terms are $a^n$ and $b^n$ (coefficient 1).`,
    q: {
      prompt: r`What is the coefficient of $x^2$ in $(x+1)^5$?`,
      options: [r`$5$`, r`$10$`, r`$20$`],
      answer: 1,
      explain: r`$\binom{5}{2} = \frac{5 \cdot 4}{2} = 10$.`,
    },
  },
  {
    id: 'functions',
    name: 'Injections, surjections, bijections',
    prereqs: [],
    summary: 'One-to-one, onto, and the pairing that defines "same size".',
    primer: r`A function $f: A \to B$ is **injective** if different inputs give different outputs, **surjective** if every $b \in B$ is hit by some input, and **bijective** if both — a perfect pairing of $A$ with $B$.

Two sets have the **same size** (cardinality) when a bijection exists between them. This works for infinite sets too, where it gives surprises: $n \mapsto 2n$ is a bijection from $\mathbb{N}$ to the even numbers.`,
    q: {
      prompt: r`Which property fails for $f(n) = n^2$ from $\mathbb{Z}$ to $\mathbb{Z}$?`,
      options: [r`Only injectivity`, r`Only surjectivity`, r`Both`],
      answer: 2,
      explain: r`$f(2) = f(-2)$ kills injectivity, and $3$ is never hit, so it's not surjective either.`,
    },
  },
  {
    id: 'countability',
    name: 'Countable sets',
    prereqs: ['functions'],
    summary: 'A set is countable if its elements can be listed as a sequence.',
    primer: r`A set is **countable** if it is finite or in bijection with $\mathbb{N} = \{1, 2, 3, \dots\}$ — equivalently, its elements can be listed $a_1, a_2, a_3, \dots$ with every element appearing somewhere.

$\mathbb{Z}$ is countable: $0, 1, -1, 2, -2, \dots$. Even $\mathbb{Q}$ is: list fractions $p/q$ by increasing $|p| + q$. Being "dense" doesn't make a set bigger.`,
    q: {
      prompt: r`To show a set $S$ is **uncountable**, what must you show?`,
      options: [
        r`$S$ is infinite`,
        r`Every list $a_1, a_2, \dots$ of elements of $S$ misses some element of $S$`,
        r`$S$ contains $\mathbb{Q}$`,
      ],
      answer: 1,
      explain: r`Uncountable means no listing can be complete. Being infinite isn't enough ($\mathbb{N}$ is infinite), and containing $\mathbb{Q}$ isn't either ($\mathbb{Q}$ itself is countable).`,
    },
  },
  {
    id: 'decimals',
    name: 'Decimal expansions',
    prereqs: [],
    summary: 'Every real in (0,1) has a decimal expansion — unique except for trailing 9s.',
    primer: r`Every $x \in (0, 1)$ can be written $x = 0.d_1 d_2 d_3 \dots = \sum_k d_k 10^{-k}$ with digits $d_k \in \{0, \dots, 9\}$.

The expansion is **unique, except** for numbers with a terminating expansion, which also have one ending in all 9s: $0.5000\ldots = 0.4999\ldots$. A number whose expansion uses no 0s and no 9s has only one expansion.`,
    q: {
      prompt: r`Two decimal expansions differ in the 3rd digit. Are the numbers necessarily different?`,
      options: [r`Yes, always`, r`Not necessarily — e.g. $0.12999\ldots$ and $0.13000\ldots$`, r`Only if the digits differ by more than 1`],
      answer: 1,
      explain: r`$0.12999\ldots = 0.13$. Different expansions can name the same number — only via trailing 9s vs trailing 0s.`,
    },
  },
  {
    id: 'series',
    name: 'Series & the geometric series',
    prereqs: [],
    summary: 'Convergence of infinite sums; 1 + x + x² + … = 1/(1−x).',
    primer: r`An infinite sum $\sum a_k$ **converges** to $S$ if its partial sums $a_1 + \dots + a_n$ approach $S$; otherwise it **diverges**.

**Geometric series:** for $|x| \lt 1$,
$$1 + x + x^2 + \cdots = \frac{1}{1 - x}.$$
(The partial sum is $\frac{1 - x^{n+1}}{1-x}$ and $x^{n+1} \to 0$.)

**Comparison:** if $0 \le a_k \le b_k$ and $\sum b_k$ converges, so does $\sum a_k$, with a smaller total.`,
    q: {
      prompt: r`What is $1 + \tfrac13 + \tfrac19 + \tfrac1{27} + \cdots$?`,
      options: [r`$\tfrac43$`, r`$\tfrac32$`, r`$2$`, r`It diverges`],
      answer: 1,
      explain: r`Geometric with $x = \tfrac13$: $\frac{1}{1 - 1/3} = \frac32$.`,
    },
  },
  {
    id: 'harmonic',
    name: 'Harmonic series & Σ1/n²',
    prereqs: ['series'],
    summary: 'Σ 1/n diverges; Σ 1/n² converges.',
    primer: r`**$\sum 1/n$ diverges.** Group terms: $1 + \tfrac12 + (\tfrac13 + \tfrac14) + (\tfrac15 + \cdots + \tfrac18) + \cdots$. Each group is at least $\tfrac12$, and there are infinitely many groups.

**$\sum 1/n^2$ converges, and is less than 2.** For $n \ge 2$, $\frac{1}{n^2} \lt \frac{1}{n(n-1)} = \frac{1}{n-1} - \frac1n$, which telescopes:
$$\sum_{n \ge 1} \frac{1}{n^2} \lt 1 + \sum_{n\ge2}\Big(\frac{1}{n-1} - \frac1n\Big) = 1 + 1 = 2.$$`,
    q: {
      prompt: r`Which is true?`,
      options: [r`Both $\sum \frac1n$ and $\sum \frac1{n^2}$ converge`, r`$\sum \frac1n$ diverges, $\sum \frac1{n^2}$ converges`, r`Both diverge`],
      answer: 1,
      explain: r`Terms going to zero isn't enough: $\sum\frac1n$ diverges (slowly, like $\log N$), while $\sum \frac1{n^2}$ converges (to $\pi^2/6$).`,
    },
  },
  {
    id: 'logarithm',
    name: 'Logarithms',
    prereqs: ['series'],
    summary: 'log turns products into sums; the series for −log(1−x).',
    primer: r`The natural log satisfies $\log(ab) = \log a + \log b$, so it turns a **product into a sum**: $\log \prod a_i = \sum \log a_i$. It is increasing, and $\log x \to \infty$ as $x \to \infty$.

For $|x| \lt 1$:
$$-\log(1 - x) = x + \frac{x^2}{2} + \frac{x^3}{3} + \cdots$$
(integrate the geometric series $\frac{1}{1-t} = 1 + t + t^2 + \cdots$ from $0$ to $x$).`,
    q: {
      prompt: r`If a product $\prod_{i=1}^{n} a_i$ of numbers $a_i \gt 0$ tends to $\infty$ as $n \to \infty$, what about $\sum_{i=1}^n \log a_i$?`,
      options: [r`It also tends to $\infty$`, r`It converges`, r`Nothing can be said`],
      answer: 0,
      explain: r`The sum *is* $\log$ of the product, and $\log$ of something going to $\infty$ goes to $\infty$.`,
    },
  },
];

export const conceptById = Object.fromEntries(concepts.map((c) => [c.id, c]));
