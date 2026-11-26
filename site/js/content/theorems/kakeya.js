import { svg, poly, path, text } from '../figures.js';

const r = String.raw;

// Wolff's hairbrush: a stem tube and bristles crossing it at different points and angles.
const tube = (cx, cy, th, len, w) => {
  const [c, s] = [Math.cos(th), Math.sin(th)], [hx, hy] = [(c * len) / 2, (s * len) / 2], [wx, wy] = [(-s * w) / 2, (c * w) / 2];
  return [[cx - hx - wx, cy - hy - wy], [cx + hx - wx, cy + hy - wy], [cx + hx + wx, cy + hy + wy], [cx - hx + wx, cy - hy + wy]]
    .map(([x, y]) => `${(160 + x).toFixed(1)},${(105 - y).toFixed(1)}`).join(' ');
};
const bristles = [[-110, 1.2], [-88, 2.1], [-66, 1.5], [-44, 2.5], [-22, 1.0], [0, 1.9], [22, 2.7], [44, 1.35], [66, 2.2], [88, 1.7], [110, 0.85]];
const brush = svg('0 0 360 210', 'A hairbrush: one long horizontal tube, the stem, and eleven thinner tubes, the bristles, each crossing the stem at a different point and a different angle',
  ...bristles.map(([x, th]) => poly(tube(x, 0, th, 150, 9), 'f-sliver')),
  poly(tube(0, 0, 0, 290, 12), 'f-sq'),
  text(312, 105, 'stem', 'f-pt f-start'));

// Tubes through one point in space, drawn in an orthographic view. Bush: the
// directions spread over a hemisphere (a Fibonacci spiral). Plany: the
// directions all within a few degrees of one tilted plane.
const view = ([x, y, z]) => {
  const [a, b] = [0.6, 0.35]; // turn about the vertical axis, then tilt toward the viewer
  const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
  return [x1, y * Math.cos(b) - z1 * Math.sin(b)];
};
const through = (dirs, extra) => svg('0 0 240 220', extra.label,
  extra.plane ?? '',
  ...dirs.map((d) => {
    const [x, y] = view(d), L = extra.len ?? 95;
    return path(`M${(120 - L * x).toFixed(1)} ${(110 + L * y).toFixed(1)}L${(120 + L * x).toFixed(1)} ${(110 - L * y).toFixed(1)}`, 'f-tube');
  }),
  `<circle cx="120" cy="110" r="4" class="f-d0"/>`);
const GOLD = Math.PI * (3 - Math.sqrt(5));
const bushDirs = Array.from({ length: 16 }, (_, i) => {
  const y = 1 - (i + 0.5) / 16, r = Math.sqrt(1 - y * y);
  return [r * Math.cos(GOLD * i), y, r * Math.sin(GOLD * i)];
});
const bush3 = through(bushDirs, { label: 'A bush: sixteen tubes through one point, in directions spread out over all of space, like the spines of a sea urchin' });
// A plane through the point, tilted by TILT from horizontal, spanned by e1, e2 with normal nrm.
const TILT = 0.12;
const e1 = [1, 0, 0], e2 = [0, Math.sin(TILT), -Math.cos(TILT)], nrm = [0, Math.cos(TILT), Math.sin(TILT)];
const inPlane = (t, lift) => e1.map((_, k) => Math.cos(t) * e1[k] + Math.sin(t) * e2[k] + lift * nrm[k]);
const planyDirs = Array.from({ length: 12 }, (_, i) => inPlane((Math.PI * i) / 12, 0.05 * Math.sin(3 * i)));
const corner = (s, t) => view(e1.map((_, k) => s * e1[k] + t * e2[k])).map((v, k) => (k ? 110 - 82 * v : 120 + 82 * v).toFixed(1)).join(',');
const plany3 = through(planyDirs, {
  label: 'A plany configuration: twelve tubes through one point, all lying close to one nearly horizontal plane, drawn as a dashed parallelogram seen at a slant',
  plane: poly([corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)].join(' '), 'f-ghost'),
  len: 80,
});

export default {
  id: 'kakeya',
  kind: 'roadmap',
  field: 'Frontiers',
  title: 'The Kakeya conjecture',
  attribution: 'Sōichi Kakeya, 1917; the conjecture in n dimensions, from Davies 1971; proved in 3D by Hong Wang and Joshua Zahl, 2025',
  statement: r`A set in $\mathbb R^n$ that contains a unit segment in every direction has Minkowski and Hausdorff dimension $n$. Proved for $n = 2$ (Davies, 1971) and $n = 3$ (Wang and Zahl, 2025).`,
  figure: {
    svgs: [brush],
    caption: r`Wolff's hairbrush: tubes that all cross one tube, the stem. In space they can fan out in different planes around the stem, and counting how little they overlap gave dimension $5/2$ in $\mathbb R^3$, the record from 1995 until the 2020s.`,
  },
  prereqs: ['dimension', 'fourier'],
  requiresTheorems: ['cordoba', 'dvir'],
  tagline: r`A needle can turn in no area at all, yet the set must still be big. Proved in 3D in 2025; Fields Medal 2026.`,
  status: 'Proved in 3D, 2025',
  intro: r`The path here built three things: Kakeya sets of area as small as you like (so area is the wrong measure), Córdoba's argument that in the plane they are still two-dimensional, and Dvir's proof that over finite fields they fill a fixed fraction of space. In three dimensions Córdoba's argument stops at dimension $2$, and the finite-field proof has nothing to hold on to. This roadmap covers why harmonic analysts care, the bounds between 1991 and 2019, the 2025 proof by Hong Wang and Joshua Zahl, and what is still open.`,
  steps: [
    {
      title: 'The conjecture, precisely',
      claim: r`A **Kakeya set** in $\mathbb R^n$ is a compact set containing a unit segment in every direction. The conjecture says its $\delta$-neighbourhood has volume at least $c_\varepsilon \delta^{\varepsilon}$ for every $\varepsilon \gt 0$ (Minkowski dimension $n$), and its Hausdorff dimension is $n$ too.`,
      cited: r`Davies, Math. Proc. Cambridge Philos. Soc. 69 (1971), for $n = 2$`,
      why: r`Besicovitch's construction works in every dimension (take a planar Kakeya set times a cube), so Kakeya sets of volume zero exist for $n \ge 2$. Dimension is the next-finer measure. In the plane, Córdoba's argument gives the Minkowski version with the loss $1/\log(1/\delta)$, which is smaller than any $\delta^{\varepsilon}$.`,
      detail: r`Hausdorff dimension $n$ implies Minkowski dimension $n$, since Minkowski dimension is never smaller, so the Hausdorff statement is the stronger one. In the plane both were known by 1977.

For $n = 3$ the conjecture says: covering a Kakeya set by balls of radius $\delta$ takes about $\delta^{-3}$ balls, up to factors $\delta^{-\varepsilon}$. So a set of volume zero must be as "thick" as a solid cube at every resolution.`,
      concepts: ['dimension'],
      check: {
        prompt: r`Kakeya sets in the plane can have area zero. Does that contradict dimension $2$?`,
        options: [
          r`No: their $\delta$-neighbourhoods shrink, but only like $1/\log(1/\delta)$, too slowly to lower the dimension`,
          r`Yes: a set of dimension $2$ has positive area`,
          r`No, because they aren't closed sets`,
        ],
        answer: 0,
        explain: r`Dimension only records the exponent of $\delta$. Area zero means the neighbourhoods shrink to $0$; dimension $2$ says they shrink slower than any power $\delta^{\varepsilon}$.`,
      },
    },
    {
      title: 'Tubes are waves',
      claim: r`A wave whose frequencies point in nearly one direction travels along a tube. So Kakeya sets control how waves can pile up, and the restriction, Bochner–Riesz and local smoothing conjectures of harmonic analysis each imply the Kakeya conjecture.`,
      cited: r`Fefferman, The multiplier problem for the ball, Ann. of Math. 94 (1971); Bourgain, 1991; Wolff's survey, 1999`,
      why: r`Fefferman used Besicovitch sets to show that cutting off a Fourier integral to a ball does not converge in $L^p$ for $p \ne 2$ in dimension $\ge 2$: wave packets along the tubes of a Kakeya set of tiny volume can be arranged to pile up. Any small Kakeya set would give a similar counterexample to the restriction conjecture.`,
      detail: r`The idea is the uncertainty principle. A function whose Fourier transform lives on a cap of radius $\delta$ of the unit sphere, around the direction $e$, is concentrated (over a region of size $\delta^{-2}$) on a tube of width $\delta^{-1}$ and length $\delta^{-2}$ in direction $e$. Shrunk by the factor $\delta^2$, that is a tube of width $\delta$ and length $1$. Sums of such packets over many caps are sums over tubes in many directions, and the question how much they can concentrate becomes the question how small a union of tubes in different directions can be.

So Kakeya is the "geometric core" of these conjectures: necessary for each of them, not sufficient. Proving Kakeya in $\mathbb R^3$ does not prove restriction in $\mathbb R^3$.`,
      concepts: ['fourier'],
      check: {
        prompt: r`If the Kakeya conjecture were false in $\mathbb R^3$, what would follow?`,
        options: [
          r`The restriction conjecture in $\mathbb R^3$ would be false too`,
          r`The restriction conjecture in $\mathbb R^3$ would be true`,
          r`Nothing about restriction`,
        ],
        answer: 0,
        explain: r`Restriction implies Kakeya, so a counterexample to Kakeya is (after the wave-packet construction) a counterexample to restriction. The converse fails: Kakeya alone doesn't give restriction.`,
      },
    },
    {
      title: 'Bushes and hairbrushes',
      claim: r`In $\mathbb R^3$ the dimension is at least $2$ (Córdoba's argument, or the bush), $7/3$ (Bourgain, 1991), $5/2$ (Wolff's hairbrush, 1995), and slightly more than $5/2$: Minkowski (Katz, Łaba and Tao, 2000) and Hausdorff (Katz and Zahl, 2019).`,
      cited: r`Bourgain, GAFA 1991; Wolff, Rev. Mat. Iberoam. 11 (1995); Katz–Łaba–Tao, Ann. of Math. 152 (2000); Katz–Zahl, J. Amer. Math. Soc. 32 (2019)`,
      figure: {
        svgs: [bush3],
        caption: r`A bush: tubes through one point in directions spread over all of space. Near the point they pile up; a little way out they are disjoint, and the union is at least what they cover there.`,
      },
      why: r`A **bush** is many tubes through one point: away from it they separate, so a point of high multiplicity forces a large union, which gives $(n + 1)/2$ in $\mathbb R^n$. A **hairbrush** is many tubes crossing one tube, the stem: around the stem they spread over different planes, and each plane is a 2D Kakeya problem, where Córdoba's argument applies. Wolff's count gives $(n + 2)/2$ in $\mathbb R^n$.`,
      detail: r`Every argument has the same shape as Córdoba's: count incidences between tubes, use that tubes in different directions meet in small sets, and turn little overlap into a large union. What changes is which configuration is counted: pairs (Córdoba), tubes through a point (bush), tubes through a tube (hairbrush).

Wolff's $5/2$ resisted for two decades. Katz, Łaba and Tao pushed the Minkowski dimension past it by an explicit tiny amount, by showing that a set of dimension near $5/2$ would have to be very structured, and the structure is impossible.`,
      concepts: ['dimension'],
      check: {
        prompt: r`What does each bristle of a hairbrush share with the stem?`,
        options: [
          r`A crossing: every bristle meets the stem tube`,
          r`Its direction`,
          r`Nothing; the bristles are disjoint from the stem`,
        ],
        answer: 0,
        explain: r`The bristles all cross the stem, at different points and angles. Directions are all different, which is what keeps the bristles from overlapping each other much.`,
      },
    },
    {
      title: 'Where the hard cases hide',
      claim: r`A Kakeya set in $\mathbb R^3$ of dimension near $5/2$ would have to be **plany** (the tubes through a typical point lie close to one plane) and **grainy** (at small scales it is made of flat slabs, grains).`,
      cited: r`Katz–Łaba–Tao, 2000; Guth, the polynomial method, 2010s; Tao's account of Wang–Zahl, 2025`,
      figure: {
        svgs: [bush3, plany3],
        caption: r`The same point, two ways. Left, a bush: the tubes spread in every direction of space. Right, plany: they all lie close to one plane (dashed), so near this point the set looks like a planar Kakeya set, and the counting arguments lose the third dimension.`,
      },
      why: r`These are the configurations every known argument fails to rule out: tubes lying in planes look like a lower-dimensional problem repeated, and the counting in bushes and hairbrushes cannot see that they are spread out. Guth later explained graininess with the polynomial method, the descendant of Dvir's finite-field proof.`,
      detail: r`This is where Dvir's idea came back to the real problem. Over $\mathbb F_q$ a small Kakeya set lies in the zero set of a low-degree polynomial. Over $\mathbb R$ that is false, but a weakened version holds: the hard configurations concentrate near low-degree surfaces, and polynomial partitioning (Guth, Katz) cuts space into cells where the problem splits.

A third property matters for the 2025 proof: a Kakeya set is **sticky** if tubes whose directions are close are also close in position, at every scale. Sticky sets look the same at every scale, which makes them good candidates for counterexamples.`,
      concepts: ['polynomials'],
    },
    {
      title: 'Wang and Zahl, 2025',
      claim: r`Every Kakeya set in $\mathbb R^3$ has Minkowski and Hausdorff dimension $3$. Wang and Zahl first proved the sticky case (2022), then the general case from a stronger theorem: a union of $\delta$-tubes, not too many of which lie in any one convex set, has almost maximal volume.`,
      cited: r`Wang–Zahl, Sticky Kakeya sets and the sticky Kakeya conjecture, arXiv:2210.09581, J. Amer. Math. Soc. 39 (2026); Wang–Zahl, Volume estimates for unions of convex sets, and the Kakeya set conjecture in three dimensions, arXiv:2502.17655 (2025, 127 pages)`,
      why: r`The proof is an **induction on scales**: if every such union has volume at least $\delta^{3 - d}$ (dimension $d$), show it has dimension $d + \alpha$, and repeat until $d = 3$. Separated directions don't survive the induction, so the hypothesis is the weaker "convex Wolff axioms" (no convex set holds too many tubes), which does.`,
      detail: r`From Tao's account of the proof:
- **Sticky case.** Treated in the 2022 paper, following a strategy of Katz and Tao: in the self-similar case, a small gain at one scale repeats at every scale.
- **Non-sticky case.** Tubes are grouped into fat tubes at an intermediate scale and the multiplicities compared. Near-extremal sets must be grainy, by Guth's polynomial-method argument.
- **Planar grains** are handled by **Córdoba's $L^2$ argument**, the one in this path.
- A structure theorem groups grains into convex prisms. Thick prisms violate the induction hypothesis; thin ones are handled by Córdoba's argument again.

Tao called the paper a historic breakthrough, and Nets Katz called it a solution to the "holy grail" problem.`,
      concepts: ['dimension', 'cauchyschwarz'],
      check: {
        prompt: r`Which argument from this path reappears inside the Wang–Zahl proof?`,
        options: [
          r`Córdoba's $L^2$ argument, for configurations that are essentially planar`,
          r`The Perron tree construction`,
          r`Dvir's proof, applied over $\mathbb R$`,
        ],
        answer: 0,
        explain: r`Planar pieces are 2D Kakeya problems, where little overlap plus Cauchy–Schwarz gives a large union. Perron trees build small sets rather than bound them, and Dvir's argument doesn't work over $\mathbb R$; its descendant, polynomial partitioning, enters through Guth's graininess.`,
      },
    },
    {
      title: 'Status, November 2026',
      claim: r`Hong Wang received a Fields Medal on 23 July 2026, in part for this work. In autumn 2026 OpenAI posted preprints claiming the four-dimensional case and Sogge's local smoothing conjecture, from which they derive Kakeya, in its maximal-function form, in every dimension. As of November no expert assessment of either has been reported.`,
      cited: r`ICM 2026, Philadelphia; OpenAI, Every four-dimensional Kakeya set has full Hausdorff dimension (dated 24 Sep 2026) and Local smoothing for the Euclidean wave equation (dated 25 Oct 2026); Scientific American, 6 October 2026`,
      why: r`The three-dimensional proof is accepted by experts, and its sticky half is published. The local smoothing preprint is 59 pages; OpenAI's catalogue lists its main theorems, including that every Kakeya set has full Hausdorff dimension, as formalized in Lean. The four-dimensional preprint, 175 pages, has no Lean entry of its own. OpenAI calls the collection raw research data and warns that its unformalized results could have issues.`,
      detail: r`What each claim says, from the preprints themselves:
- **$n = 4$** (175 pages): every subset of $\mathbb R^4$ containing a unit segment in every direction has Hausdorff dimension $4$, with no compactness assumption. It builds on the three-dimensional theorem (through a later streamlined proof by Guth, Wang and Zahl), and its new device is local quadratic fits: line pieces that stay close to the zero set of one quadratic polynomial across many scales.
- **All $n \ge 2$** (59 pages): Sogge's local smoothing estimate for the wave equation, with the Bochner–Riesz conjecture, Fourier restriction for the sphere inside the conjectured range, and the Kakeya and Nikodym maximal conjectures derived from it. That would also settle the maximal-function form in $\mathbb R^3$, which Tao described as open in 2025.
- **Verification:** a Lean proof shows that the formal statement follows; whether the formal statement says what the conjecture says is what reviewers check, as with the Navier–Stokes claim.

If the local smoothing claim holds, it settles the Kakeya conjecture and much of the harmonic analysis in step 2 at once.

As with the Riemann Hypothesis and Navier–Stokes entries: this is taken from the reporting listed below, written with Claude, and the situation is changing.`,
      concepts: [],
      check: {
        prompt: r`What did the 2025 Wang–Zahl theorem leave open?`,
        options: [
          r`Dimensions $n \ge 4$, and the maximal-function form in $\mathbb R^3$`,
          r`The Hausdorff dimension in $\mathbb R^3$`,
          r`The plane`,
        ],
        answer: 0,
        explain: r`It proves both Minkowski and Hausdorff dimension $3$ in $\mathbb R^3$. The plane was settled in 1971. Four dimensions and up, and the maximal form, were open in 2025; both are now claimed in OpenAI's preprints, which are not yet reviewed.`,
      },
    },
  ],
  takeaway: r`Kakeya sets can have volume zero but, conjecturally, never lower dimension. Tubes in different directions can't overlap much; in the plane Cauchy–Schwarz shows it, and in space it took a 127-page induction on scales, completed in 2025.`,
  sources: [
    { label: 'Kakeya set (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kakeya_set' },
    { label: 'Wang and Zahl, Volume estimates for unions of convex sets, and the Kakeya set conjecture in three dimensions, arXiv:2502.17655', url: 'https://arxiv.org/abs/2502.17655' },
    { label: 'Wang and Zahl, Sticky Kakeya sets and the sticky Kakeya conjecture, arXiv:2210.09581', url: 'https://arxiv.org/abs/2210.09581' },
    { label: 'Terence Tao, The three-dimensional Kakeya conjecture, after Wang and Zahl (2025)', url: 'https://terrytao.wordpress.com/2025/02/25/the-three-dimensional-kakeya-conjecture-after-wang-and-zahl/' },
    { label: 'NYU: Hong Wang wins the Fields Medal', url: 'https://math.nyu.edu/dynamic/news/101/' },
    { label: 'Scientific American: Four young mathematicians awarded the 2026 Fields Medals', url: 'https://scientificamerican.com/article/2026-fields-medals-go-to-four-young-mathematicians' },
    { label: 'Scientific American, 6 Oct 2026: OpenAI unleashes hundreds more math results', url: 'https://www.scientificamerican.com/article/openai-unleashes-hundreds-more-math-results-upon-a-field-already-in-shock/' },
    { label: 'OpenAI, Every four-dimensional Kakeya set has full Hausdorff dimension (preprint, PDF)', url: 'https://github.com/openai/math/blob/main/preprints/Every-four-dimensional-Kakeya-set-has-full-Hausdorff-dimension-September-24-2026/paper.pdf' },
    { label: 'OpenAI, Local smoothing for the Euclidean wave equation (preprint, PDF)', url: 'https://github.com/openai/math/blob/main/preprints/Local-smoothing-for-the-Euclidean-wave-equation-October-25-2026/paper.pdf' },
    { label: 'OpenAI math repository: Lean formalization catalogue', url: 'https://github.com/openai/math/blob/main/lean/formalization.yaml' },
  ],
};
