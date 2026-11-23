const r = String.raw;

export default {
  id: 'eirrational',
  field: 'Analysis',
  title: r`$e$ is irrational`,
  attribution: 'Euler, 1737; this proof Fourier, 1815',
  statement: r`$e = \displaystyle\sum_{k \ge 0} \frac{1}{k!} = 1 + 1 + \frac12 + \frac16 + \frac1{24} + \cdots$ is not a ratio of integers.`,
  prereqs: ['contradiction', 'series'],
  intro: r`A template for irrationality proofs in analysis: if $e = p/q$, multiply by $q!$ to manufacture an integer, then show it lies strictly between 0 and 1.`,
  steps: [
    {
      title: 'Assume e is rational',
      claim: r`Suppose $e = \frac pq$ with integers $p, q \ge 1$.`,
      why: r`Proof by contradiction. $e \gt 0$, so we may take $p, q$ positive. We don't need lowest terms this time.`,
      detail: r`Compare with $\sqrt2$: there we needed lowest terms because the contradiction was "common factor". Here the contradiction will be an integer trapped strictly between 0 and 1, so any fraction for $e$ will do.`,
      concepts: ['contradiction'],
    },
    {
      title: 'Manufacture an integer',
      claim: r`$x = q!\,\Big(e - \displaystyle\sum_{k=0}^{q} \frac1{k!}\Big)$ is an integer.`,
      why: r`$q!\,e = p\,(q-1)!$ is an integer, and $q!/k!$ is an integer for every $k \le q$.`,
      detail: r`Split $x = q!\,e - \sum_{k=0}^q \frac{q!}{k!}$.

- $q!\,e = q! \cdot \frac pq = p \cdot (q-1)!$, an integer.
- For $k \le q$: $\frac{q!}{k!} = (k+1)(k+2)\cdots q$, a product of integers (equal to 1 when $k = q$).

A difference of integers is an integer.`,
      concepts: [],
      check: {
        prompt: r`Why is $\frac{q!}{k!}$ an integer when $k \le q$?`,
        options: [
          r`Because $q!$ is even`,
          r`It equals $(k+1)(k+2)\cdots q$: $k!$ cancels the first $k$ factors of $q!$`,
          r`It isn't always`,
        ],
        answer: 1,
        explain: r`$q! = 1 \cdot 2 \cdots k \cdot (k+1) \cdots q = k! \cdot (k+1)\cdots q$.`,
      },
    },
    {
      title: 'It is positive',
      claim: r`$x = \displaystyle\sum_{k \gt q} \frac{q!}{k!} \gt 0$.`,
      why: r`$e$ minus its first $q + 1$ terms is the tail of the series, a sum of positive terms.`,
      detail: r`$e - \sum_{k=0}^q \frac1{k!} = \sum_{k=q+1}^{\infty} \frac{1}{k!}$, and every term is positive, so $x \gt 0$.`,
      concepts: ['series'],
    },
    {
      title: 'It is less than 1',
      claim: r`$x \lt \displaystyle\sum_{j \ge 1} \frac{1}{(q+1)^j} = \frac1q \le 1$.`,
      why: r`$\frac{q!}{(q+j)!} = \frac{1}{(q+1)(q+2)\cdots(q+j)} \le \frac{1}{(q+1)^j}$, strictly for $j \ge 2$, and the right side is a geometric series.`,
      detail: r`Write the tail term by term:
$$x = \frac{1}{q+1} + \frac{1}{(q+1)(q+2)} + \frac{1}{(q+1)(q+2)(q+3)} + \cdots$$
Each denominator is at least $(q+1)^j$, strictly bigger from the second term on. So
$$x \lt \sum_{j\ge1} \Big(\frac{1}{q+1}\Big)^j = \frac{1/(q+1)}{1 - 1/(q+1)} = \frac1q.$$
And $q \ge 1$ gives $\frac1q \le 1$.`,
      concepts: ['series'],
      check: {
        prompt: r`What is $\displaystyle\sum_{j \ge 1} \frac{1}{(q+1)^j}$?`,
        options: [r`$\frac{1}{q+1}$`, r`$\frac1q$`, r`$\frac{q+1}{q}$`],
        answer: 1,
        explain: r`Geometric with first term and ratio $r = \frac1{q+1}$: $\frac{r}{1-r} = \frac{1/(q+1)}{q/(q+1)} = \frac1q$.`,
      },
    },
    {
      title: 'Conclude',
      claim: r`$x$ is an integer with $0 \lt x \lt 1$ — impossible. So $e$ is irrational.`,
      why: r`There is no integer strictly between 0 and 1.`,
      detail: r`The idea: rational numbers can't be approximated *too* well by fractions with small denominators, but the partial sums of $e$ approximate it extremely well (error about $1/(q+1)!$). Quantifying this tension is the heart of transcendence theory: Hermite (1873) proved $e$ is not even a root of any polynomial with integer coefficients, and Lindemann (1882) did the same for $\pi$.`,
      concepts: ['contradiction'],
    },
  ],
  takeaway: r`Multiply a hypothetical fraction by the right factor to get an integer, then squeeze it strictly between consecutive integers.`,
};
