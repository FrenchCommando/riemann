import { svg, poly, path, text } from '../figures.js';

const r = String.raw;

// A δ × 1 tube: centre (cx, cy), angle th, as polygon points (y up, flipped by the caller).
const tube = (cx, cy, th, len, w) => {
  const [c, s] = [Math.cos(th), Math.sin(th)], [hx, hy] = [(c * len) / 2, (s * len) / 2], [wx, wy] = [(-s * w) / 2, (c * w) / 2];
  return [[cx - hx - wx, cy - hy - wy], [cx + hx - wx, cy + hy - wy], [cx + hx + wx, cy + hy + wy], [cx - hx + wx, cy - hy + wy]];
};
const pts = (ps, ox, oy) => ps.map(([x, y]) => `${(ox + x).toFixed(1)},${(oy - y).toFixed(1)}`).join(' ');

// Twelve tubes, one per direction, with centres along a slanted line so they cross in a band.
const N = 12;
const bush = svg('0 0 320 220', 'Twelve thin rectangles, one in each of twelve evenly spaced directions, placed so that they cross one another in a band through the middle. Where several overlap the shading is darker',
  ...Array.from({ length: N }, (_, i) => poly(pts(tube(-90 + (180 * i) / (N - 1), 18 * Math.sin(i), (Math.PI * i) / N, 150, 10), 160, 110), 'f-sliver')));

// Two strips of width d crossing at angle θ: their intersection is a parallelogram of area d² / sin θ.
const d = 26, th = Math.PI / 6, [c, s] = [Math.cos(th), Math.sin(th)];
const para = [[-d / 2, -d / 2], [d / 2, -d / 2], [d / 2, d / 2], [-d / 2, d / 2]]
  .map(([u, y]) => [(y * c - u) / s, y]); // −x sin θ + y cos θ = u, at height y
const cross = svg('0 0 320 170', 'Two thin rectangles of width delta crossing at an angle theta. Their overlap is a small parallelogram, shaded, with height delta and length delta over sine theta',
  poly(pts(tube(0, 0, 0, 260, d), 160, 85), 'f-tri'),
  poly(pts(tube(0, 0, th, 260, d), 160, 85), 'f-tri'),
  poly(pts(para, 160, 85), 'f-d0'),
  path(`M272 85A112 112 0 0 0 ${(160 + 112 * c).toFixed(1)} ${(85 - 112 * s).toFixed(1)}`, 'f-arc'),
  text(160 + 124, 85 - 30, 'θ', 'f-sm f-acc'),
  text(10, 85, 'δ', 'f-sm'), path(`M22 ${85 - d / 2}V${85 + d / 2}`, 'f-mark'),
  text(90, 30, 'overlap = δ² / sin θ', 'f-pt'), path('M118 40L152 78', 'f-mark'));

export default {
  id: 'cordoba',
  field: 'Analysis',
  title: 'Kakeya sets in the plane are two-dimensional',
  attribution: 'Antonio Córdoba, 1977 (this argument); Roy Davies, 1971 (Hausdorff dimension)',
  statement: r`Let $K$ be a bounded set in the plane containing a unit segment in every direction, and $0 \lt \delta \le \tfrac12$. The points within $\delta$ of $K$ form a set of area at least
$$\frac{1}{2\,(2 + \log(1/\delta))}.$$
So covering $K$ takes at least about $\delta^{-2}/\log(1/\delta)$ discs of radius $\delta$: $K$ has Minkowski dimension $2$.`,
  figure: {
    svgs: [bush],
    caption: r`Thicken each segment of $K$ to a tube of width $\delta$, one per direction. Tubes in different directions can't overlap much, so their union can't be much smaller than their total area. The overlaps (darker) are what the proof counts.`,
  },
  prereqs: ['dimension', 'cauchyschwarz', 'harmonic'],
  requiresTheorems: ['besicovitch'],
  intro: r`The previous proof made Kakeya sets of area zero. Area is too crude to see them, so look at them at a resolution $\delta$: thicken the set by $\delta$ and measure that. A square stays at area about $1$, a segment drops to about $\delta$. This proof shows a Kakeya set in the plane behaves like the square, up to a factor $\log(1/\delta)$, so its dimension is $2$. The argument is short: tubes in different directions overlap little, and Cauchy–Schwarz turns little overlap into a large union. It is the template for every approach to the higher-dimensional problem.`,
  steps: [
    {
      title: 'Tubes',
      claim: r`Let $N = \lfloor 1/\delta \rfloor$. For the directions $\theta_i = \pi i / N$, $i = 0, \dots, N - 1$, pick a unit segment of $K$ in direction $\theta_i$, and let $T_i$ be the $\delta \times 1$ rectangle centred on it. Each $T_i$ has area $\delta$ and lies within $\delta$ of $K$.`,
      why: r`Every point of $T_i$ is within $\delta/2$ of its segment, which lies in $K$. The total area is $N\delta$, between $\tfrac12$ and $1$ because $\delta \le \tfrac12$.`,
      detail: r`Bounds on $N\delta$: $N \le 1/\delta$ gives $N\delta \le 1$, and $N \gt 1/\delta - 1 \ge 1/(2\delta)$ (using $\delta \le \tfrac12$) gives $N\delta \ge \tfrac12$.

Why $N \approx 1/\delta$ directions: two tubes of width $\delta$ and length $1$ whose directions differ by less than about $\delta$ can sit almost on top of each other, so more directions than that would add nothing new. At angle $\delta$ apart, tubes through a common point separate by $\delta$ after length $1$: just distinguishable.`,
      concepts: ['dimension'],
      check: {
        prompt: r`What is the total area $\sum |T_i|$ of the tubes, roughly?`,
        options: [r`About $1$: $N \approx 1/\delta$ tubes of area $\delta$`, r`About $\delta$`, r`About $1/\delta$`],
        answer: 0,
        explain: r`$N\delta$ with $N = \lfloor 1/\delta \rfloor$, which is between $\tfrac12$ and $1$. The question is how much of that total survives as the area of the union.`,
      },
    },
    {
      title: 'Two tubes barely overlap',
      claim: r`If two tubes of width $\delta$ have directions at angle $\theta$, they overlap in area at most $\delta^2/\sin\theta$.`,
      figure: {
        svgs: [cross],
        caption: r`Two strips of width $\delta$ at angle $\theta$ meet in a parallelogram. Its height is $\delta$ and its length along the first strip is $\delta/\sin\theta$.`,
      },
      why: r`Each tube lies in an infinite strip of width $\delta$. Two strips at angle $\theta$ meet in a parallelogram: its height across the first strip is $\delta$, and its length along it is $\delta/\sin\theta$, the width of the second strip measured along that slant.`,
      detail: r`The length: the second strip's two edges cross a line along the first strip at points $\delta/\sin\theta$ apart, because the perpendicular distance between the edges is $\delta$ and the line meets them at angle $\theta$.

So nearly parallel tubes ($\theta \approx \delta$) can overlap almost entirely: $\delta^2/\sin\delta \approx \delta$, a whole tube. Tubes at a large angle overlap in about $\delta^2$, a single $\delta \times \delta$ square. This bound is the only geometric input of the proof.`,
      concepts: ['area'],
      check: {
        prompt: r`Two tubes of width $\delta$ cross at a right angle. What is their overlap, at most?`,
        options: [r`$\delta^2$`, r`$\delta$`, r`$2\delta^2$`],
        answer: 0,
        explain: r`$\sin 90^\circ = 1$, so $\delta^2/\sin\theta = \delta^2$: a $\delta \times \delta$ square. The overlap grows as the angle shrinks.`,
      },
    },
    {
      title: 'Adding up all overlaps',
      claim: r`$\displaystyle \sum_{i, j} |T_i \cap T_j| \le N\delta\,(2 + \log N).$`,
      why: r`The $N$ terms with $i = j$ give $N\delta$. For $i \ne j$ the angle is $\pi k/N$ with $1 \le k \le N/2$, so $\sin \ge 2k/N$ and the overlap is at most $\delta^2 N/(2k)$. Each $k$ occurs for at most two $j$, so for fixed $i$ the sum over $j$ is at most $\delta^2 N \sum_{k \le N/2} \frac1k \le \delta^2 N (1 + \log N)$.`,
      detail: r`The angle between the lines in directions $\theta_i$ and $\theta_j$ is $\pi k/N$ with $k = \min(|i - j|, N - |i - j|)$: lines that differ by almost $180^\circ$ are close. That angle is at most $90^\circ$, where $\sin x \ge 2x/\pi$ (the sine curve lies above its chord), so $\sin(\pi k/N) \ge 2k/N$.

Summing over $i$ as well: $N \cdot \delta^2 N(1 + \log N) = (N\delta)^2 (1 + \log N) \le N\delta\,(1 + \log N)$, since $N\delta \le 1$. With the diagonal: $N\delta(2 + \log N)$.

The harmonic sum $1 + \frac12 + \dots + \frac1n \le 1 + \log n$ is where the logarithm comes from: the many tubes at small angles to a given one each overlap it a lot.`,
      concepts: ['harmonic'],
      check: {
        prompt: r`Which tubes contribute most to the overlap sum?`,
        options: [
          r`Pairs at small angles, whose overlap $\delta^2/\sin\theta$ is large`,
          r`Pairs at right angles`,
          r`All pairs contribute equally`,
        ],
        answer: 0,
        explain: r`Overlap $\approx \delta^2 N / (2k)$ is largest for $k = 1$, neighbouring directions. Summing $1/k$ over all $k$ gives the $\log N$.`,
      },
    },
    {
      title: 'Little overlap, large union',
      claim: r`The union $U = T_0 \cup \dots \cup T_{N-1}$ has area $|U| \ge \dfrac{N\delta}{2 + \log N} \ge \dfrac{1}{2(2 + \log(1/\delta))}$.`,
      why: r`Let $f = \sum_i 1_{T_i}$. Then $\int f = N\delta$ and $\int f^2 = \sum_{i,j}|T_i \cap T_j|$. Cauchy–Schwarz with $f$ and $1_U$ gives $(N\delta)^2 \le |U| \cdot N\delta(2 + \log N)$.`,
      detail: r`Why $\int f^2$ is the overlap sum: $f^2 = \sum_{i,j} 1_{T_i} 1_{T_j} = \sum_{i,j} 1_{T_i \cap T_j}$, and integrating an indicator gives the area.

Then divide: $|U| \ge \frac{(N\delta)^2}{N\delta(2 + \log N)} = \frac{N\delta}{2 + \log N}$. Finally $N\delta \ge \tfrac12$ and $N \le 1/\delta$.

Read as a picture: $f(x)$ counts how many tubes pass through $x$. Cauchy–Schwarz says that if the tubes' total area is squeezed into a small set, $f$ must be large on it, so many pairs must overlap. Step 3 said they can't.`,
      concepts: ['cauchyschwarz'],
      check: {
        prompt: r`If all $N$ tubes were the same tube, what would $\int f^2$ be?`,
        options: [r`$N^2\delta$`, r`$N\delta$`, r`$\delta$`],
        answer: 0,
        explain: r`Then $f = N$ on one tube of area $\delta$, so $\int f^2 = N^2 \delta$, and Cauchy–Schwarz gives only $|U| \ge \delta$, which is correct. Different directions are what keep the overlap small.`,
      },
    },
    {
      title: 'Dimension 2',
      claim: r`If $M$ discs of radius $\delta$ cover $K$, then $M \ge \dfrac{\delta^{-2}}{8\pi(2 + \log(1/\delta))}$. So $\log M / \log(1/\delta) \to 2$: $K$ has Minkowski dimension $2$. $\blacksquare$`,
      cited: r`Hausdorff dimension 2: Davies, 1971. The logarithm is needed: Keich, 1999`,
      why: r`Enlarging the discs to radius $2\delta$ covers every point within $\delta$ of $K$, which includes $U$. So $4\pi\delta^2 M \ge |U|$. Taking logs, $\log M \ge 2\log(1/\delta) - O(\log\log(1/\delta))$, and a bounded set can't need more than about $\delta^{-2}$ discs.`,
      detail: r`So $\delta$-neighbourhoods of Kakeya sets in the plane can shrink, which the previous proof shows they do, but only at the rate $1/\log(1/\delta)$: far too slowly to lower the dimension. Keich showed that rate is attained, so the logarithm can't be removed.

Hausdorff dimension, which allows discs of different sizes in the same cover, is harder. Davies proved it is also $2$ in 1971.

**In three dimensions** the same argument gives only dimension $2$: two tubes of width $\delta$ in space overlap in at most about $\delta^3/\sin\theta$, but there are about $\delta^{-2}$ directions, and the overlap sum is now too large. Pushing from $2$ to $3$ took until 2025. The destination of this path is that story.`,
      concepts: ['dimension'],
    },
  ],
  takeaway: r`Tubes in different directions overlap little, and Cauchy–Schwarz turns little overlap into a large union. So a Kakeya set in the plane, though it can have area zero, is two-dimensional.`,
  sources: [
    { label: 'Kakeya set (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kakeya_set' },
    { label: 'Minkowski–Bouligand dimension (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Minkowski%E2%80%93Bouligand_dimension' },
  ],
};
