const r = String.raw;

export default {
  id: 'lagrange',
  field: 'Algebra',
  title: "Lagrange's theorem",
  attribution: 'Lagrange, 1771 (in germ); general form Jordan, 1861',
  statement: r`If $H$ is a subgroup of a finite group $G$, then $|H|$ divides $|G|$. Corollary (Euler): $a^{\varphi(n)} \equiv 1 \pmod n$ whenever $\gcd(a, n) = 1$.`,
  prereqs: ['groups', 'partitions'],
  requiresTheorems: ['fermat'],
  intro: r`The first theorem of group theory, and a second, more conceptual proof of Fermat's Little Theorem: $a^{p-1} \equiv 1$ because the order of $a$ must divide the size of the group.`,
  steps: [
    {
      title: 'Cosets',
      claim: r`For $g \in G$, define the coset $gH = \{gh : h \in H\}$.`,
      why: r`Shift the subgroup $H$ by $g$. The plan: cosets split $G$ into equal-sized pieces.`,
      detail: r`Example: $G = \mathbb Z/6$ under addition, $H = \{0, 3\}$. The cosets are $0 + H = \{0, 3\}$, $1 + H = \{1, 4\}$, $2 + H = \{2, 5\}$ — and $3 + H = \{3, 0\}$ is the first one again. Three cosets of size 2: $6 = 3 \cdot 2$.`,
      concepts: ['groups'],
      check: {
        prompt: r`In $\mathbb Z/6$ with $H = \{0, 3\}$, what is the coset $4 + H$?`,
        options: [r`$\{4, 7\}$`, r`$\{1, 4\}$`, r`$\{4, 5\}$`],
        answer: 1,
        explain: r`$4 + 0 = 4$ and $4 + 3 = 7 \equiv 1 \pmod 6$. It's the same coset as $1 + H$.`,
      },
    },
    {
      title: 'Every coset has |H| elements',
      claim: r`The map $h \mapsto gh$ is a bijection $H \to gH$.`,
      why: r`It's onto by definition of $gH$, and one-to-one by cancellation: $gh_1 = gh_2 \Rightarrow h_1 = h_2$.`,
      detail: r`Cancellation holds in any group: multiply $gh_1 = gh_2$ on the left by $g^{-1}$. So distinct elements of $H$ give distinct elements of $gH$, and $|gH| = |H|$.`,
      concepts: ['groups'],
    },
    {
      title: 'Cosets partition G',
      claim: r`Every $g$ lies in a coset, and two cosets that overlap are equal.`,
      why: r`$g = ge \in gH$. If $gh_1 = kh_2$, then $g = k h_2 h_1^{-1}$, so every $gh = k(h_2 h_1^{-1} h) \in kH$; thus $gH \subseteq kH$, and symmetrically $kH \subseteq gH$.`,
      detail: r`(1) $e \in H$ since $H$ is a subgroup, so $g = ge \in gH$.

(2) Suppose $x \in gH \cap kH$: $x = gh_1 = kh_2$. Solve for $g$: $g = kh_2h_1^{-1}$. Any element of $gH$ is
$$gh = k\,(h_2 h_1^{-1} h),$$
and $h_2 h_1^{-1} h \in H$ because $H$ is closed under products and inverses. So $gH \subseteq kH$. Swapping the roles of $g$ and $k$ gives the reverse inclusion.`,
      concepts: ['groups', 'partitions'],
      check: {
        prompt: r`Where does the proof use that $H$ is a subgroup (not just any subset)?`,
        options: [
          r`To know $e \in H$ and that $h_2 h_1^{-1} h \in H$`,
          r`To know $G$ is finite`,
          r`It doesn't`,
        ],
        answer: 0,
        explain: r`For an arbitrary subset, shifted copies can overlap without being equal, and the partition fails.`,
      },
    },
    {
      title: 'Count',
      claim: r`$|G| = m \cdot |H|$, where $m$ is the number of distinct cosets. So $|H|$ divides $|G|$.`,
      why: r`$G$ is partitioned into $m$ pieces, each of size $|H|$.`,
      detail: r`Pieces are disjoint, cover $G$, and all have $|H|$ elements, so $|G| = m|H|$. $\blacksquare$

The converse fails: the alternating group $A_4$ has 12 elements but no subgroup of order 6.`,
      concepts: ['partitions'],
      check: {
        prompt: r`Can a group with 10 elements have a subgroup with 4 elements?`,
        options: [r`Yes`, r`No`, r`Only if the group is commutative`],
        answer: 1,
        explain: r`$4 \nmid 10$, so Lagrange rules it out.`,
      },
    },
    {
      title: "Corollary: Euler's theorem",
      claim: r`If $\gcd(a, n) = 1$ then $a^{\varphi(n)} \equiv 1 \pmod n$. For $n = p$ prime: $a^{p-1} \equiv 1$.`,
      why: r`$a$ lies in the group $(\mathbb Z/n)^\times$ of size $\varphi(n)$. Its order $d$ is the size of the subgroup $\{1, a, \dots, a^{d-1}\}$, so $d \mid \varphi(n)$ and $a^{\varphi(n)} = (a^d)^{\varphi(n)/d} = 1$.`,
      detail: r`The powers of $a$ form a subgroup with exactly $d$ elements, where $d$ is the order of $a$. Lagrange gives $d \mid \varphi(n)$; write $\varphi(n) = dm$. Then
$$a^{\varphi(n)} = (a^d)^m \equiv 1^m = 1 \pmod n.$$

With $n = p$, $\varphi(p) = p - 1$: Fermat's Little Theorem, with no binomial coefficients in sight. Euler's version is what makes **RSA** decryption work.`,
      concepts: ['groups', 'modular'],
      check: {
        prompt: r`$\varphi(10) = 4$. What is $3^{4} \bmod 10$?`,
        options: [r`$1$`, r`$3$`, r`$9$`],
        answer: 0,
        explain: r`$3^4 = 81 \equiv 1 \pmod{10}$, as Euler's theorem predicts.`,
      },
    },
  ],
  takeaway: r`Partition into equal pieces, then count: divisibility falls out of a counting argument.`,
};
