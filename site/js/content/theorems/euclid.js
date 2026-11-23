const r = String.raw;

export default {
  id: 'euclid',
  title: 'There are infinitely many primes',
  attribution: 'Euclid, Elements IX.20, c. 300 BC',
  statement: r`For every finite list of primes, there is a prime not on it.`,
  prereqs: ['contradiction', 'primes', 'divisibility'],
  intro: r`Perhaps the most famous proof in mathematics. It is short, but one step is widely misremembered — watch for it.`,
  steps: [
    {
      title: 'Suppose the list is complete',
      claim: r`Assume there are only finitely many primes, $p_1, p_2, \dots, p_n$.`,
      why: r`Proof by contradiction: assume the opposite of the claim. The payoff is that we now hold a concrete list we can compute with.`,
      detail: r`The negation of "infinitely many primes" is "finitely many", and a finite set can be listed. There is at least one prime (2), so $n \ge 1$.`,
      concepts: ['contradiction'],
    },
    {
      title: 'Build a new number',
      claim: r`Let $N = p_1 p_2 \cdots p_n + 1$.`,
      why: r`$N$ is designed so that dividing it by any $p_i$ leaves remainder 1.`,
      detail: r`Multiply every prime on the list together, then add 1. For example, if the list were $2, 3, 5$, we'd get $N = 31$.

The "+1" is the whole trick: $p_1 \cdots p_n$ is divisible by every $p_i$, so $N$ is "one more than a multiple" of each.`,
      concepts: [],
    },
    {
      title: 'N has a prime divisor',
      claim: r`$N \gt 1$, so $N$ has some prime divisor $q$.`,
      why: r`Every integer greater than 1 has at least one prime divisor (its smallest divisor above 1 is prime).`,
      detail: r`$N \ge 2 + 1 = 3$. Take the smallest $d \gt 1$ with $d \mid N$; if $d$ weren't prime, a smaller divisor of $d$ would also divide $N$. So $q = d$ is prime.

Note: $q$ might be $N$ itself, or it might be smaller. We don't need to know which.`,
      concepts: ['primes'],
      check: {
        prompt: r`Must $N = p_1\cdots p_n + 1$ itself be prime?`,
        options: [
          r`Yes — that's the point of the proof`,
          r`No — e.g. $2\cdot3\cdot5\cdot7\cdot11\cdot13 + 1 = 30031 = 59 \cdot 509$`,
          r`Only if $n$ is even`,
        ],
        answer: 1,
        explain: r`A common misremembering. The proof never claims $N$ is prime — only that its prime factors (here 59 and 509) are missing from the list.`,
      },
    },
    {
      title: 'q is not on the list',
      claim: r`If $q = p_i$ for some $i$, then $q \mid 1$ — impossible.`,
      why: r`$p_i$ divides both $N$ and $p_1\cdots p_n$, so it divides their difference, which is 1.`,
      detail: r`Suppose $q = p_i$. Then:
- $q \mid N$ (by choice of $q$),
- $q \mid p_1 p_2 \cdots p_n$ (it's one of the factors).

A number dividing two integers divides their difference: $q \mid N - p_1\cdots p_n = 1$. But a prime is at least 2 and can't divide 1.`,
      concepts: ['divisibility'],
      check: {
        prompt: r`Which fact turns "$q \mid N$ and $q \mid p_1\cdots p_n$" into a contradiction?`,
        options: [r`$q \mid a,\ q \mid b \Rightarrow q \mid (a - b)$`, r`$q \mid ab \Rightarrow q \mid a$ or $q \mid b$`, r`Every number has a prime factor`],
        answer: 0,
        explain: r`The difference is $N - p_1\cdots p_n = 1$, and no prime divides 1.`,
      },
    },
    {
      title: 'Conclude',
      claim: r`$q$ is a prime not in the list — contradiction. So there are infinitely many primes.`,
      why: r`The list was supposed to contain every prime.`,
      detail: r`Read constructively, the proof is an algorithm: given any finite set of primes, the prime factors of (product + 1) are new primes. It never runs out.

Later in this course, Euler's proof gives a much stronger statement: the primes are dense enough that $\sum 1/p$ diverges.`,
      concepts: ['contradiction'],
    },
  ],
  takeaway: r`Construct an object (product + 1) that every candidate fails to divide.`,
};
