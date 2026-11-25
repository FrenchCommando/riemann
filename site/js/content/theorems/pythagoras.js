import { svg, poly, path, text, sq, arrowDefs, arrow } from '../figures.js';

const r = String.raw;

// ---------- figures (a = 120, b = 160 user units, so a : b : c = 3 : 4 : 5) ----------

const squaresOnSides = svg('50 30 320 350', 'Right triangle with legs a, b and hypotenuse c, with a square drawn on each side',
  poly('60,160 150,160 150,250 60,250', 'f-sq2'),
  poly('150,250 270,250 270,370 150,370', 'f-sq2'),
  poly('150,160 270,250 360,130 240,40', 'f-sq'),
  poly('150,160 150,250 270,250', 'f-tri'),
  path('M150 238H162V250', 'f-mark'),
  text(105, 205, sq('a'), 'f-big'), text(210, 310, sq('b'), 'f-big'), text(255, 145, sq('c'), 'f-big'),
  text(161, 218, 'a', 'f-sm'), text(228, 241, 'b', 'f-sm'), text(196, 212, 'c', 'f-sm'));

// Big square of side a + b, four triangles in the corners, tilted square of side c inside.
const tilted = (label, ...extra) => svg('0 0 340 340', label,
  poly('30,30 150,30 30,190', 'f-tri'), poly('310,30 310,150 150,30', 'f-tri'),
  poly('310,310 190,310 310,150', 'f-tri'), poly('30,310 30,190 190,310', 'f-tri'),
  poly('150,30 310,150 190,310 30,190', 'f-sq'),
  text(90, 16, 'a'), text(230, 16, 'b'), text(326, 90, 'a'), text(326, 230, 'b'),
  text(250, 326, 'a'), text(110, 326, 'b'), text(14, 250, 'a'), text(14, 110, 'b'),
  text(104, 124, 'c'), text(170, 172, sq('c'), 'f-big'),
  ...extra);

const bigSquare = tilted('A square of side a + b with a copy of the triangle in each corner; the four hypotenuses enclose a tilted square of side c');

// Angles meeting at the point where two triangles touch the top side.
const cornerAngles = tilted('The same square, with the angles beta, theta and alpha marked where two triangles meet the top side',
  path('M128 30A22 22 0 0 0 136.8 47.6', 'f-arc'),
  path('M136.8 47.6A22 22 0 0 0 167.6 43.2', 'f-arc'),
  path('M167.6 43.2A22 22 0 0 0 172 30', 'f-arc'),
  text(120, 45, 'β', 'f-sm f-acc'), text(155, 68, 'θ', 'f-sm f-acc'), text(182, 41, 'α', 'f-sm f-acc'));

// Same four triangles as two a×b rectangles, leaving squares a² and b².
const rearranged = svg('0 0 340 340', 'The same square with the four triangles rearranged into two rectangles, leaving a square of side a and a square of side b',
  poly('150,30 310,30 150,150', 'f-tri'), poly('310,30 310,150 150,150', 'f-tri'),
  poly('30,150 150,150 30,310', 'f-tri'), poly('150,150 150,310 30,310', 'f-tri'),
  poly('30,30 150,30 150,150 30,150', 'f-sq2'), poly('150,150 310,150 310,310 150,310', 'f-sq2'),
  text(90, 16, 'a'), text(230, 16, 'b'), text(14, 90, 'a'), text(14, 230, 'b'),
  text(90, 92, sq('a'), 'f-big'), text(230, 232, sq('b'), 'f-big'));

// Triangle ABC (right angle at C), altitude CH: AH = q = 192, HB = p = 108, c = 300.
const altitude = svg('15 50 355 215', 'Right triangle ABC with the altitude from C meeting the hypotenuse at H, splitting it into q next to A and p next to B',
  poly('40,220 340,220 232,76', 'f-tri'),
  path('M232 76V220', 'f-alt'),
  path('M232 208H244V220', 'f-mark'),
  path('M222.4 83.2L229.6 92.8L239.2 85.6', 'f-mark'),
  text(124, 138, 'b'), text(300, 138, 'a'), text(136, 240, 'q'), text(286, 240, 'p'),
  text(26, 226, 'A', 'f-pt'), text(352, 226, 'B', 'f-pt'), text(232, 62, 'C', 'f-pt'), text(232, 242, 'H', 'f-pt'));

const vectors = svg('20 45 290 190', 'Vectors u and v at a right angle, head to tail, and their sum u + v',
  arrowDefs,
  path('M40 200H260', 'f-vec', arrow),
  path('M260 200V70', 'f-vec', arrow),
  path('M40 200L260 70', 'f-vec f-sum', arrow),
  path('M248 200V188H260', 'f-mark'),
  text(150, 218, 'u', 'f-v'), text(276, 135, 'v', 'f-v'), text(138, 118, 'u + v', 'f-v f-acc'));

// ---------- content ----------

export default {
  id: 'pythagoras',
  field: 'Geometry',
  title: 'The Pythagorean theorem',
  attribution: 'Known in Babylon c. 1800 BC; proof in Euclid I.47',
  statement: r`In a right triangle with legs $a, b$ and hypotenuse $c$: $\ a^2 + b^2 = c^2$.`,
  figure: {
    svgs: [squaresOnSides],
    caption: r`Read as areas: the squares on the two legs together have the area of the square on the hypotenuse.`,
  },
  prereqs: ['area', 'similar', 'vectors'],
  intro: r`There are hundreds of proofs. Here are three views of it: a picture proof that compares areas, a proof by similar triangles that comes down to two lines of algebra, and the vector identity that says what the theorem is really about.`,
  steps: [
    {
      title: 'Build a big square',
      claim: r`Make a square of side $a + b$ and place four copies of the triangle in its corners, each with its legs along two sides of the square.`,
      figure: {
        svgs: [bigSquare],
        caption: r`Each side of the big square is split into $a$ and $b$; the four hypotenuses, each of length $c$, enclose the inner shape.`,
      },
      why: r`Each side of the big square is split into a piece of length $a$ and a piece of length $b$. The four hypotenuses then form a quadrilateral in the middle with all four sides equal to $c$.`,
      detail: r`Go around the big square: on each side, mark off $a$ from one corner, leaving $b$. Put a copy of the triangle in each corner so that it uses the $a$-piece of one side and the $b$-piece of the next. The four triangles don't overlap, and their hypotenuses (each of length $c$) bound a region in the middle.

So the big square is cut into **four triangles plus one inner quadrilateral with sides $c, c, c, c$**.`,
      concepts: ['area'],
    },
    {
      title: 'The inner shape is a square',
      claim: r`Each corner of the inner quadrilateral is a right angle.`,
      figure: {
        svgs: [cornerAngles],
        caption: r`Where two triangles meet a side of the big square: $\beta + \theta + \alpha = 180^\circ$.`,
      },
      why: r`At each corner, on the straight side of the big square, three angles meet: $\alpha$, $\beta$ (from two triangles) and the inner angle $\theta$. They sum to $180^\circ$, and $\alpha + \beta = 90^\circ$, so $\theta = 90^\circ$.`,
      detail: r`Call the triangle's acute angles $\alpha$ (opposite $a$) and $\beta$ (opposite $b$). Since its angles sum to $180^\circ$ and one is $90^\circ$, we have $\alpha + \beta = 90^\circ$.

Each corner of the inner shape sits on a side of the big square. There, one triangle contributes $\alpha$ and the neighbouring one contributes $\beta$, and together with the inner angle $\theta$ they fill a straight angle:
$$\alpha + \theta + \beta = 180^\circ \;\Rightarrow\; \theta = 90^\circ.$$
Four equal sides and four right angles: the inner shape is a square of side $c$, area $c^2$.`,
      concepts: ['area'],
      check: {
        prompt: r`Why isn't "it has four equal sides" enough to say the inner shape is a square?`,
        options: [
          r`A rhombus has four equal sides but need not have right angles`,
          r`Four equal sides is enough`,
          r`Because $c$ might not be the longest side`,
        ],
        answer: 0,
        explain: r`A rhombus (a squashed square) has four equal sides and a smaller area than $c^2$. We need the angles too.`,
      },
    },
    {
      title: 'Count the area two ways',
      claim: r`$(a + b)^2 = c^2 + 4 \cdot \tfrac12 ab$.`,
      why: r`Left: the big square directly. Right: the same square as the inner square plus four triangles.`,
      detail: r`Area is additive, and the pieces exactly tile the big square with no overlap:
- big square: $(a+b)^2$
- inner square: $c^2$
- each triangle: $\frac12 ab$, four of them: $2ab$.

So $(a+b)^2 = c^2 + 2ab$.`,
      concepts: ['area'],
    },
    {
      title: 'Simplify',
      claim: r`$a^2 + b^2 = c^2$.`,
      figure: {
        svgs: [bigSquare, rearranged],
        caption: r`The same four triangles in the same square, arranged two ways. What's left over is $c^2$ on the left and $a^2 + b^2$ on the right.`,
      },
      why: r`Expand $(a+b)^2 = a^2 + 2ab + b^2$ and cancel $2ab$ from both sides.`,
      detail: r`$$a^2 + 2ab + b^2 = c^2 + 2ab \;\Longrightarrow\; a^2 + b^2 = c^2. \qquad \blacksquare$$

The $2ab$ — the four triangles — appears on both sides and cancels. That is the picture above: remove the four triangles from the big square and what remains is $c^2$; rearrange the same four triangles into two $a \times b$ rectangles instead, and what remains is $a^2 + b^2$.`,
      concepts: [],
      check: {
        prompt: r`A right triangle has legs $5$ and $12$. What is the hypotenuse?`,
        options: [r`$13$`, r`$17$`, r`$\sqrt{119}$`],
        answer: 0,
        explain: r`$25 + 144 = 169 = 13^2$.`,
      },
    },
    {
      title: 'Second proof: drop the altitude',
      claim: r`The altitude from the right angle splits the hypotenuse into $q + p = c$ and cuts the triangle into two smaller right triangles, both similar to the original.`,
      figure: {
        svgs: [altitude],
        caption: r`The altitude from $C$ meets the hypotenuse at $H$: $q = AH$ lies next to $b$, $p = HB$ next to $a$.`,
      },
      why: r`Each small triangle has a right angle at $H$ and shares one acute angle with the original, so all three angles match.`,
      detail: r`Label the triangle $ABC$ with the right angle at $C$, so $a = BC$, $b = AC$, $c = AB$, and let $H$ be the foot of the altitude from $C$. Then $q = AH$ and $p = HB$, with $q + p = c$.

- Triangle $HBC$ has a right angle at $H$ and shares the angle at $B$ with $ABC$.
- Triangle $AHC$ has a right angle at $H$ and shares the angle at $A$ with $ABC$.

Two equal angles force the third (the angle sum is $180^\circ$), so both small triangles are similar to $ABC$.`,
      concepts: ['similar'],
    },
    {
      title: 'Now it is just algebra',
      claim: r`$a^2 = cp$ and $b^2 = cq$, so $a^2 + b^2 = c(p + q) = c^2$.`,
      why: r`From $HBC \sim ABC$, comparing the side at $B$ with the hypotenuse: $\frac{p}{a} = \frac{a}{c}$. Likewise $\frac{q}{b} = \frac{b}{c}$ from $AHC \sim ABC$. Cross-multiply and add.`,
      detail: r`Similar triangles have equal ratios of corresponding sides. Match the sides by the angle they touch:
- In $HBC$ the side at $B$ is $p$ and the hypotenuse is $a$; in $ABC$ they are $a$ and $c$. So $\frac{p}{a} = \frac{a}{c}$, i.e. $a^2 = cp$.
- In $AHC$ the side at $A$ is $q$ and the hypotenuse is $b$; in $ABC$ they are $b$ and $c$. So $\frac{q}{b} = \frac{b}{c}$, i.e. $b^2 = cq$.

Add the two:
$$a^2 + b^2 = cp + cq = c\,(p + q) = c \cdot c = c^2. \qquad \blacksquare$$

No areas and no rearranging: once the similarity is set up, the theorem is two cross-multiplications and a factorisation.`,
      concepts: ['similar'],
      check: {
        prompt: r`In a $3$-$4$-$5$ triangle, how long is the piece $p$ of the hypotenuse next to the leg $a = 3$?`,
        options: [r`$\frac{9}{5}$`, r`$\frac{12}{5}$`, r`$\frac{16}{5}$`],
        answer: 0,
        explain: r`$a^2 = cp$ gives $p = \frac{a^2}{c} = \frac{9}{5}$, and then $q = \frac{16}{5}$, with $p + q = 5$. ($\frac{16}{5}$ is the piece next to $b$; $\frac{12}{5}$ is the altitude $\frac{ab}{c}$.)`,
      },
    },
    {
      title: 'The algebra underneath: vectors',
      claim: r`For vectors, $|u + v|^2 = |u|^2 + 2\,u \cdot v + |v|^2$. Perpendicular means $u \cdot v = 0$, and then $|u + v|^2 = |u|^2 + |v|^2$.`,
      figure: {
        svgs: [vectors],
        caption: r`The legs as vectors $u$ and $v$, head to tail; the hypotenuse is $u + v$.`,
      },
      why: r`Expand $(u + v) \cdot (u + v)$ exactly like $(x + y)^2$: the dot product distributes over addition and is symmetric. With the legs as $u, v$ the hypotenuse is $u + v$, and the cross term vanishes because the legs are perpendicular.`,
      detail: r`Take the legs as vectors $u$ (length $a$) and $v$ (length $b$), head to tail, so the hypotenuse is $u + v$ (length $c$). Using only that the dot product distributes and is symmetric:
$$c^2 = (u + v) \cdot (u + v) = u \cdot u + 2\,u \cdot v + v \cdot v = a^2 + 2\,u \cdot v + b^2.$$
The legs are perpendicular, so $u \cdot v = 0$ and $c^2 = a^2 + b^2$.

What this does and doesn't prove: in coordinates $|u|^2 = u_1^2 + u_2^2$ is itself Pythagoras along the axes, so in the plane this is not an independent proof. What it shows is the structure. The theorem is exactly the cross term $2\,u \cdot v$ vanishing, so it holds wherever lengths come from a dot product: in $\mathbb{R}^n$ (a box's space diagonal has $d^2 = x^2 + y^2 + z^2$), and for functions, where it becomes Parseval's identity in Fourier analysis.

If the angle between the sides is $\gamma$ instead of $90^\circ$, the head-to-tail vectors make an angle $180^\circ - \gamma$, so $u \cdot v = -ab\cos\gamma$ and the same expansion gives the law of cosines $c^2 = a^2 + b^2 - 2ab\cos\gamma$.`,
      concepts: ['vectors'],
      check: {
        prompt: r`A box measures $1 \times 2 \times 2$. How long is its space diagonal?`,
        options: [r`$3$`, r`$5$`, r`$\sqrt{5}$`],
        answer: 0,
        explain: r`Three mutually perpendicular edges, so $d^2 = 1 + 4 + 4 = 9$. ($\sqrt5$ is the diagonal of a $1 \times 2$ face; $5$ is the sum of the edges.)`,
      },
    },
    {
      title: 'What the proofs used',
      claim: r`The first two proofs rely on the angle sum $180^\circ$ — i.e. on Euclid's parallel postulate.`,
      why: r`On a sphere, triangle angles sum to more than $180^\circ$ and the theorem fails.`,
      detail: r`Take the triangle on the Earth with one corner at the North Pole and two on the equator, a quarter-turn apart. All three angles are $90^\circ$, and all three sides have the same length, so $a^2 + b^2 = 2c^2 \ne c^2$.

In the vector version the same assumption is hidden in the dot product: flat (Euclidean) space is exactly the setting where lengths come from one. The converse also holds: if $a^2 + b^2 = c^2$, the angle opposite $c$ is a right angle (set $\cos\gamma = 0$ in the law of cosines).`,
      concepts: ['area'],
    },
  ],
  takeaway: r`Compute one quantity in two ways and equate them: an area (first proof), a ratio (second). Underneath, the theorem says a cross term vanishes for perpendicular vectors.`,
};
