const r = String.raw;

export default {
  id: 'pythagoras',
  field: 'Geometry',
  title: 'The Pythagorean theorem',
  attribution: 'Known in Babylon c. 1800 BC; proof in Euclid I.47',
  statement: r`In a right triangle with legs $a, b$ and hypotenuse $c$: $\ a^2 + b^2 = c^2$.`,
  prereqs: ['area'],
  intro: r`There are hundreds of proofs. This one, by rearrangement, needs nothing but areas and angle sums: compute the area of one square in two different ways.`,
  steps: [
    {
      title: 'Build a big square',
      claim: r`Make a square of side $a + b$ and place four copies of the triangle in its corners, each with its legs along two sides of the square.`,
      why: r`Each side of the big square is split into a piece of length $a$ and a piece of length $b$. The four hypotenuses then form a quadrilateral in the middle with all four sides equal to $c$.`,
      detail: r`Go around the big square: on each side, mark off $a$ from one corner, leaving $b$. Put a copy of the triangle in each corner so that it uses the $a$-piece of one side and the $b$-piece of the next. The four triangles don't overlap, and their hypotenuses (each of length $c$) bound a region in the middle.

So the big square is cut into **four triangles plus one inner quadrilateral with sides $c, c, c, c$**.`,
      concepts: ['area'],
    },
    {
      title: 'The inner shape is a square',
      claim: r`Each corner of the inner quadrilateral is a right angle.`,
      why: r`At each corner, on the straight side of the big square, three angles meet: $\alpha$, $\beta$ (from two triangles) and the inner angle $\theta$. They sum to $180^\circ$, and $\alpha + \beta = 90^\circ$, so $\theta = 90^\circ$.`,
      detail: r`Call the triangle's acute angles $\alpha$ and $\beta$. Since its angles sum to $180^\circ$ and one is $90^\circ$, we have $\alpha + \beta = 90^\circ$.

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
      why: r`Expand $(a+b)^2 = a^2 + 2ab + b^2$ and cancel $2ab$ from both sides.`,
      detail: r`$$a^2 + 2ab + b^2 = c^2 + 2ab \;\Longrightarrow\; a^2 + b^2 = c^2. \qquad \blacksquare$$

The $2ab$ — the four triangles — appears on both sides and cancels. Geometrically: remove the four triangles from the big square and what remains is $c^2$; rearrange the same four triangles into two $a \times b$ rectangles instead, and what remains is $a^2 + b^2$.`,
      concepts: [],
      check: {
        prompt: r`A right triangle has legs $5$ and $12$. What is the hypotenuse?`,
        options: [r`$13$`, r`$17$`, r`$\sqrt{119}$`],
        answer: 0,
        explain: r`$25 + 144 = 169 = 13^2$.`,
      },
    },
    {
      title: 'What the proof used',
      claim: r`The proof relies on the angle sum $180^\circ$ — i.e. on Euclid's parallel postulate.`,
      why: r`On a sphere, triangle angles sum to more than $180^\circ$ and the theorem fails.`,
      detail: r`Take the triangle on the Earth with one corner at the North Pole and two on the equator, a quarter-turn apart. All three angles are $90^\circ$, and all three sides have the same length, so $a^2 + b^2 = 2c^2 \ne c^2$.

The converse is also true (if $a^2 + b^2 = c^2$ then the angle opposite $c$ is right), and the theorem generalises to the law of cosines $c^2 = a^2 + b^2 - 2ab\cos\gamma$.`,
      concepts: ['area'],
    },
  ],
  takeaway: r`Compute one quantity (an area) in two ways and equate them — "double counting".`,
};
