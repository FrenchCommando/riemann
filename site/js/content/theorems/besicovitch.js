import { svg, poly, path, text, arrowLine } from '../figures.js';

const r = String.raw;

// ---------- the Perron tree ----------
// A triangle with base [0, W] on y = 0 and apex (W/2, 1), cut into 2^k slivers
// from the apex. Round m of the construction slides each right-hand group of
// 2^m slivers left by 2^m b (1 − α^m (2α − 1)), b = W / 2^k: first so the two
// groups' hearts touch, then by the cut-and-slide lemma. Each sliver is only
// translated, so every direction it held is still there.
export function perronTree(k, a, W) {
  const n = 2 ** k, b = W / n;
  return Array.from({ length: n }, (_, i) => {
    let s = 0;
    for (let m = 0; m < k; m++) if ((i >> m) & 1) s += 2 ** m * b * (1 - a ** m * (2 * a - 1));
    return [[i * b - s, 0], [(i + 1) * b - s, 0], [W / 2 - s, 1]];
  });
}

const W = 2 / Math.sqrt(3); // equilateral triangle of height 1
const treeSvg = (k, a, label, outline) => {
  const tris = perronTree(k, a, W);
  const xs = tris.flatMap((t) => t.map(([x]) => x));
  const lo = Math.min(...xs, outline ? 0 : Infinity), hi = Math.max(...xs, outline ? W : -Infinity);
  const U = 200, px = (x) => U * (x - lo) + 10, py = (y) => 10 + U * (1 - y);
  const pts = (t) => t.map(([x, y]) => `${px(x).toFixed(2)},${py(y).toFixed(2)}`).join(' ');
  return svg(`0 0 ${(U * (hi - lo) + 20).toFixed(0)} ${U + 20}`, label,
    outline ? poly(pts([[0, 0], [W, 0], [W / 2, 1]]), 'f-ghost') : '',
    ...tris.map((t) => poly(pts(t), 'f-sliver')),
    path(`M${px(lo) - 6} ${py(0)}H${px(hi) + 6}`, 'f-axis'));
};
const tree8 = treeSvg(8, 0.8, 'A Perron tree: an equilateral triangle cut into 256 thin slivers from its apex, slid along the base so that they overlap. The result is a spiky, tree-like shape whose area is about a quarter of the triangle, and it still contains a unit segment in every direction the triangle did');
const tree4 = treeSvg(4, 0.7, 'The same construction with 16 slivers, drawn over the outline of the original triangle: the slivers bunch up into a shape with four levels of branches', true);

// ---------- the cut-and-slide lemma, α = 0.6 ----------
// Halves T1 = (0,0),(1,0),(1,1) and T2 = (1,0),(2,0),(1,1); T2 slides left by
// t = 2(1 − α). The union is the heart α·T plus two ears of area (1 − α)² each.
const al = 0.6, t = 2 * (1 - al);
const L = 130, qx = (x) => 20 + L * x, qy = (y) => 150 - L * y;
const P = (...ps) => ps.map(([x, y]) => `${qx(x).toFixed(1)},${qy(y).toFixed(1)}`).join(' ');
const lemma = svg('0 0 300 182', 'Two halves of a triangle, the right one slid left over the left one. Their union is a smaller copy of the whole triangle, scaled by alpha, shaded red, plus two small triangular ears at the top, shaded green',
  poly(P([1, 0], [2, 0], [1, 1]), 'f-ghost'),
  poly(P([0, 0], [1, 0], [1, 1]), 'f-tri'), poly(P([1 - t, 0], [2 - t, 0], [1 - t, 1]), 'f-tri'),
  poly(P([0, 0], [2 * al, 0], [al, al]), 'f-sq'),
  poly(P([al, al], [1, 1], [1, 1 - t]), 'f-sq2'), poly(P([al, al], [1 - t, 1], [1 - t, 1 - t]), 'f-sq2'),
  arrowLine(qx(1.75), qy(0.18), qx(1.75 - t), qy(0.18), 'f-thin', 6),
  text(qx(al), qy(0.22), 'α·T', 'f-sm'), text(qx(0.8), qy(1.1), 'ears', 'f-pt'),
  text(qx(1.62), qy(-0.12), 'slide', 'f-pt'));

export default {
  id: 'besicovitch',
  field: 'Geometry',
  title: 'Kakeya sets of tiny area',
  attribution: 'Abram Besicovitch, 1919 and 1928; simplified by Oskar Perron, 1928, and Isaac Schoenberg, 1962',
  statement: r`For every $\varepsilon \gt 0$ there is a set in the plane with area less than $\varepsilon$ that contains a segment of length $1$ in every direction.`,
  figure: {
    svgs: [tree8],
    caption: r`A Perron tree, computed by this page: an equilateral triangle of height $1$, cut into $256$ slivers from the apex, each slid sideways by the rule of step 3. Its area is about a quarter of the triangle's, and it still holds a unit segment in every direction the triangle did. More slivers push the area as close to $0$ as you like.`,
  },
  prereqs: ['area', 'similar', 'series'],
  requiresTheorems: ['pythagoras'],
  intro: r`In 1917 Sōichi Kakeya asked for the smallest area in which a needle of length $1$ can be turned around completely. A disc of diameter $1$ works (area $\pi/4 \approx 0.79$), and a three-cornered deltoid does better ($\pi/8 \approx 0.39$). The answer is that there is no smallest area at all. This proof builds the key object: a set of area as small as you like that contains the needle in every direction. The trick is to cut a triangle into slivers and slide them over each other.`,
  steps: [
    {
      title: 'Triangles hold directions',
      claim: r`An equilateral triangle $T$ of height $1$ contains a unit segment in every direction within $30^\circ$ of its axis. Three such triangles, turned by $60^\circ$ from each other, cover all directions.`,
      why: r`From the apex, the segment to a point of the base has length between $1$ (straight down) and $2/\sqrt3$ (to a corner), and its direction sweeps the $60^\circ$ apex angle. Three sweeps of $60^\circ$ make $180^\circ$, which is every direction of a line.`,
      detail: r`A segment has a direction "up to sign": turning it by $180^\circ$ gives the same segment. So covering $180^\circ$ of directions is enough.

From here on, only translations are allowed. If $T$ is cut into pieces and each piece is moved without turning, each piece still holds its segments, in the same directions. So the goal becomes: **cut $T$ into pieces and translate them so that they overlap almost entirely**, while their union still contains a translate of every piece.`,
      concepts: ['area'],
      check: {
        prompt: r`Why is it important that the pieces are translated and never rotated?`,
        options: [
          r`A translated piece still contains segments in exactly the same directions`,
          r`Rotating a piece would change its area`,
          r`Translating a piece makes its area smaller`,
        ],
        answer: 0,
        explain: r`Translation and rotation both keep area. Only translation keeps every direction where it was, which is what the set must contain.`,
      },
    },
    {
      title: 'Cut and slide',
      claim: r`Cut $T$ from the apex into two halves and slide one half along the base over the other. For any $\tfrac12 \le \alpha \lt 1$ the right slide makes the union a copy of $T$ scaled by $\alpha$ (the **heart**) plus two small triangles (the **ears**), of area
$$\big(\alpha^2 + 2(1 - \alpha)^2\big)\,|T|.$$`,
      figure: {
        svgs: [lemma],
        caption: r`The two halves of a triangle, with $\alpha = 0.6$. The right half (its old position dashed) slides left until the two outer sides meet at height $\alpha$. The union is the heart $\alpha \cdot T$ (red) plus two ears (green).`,
      },
      why: r`Slide until the two outer sides cross at height $\alpha$ (as a fraction of the height). Below the crossing, those sides and the base bound a triangle similar to $T$ with ratio $\alpha$, and every point of it lies in one of the halves. Above the crossing, each half sticks out as a small triangle, an ear, of area $(1 - \alpha)^2|T|$ (computed below).`,
      detail: r`In coordinates, take the halves $T_1 = (0,0),(1,0),(1,1)$ and $T_2 = (1,0),(2,0),(1,1)$, so $|T| = 1$, and slide $T_2$ left by $t = 2(1 - \alpha)$. The left side of $T_1$ is $y = x$; the right side of the moved $T_2$ is $y = 2 - t - x$. They meet at $x = y = \alpha$.

- **Heart:** the triangle $(0,0), (2\alpha, 0), (\alpha, \alpha)$ is $T$ scaled by $\alpha$, area $\alpha^2$. Its points with $x \le 1$ lie in $T_1$, the others in the moved $T_2$.
- **Ears:** the part of $T_1$ outside the heart is the triangle $(\alpha, \alpha), (1, 1), (1, 1 - t)$, with a vertical side of length $t$ and width $1 - \alpha$: area $\tfrac12 t (1 - \alpha) = (1 - \alpha)^2$. The other ear is its mirror image.

Total: $\alpha^2 + 2(1 - \alpha)^2$. With $\alpha = \tfrac12$ the union is $\tfrac34$ of $T$. The same works for any triangle, not just this one: an affine map takes it to any other and multiplies every area by the same factor.`,
      concepts: ['similar', 'area'],
      check: {
        prompt: r`With $\alpha = \tfrac12$, what fraction of $|T|$ does the union of the two slid halves cover?`,
        options: [r`$\tfrac34$`, r`$\tfrac14$`, r`$\tfrac12$`],
        answer: 0,
        explain: r`$\alpha^2 + 2(1 - \alpha)^2 = \tfrac14 + 2 \cdot \tfrac14 = \tfrac34$. The heart alone is $\tfrac14$, but the ears stick out and add $\tfrac12$.`,
      },
    },
    {
      title: 'Repeat on the hearts',
      claim: r`Cut $T$ into $2^k$ slivers from the apex and apply the slide in $k$ rounds: first to neighbouring slivers, then to neighbouring hearts, and so on. The final union has area at most
$$\big(\alpha^{2k} + 2(1 - \alpha)\big)\,|T|.$$`,
      figure: {
        svgs: [tree4],
        caption: r`After four rounds with $16$ slivers and $\alpha = 0.7$, over the outline of the original triangle. Each level of branches is the ears of one round.`,
      },
      why: r`After round $j$ the hearts are halves of triangles of total area $\alpha^{2j}|T|$, so round $j + 1$ shrinks them by another factor $\alpha^2$ and adds ears of area $2(1 - \alpha)^2 \alpha^{2j}|T|$. The ears sum to at most $2(1 - \alpha)^2 (1 + \alpha^2 + \alpha^4 + \cdots)|T| = \frac{2(1 - \alpha)}{1 + \alpha}|T|$.`,
      detail: r`Why the hearts fit together again: the heart of a pair is the pair's triangle scaled by $\alpha$. Two neighbouring pairs are the two halves of a triangle with twice the base, so their hearts, slid until they touch, are the two halves of that triangle scaled by $\alpha$. The lemma of step 2 applies to them as it stands.

When a heart slides, its ears go with it (the whole group moves), so ears never grow; overlapping can only make the union smaller. The geometric series: $\frac{2(1 - \alpha)^2}{1 - \alpha^2} = \frac{2(1 - \alpha)}{1 + \alpha} \le 2(1 - \alpha)$.

In the end each sliver has only been translated. Sliver number $i$ moves left by the sum, over the binary digits $m$ of $i$ that are $1$, of $2^m b\,(1 - \alpha^m(2\alpha - 1))$, where $b$ is the width of a sliver's base. The figures here are drawn with that rule.`,
      concepts: ['series', 'similar'],
      check: {
        prompt: r`After all $k$ rounds, what is the area of the last heart?`,
        options: [r`$\alpha^{2k}|T|$`, r`$\alpha^k |T|$`, r`$(1 - \alpha)^{2k}|T|$`],
        answer: 0,
        explain: r`Each round scales the hearts by $\alpha$ in length, so by $\alpha^2$ in area; $k$ rounds give $\alpha^{2k}$.`,
      },
    },
    {
      title: 'Choose α, then k',
      claim: r`Given $\varepsilon$, take $\alpha = 1 - \varepsilon/4$ and then $k$ so large that $\alpha^{2k} \lt \varepsilon/2$. The tree has area less than $\varepsilon|T|$, and the three trees together less than $3\varepsilon|T|$. $\blacksquare$`,
      why: r`$2(1 - \alpha) = \varepsilon/2$ bounds the ears, and $\alpha^{2k} \to 0$ because $\alpha \lt 1$. Each tree contains a translate of every sliver of its triangle, so by step 1 the three trees hold a unit segment in every direction.`,
      detail: r`The order matters. The ears cost about $2(1 - \alpha)$, which wants $\alpha$ close to $1$; the heart costs $\alpha^{2k}$, which wants $\alpha$ small. Taking $\alpha$ close to $1$ first and then making $k$ huge satisfies both: $\alpha^{2k}$ still tends to $0$, just slowly. With $\varepsilon = 0.1$: $\alpha = 0.975$, and $\alpha^{2k} \lt 0.05$ first holds at $k = 60$, so about $2^{60}$ slivers.

The pieces get very thin and the trees very spiky, but nothing in the argument needs them to be drawable. Since $\varepsilon$ was arbitrary, Kakeya sets can have area as small as you like.`,
      concepts: ['series'],
      check: {
        prompt: r`Why not take $\alpha$ small, say $\alpha = \tfrac12$, and $k$ large?`,
        options: [
          r`The ears alone would cost up to $2(1 - \alpha)|T| = |T|$, so the area wouldn't get small`,
          r`The construction needs $\alpha \gt \tfrac12$ to work at all`,
          r`$\alpha^{2k}$ wouldn't tend to $0$`,
        ],
        answer: 0,
        explain: r`The heart vanishes for any $\alpha \lt 1$, but each round adds ears, and their total is about $2(1 - \alpha)|T|$ whatever $k$ is. Only $\alpha$ near $1$ makes the ears small.`,
      },
    },
    {
      title: 'Area zero, and turning the needle',
      claim: r`There are Kakeya sets of area exactly zero, and a unit needle can be turned all the way around inside a set of area less than any $\varepsilon \gt 0$.`,
      cited: r`Besicovitch, 1919 and Math. Z. 27 (1928); Pál, 1921; Falconer, The Geometry of Fractal Sets, 1985, ch. 7`,
      why: r`Area zero: Besicovitch used a limiting version of the construction, each stage inside a small neighbourhood of the previous one, with a compactness argument keeping a unit segment in every direction in the limit. Turning: a needle can move between two parallel positions using extra area as small as you like (Pál's joins), so the needle turns a little inside one sliver, jumps to the next sliver, and so on.`,
      detail: r`**Pál's join.** To get from a line $\ell_1$ to a parallel line $\ell_2$: slide far along $\ell_1$, rotate slightly onto a line crossing $\ell_2$ far away, slide back along that line, and rotate onto $\ell_2$. The two rotations sweep thin triangles whose area shrinks the further you travel. So Kakeya's question has no answer: no positive area is the smallest.

What survives is dimension. These sets have area zero, but the next proof shows that in the plane they are still two-dimensional: covering one by discs of radius $\delta$ takes almost as many discs as covering a whole square.`,
      concepts: ['area'],
    },
  ],
  takeaway: r`Cut a triangle into slivers and slide them over each other, and the union shrinks as much as you like while keeping every direction. Kakeya sets can have area as small as you like, even zero.`,
  sources: [
    { label: 'Kakeya set (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kakeya_set' },
  ],
};
