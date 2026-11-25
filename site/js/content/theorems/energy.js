import { svg, path, text, line } from '../figures.js';

const r = String.raw;

// A velocity profile f(x) and its rescaling 3 f(3x): taller and narrower.
const prof = (lam) => {
  const pts = [];
  for (let x = -3; x <= 3.0001; x += 0.02) pts.push([150 + 45 * x, 170 - 40 * lam * Math.exp(-((lam * x) ** 2))]);
  return pts;
};
const scaling = svg('0 0 300 200', 'A smooth bump of height 1 and its rescaling: three times taller and three times narrower',
  path('M10 170H290', 'f-axis'),
  line(prof(1), 'f-vec'),
  line(prof(3), 'f-curve'),
  text(228, 140, 'u', 'f-v'), text(186, 52, 'u', 'f-v f-acc'), text(197, 60, 'λ', 'f-sm f-acc'),
  text(150, 188, 'x', 'f-sm'));

export default {
  id: 'energy',
  field: 'Analysis',
  title: 'Navier–Stokes: energy only goes down, and why that isn\'t enough',
  attribution: 'Jean Leray, 1934; the starting point of every Navier–Stokes theory',
  statement: r`A smooth, periodic, incompressible solution of the Navier–Stokes equations with viscosity $\nu \gt 0$ and no forcing satisfies
$$\frac{d}{dt}\, \frac12\int |u|^2\,dx \;=\; -\nu \int |\nabla u|^2\,dx \;\le\; 0.$$
But the energy is **supercritical**: under the equation's scaling symmetry it shrinks at small scales, so it cannot rule out blow-up.`,
  figure: {
    svgs: [scaling],
    caption: r`The scaling $u \mapsto \lambda u(\lambda x, \lambda^2 t)$ (here $\lambda = 3$) maps solutions to solutions: speeds grow by $\lambda$ while the region shrinks by $\lambda$ in each of three directions, so the energy changes by $\lambda^2 \cdot \lambda^{-3} = 1/\lambda$.`,
  },
  prereqs: ['calculus', 'vectorcalc'],
  intro: r`The Navier–Stokes equations describe a viscous, incompressible fluid. The Millennium problem asks whether smooth solutions in 3D stay smooth forever. This proof gives the one bound everyone has, the energy identity, and then shows by a scaling argument why it falls short: that gap is the whole difficulty.`,
  steps: [
    {
      title: 'The equations',
      claim: r`$\partial_t u + (u \cdot \nabla) u = -\nabla p + \nu \Delta u$ and $\nabla \cdot u = 0$, for velocity $u(x, t) \in \mathbb{R}^3$ and pressure $p(x, t)$, with $x$ in the 3-torus.`,
      why: r`Newton's law for each fluid parcel: acceleration (following the flow) equals the pressure force plus viscous friction. $\nabla \cdot u = 0$ says the fluid is incompressible. Periodic in space means no boundary terms.`,
      detail: r`Reading the terms:
- $\partial_t u + (u\cdot\nabla)u$ is the acceleration of a fluid parcel as it moves (the "material derivative").
- $-\nabla p$ pushes fluid from high to low pressure. The pressure is not given: it is whatever keeps $\nabla \cdot u = 0$.
- $\nu\Delta u$ is viscosity: it diffuses velocity, smoothing it out.

The energy is $E(t) = \frac12 \int |u(x, t)|^2\,dx$, half the integral of the squared speed.`,
      concepts: ['vectorcalc'],
    },
    {
      title: 'Differentiate the energy',
      claim: r`$\displaystyle \frac{dE}{dt} = \int u \cdot \big(-(u\cdot\nabla)u - \nabla p + \nu\Delta u\big)\,dx$.`,
      why: r`$\frac{d}{dt}\frac12 |u|^2 = u \cdot \partial_t u$, then substitute $\partial_t u$ from the equation.`,
      detail: r`For smooth solutions we can differentiate under the integral: $\frac{d}{dt}\frac12\int |u|^2 = \int u \cdot \partial_t u$ (chain rule applied to each component: $\frac{d}{dt}\frac12 u_i^2 = u_i\, \partial_t u_i$). Then replace $\partial_t u$ using the equation. Three terms remain; we show the first two vanish.`,
      concepts: ['calculus'],
    },
    {
      title: 'Pressure does no work',
      claim: r`$\displaystyle \int u \cdot \nabla p\,dx = 0$.`,
      why: r`Integrate by parts: $\int u \cdot \nabla p = -\int p\, (\nabla \cdot u) = 0$.`,
      detail: r`On the torus there are no boundary terms, so $\int u_i\, \partial_i p = -\int (\partial_i u_i)\, p$ for each $i$. Summing over $i$ gives $-\int p\,\nabla\cdot u$, which is $0$ by incompressibility.

Physically: in an incompressible fluid, pressure only redirects the flow; it can't pump energy in or out of a periodic box.`,
      concepts: ['vectorcalc'],
    },
    {
      title: 'The nonlinear term does no work either',
      claim: r`$\displaystyle \int u \cdot (u\cdot\nabla)u\,dx = 0$.`,
      why: r`$u \cdot (u\cdot\nabla)u = (u\cdot\nabla)\tfrac12|u|^2 = u \cdot \nabla\big(\tfrac12|u|^2\big)$, and the previous step with $p$ replaced by $\tfrac12 |u|^2$ makes it vanish.`,
      detail: r`Component by component, $u \cdot (u\cdot\nabla)u = \sum_i u_i \sum_j u_j\,\partial_j u_i = \sum_j u_j\, \partial_j\big(\tfrac12\sum_i u_i^2\big)$, since $u_i\,\partial_j u_i = \partial_j(\tfrac12 u_i^2)$. That is $u \cdot \nabla(\tfrac12 |u|^2)$, and integrating by parts as before gives $-\int \tfrac12|u|^2\, \nabla\cdot u = 0$.

This is the crux of the whole problem: the nonlinearity, which is what could cause blow-up, is **invisible** to the energy. It moves energy between scales (from large eddies to small ones) without creating or destroying it.`,
      concepts: ['vectorcalc', 'calculus'],
      check: {
        prompt: r`Which single property makes both the pressure term and the nonlinear term vanish?`,
        options: [r`Incompressibility, $\nabla \cdot u = 0$`, r`Viscosity, $\nu \gt 0$`, r`Smallness of the initial data`],
        answer: 0,
        explain: r`Both become $\int u \cdot \nabla(\text{something})$, which integrates by parts to $-\int (\text{something})\,\nabla \cdot u = 0$. Viscosity enters only through the last term.`,
      },
    },
    {
      title: 'Viscosity dissipates',
      claim: r`$\displaystyle \frac{dE}{dt} = \nu\int u \cdot \Delta u = -\nu \int |\nabla u|^2 \le 0$, so $\displaystyle E(t) + \nu\int_0^t\!\!\int |\nabla u|^2 = E(0)$. $\qquad\blacksquare$`,
      why: r`Integrate by parts once in each variable: $\int u_i\, \partial_j^2 u_i = -\int (\partial_j u_i)^2$. Then integrate in time.`,
      detail: r`$\int u \cdot \Delta u = \sum_{i, j}\int u_i\,\partial_j\partial_j u_i = -\sum_{i,j}\int (\partial_j u_i)^2 = -\int |\nabla u|^2$, where $|\nabla u|^2$ is the sum of squares of all nine partial derivatives.

So energy decreases, at a rate equal to $\nu$ times the "enstrophy" $\int |\nabla u|^2$. Integrating from $0$ to $t$ gives the **energy equality**. Two bounds follow, uniformly in time: $E(t) \le E(0)$ and $\nu\int_0^\infty\!\int|\nabla u|^2 \le E(0)$.

With a force $f$ on the right side of the equation, the same computation gives $\frac{dE}{dt} = -\nu\int|\nabla u|^2 + \int f\cdot u$: forcing is the only way energy enters.`,
      concepts: ['calculus'],
    },
    {
      title: 'The scaling symmetry',
      claim: r`On $\mathbb{R}^3$, if $(u, p)$ solves Navier–Stokes then so does $u_\lambda(x, t) = \lambda\, u(\lambda x, \lambda^2 t)$, $p_\lambda(x, t) = \lambda^2 p(\lambda x, \lambda^2 t)$, for every $\lambda \gt 0$.`,
      why: r`Every term picks up the same factor $\lambda^3$: $\partial_t u_\lambda$ gets $\lambda \cdot \lambda^2$, $(u_\lambda\cdot\nabla)u_\lambda$ gets $\lambda\cdot\lambda\cdot\lambda$, $\nabla p_\lambda$ gets $\lambda^2\cdot\lambda$, and $\Delta u_\lambda$ gets $\lambda\cdot\lambda^2$. Divergence-free is preserved.`,
      detail: r`By the chain rule, each $\partial_t$ on $u(\lambda x, \lambda^2 t)$ brings out $\lambda^2$ and each $\partial_j$ brings out $\lambda$. So, evaluating the right-hand sides at $(\lambda x, \lambda^2 t)$:
- $\partial_t u_\lambda = \lambda^3\,\partial_t u$
- $(u_\lambda\cdot\nabla)u_\lambda = \lambda^3\,(u\cdot\nabla)u$
- $\nabla p_\lambda = \lambda^3\,\nabla p$
- $\nu\Delta u_\lambda = \lambda^3\,\nu\Delta u$

The equation for $u_\lambda$ is the equation for $u$ multiplied by $\lambda^3$. (On the torus the same holds with the period rescaled, so we state it on $\mathbb{R}^3$.) Large $\lambda$ zooms in: the same flow pattern, faster and smaller.`,
      concepts: ['calculus', 'vectorcalc'],
      check: {
        prompt: r`What factor does $\partial_t u_\lambda$ pick up, for $u_\lambda(x,t) = \lambda u(\lambda x, \lambda^2 t)$?`,
        options: [r`$\lambda^3$`, r`$\lambda^2$`, r`$\lambda$`],
        answer: 0,
        explain: r`One $\lambda$ from the amplitude, and $\lambda^2$ from the chain rule on the time variable $\lambda^2 t$.`,
      },
    },
    {
      title: 'Why energy is not enough',
      claim: r`$\displaystyle \int |u_\lambda(x, t)|^2\,dx = \frac{1}{\lambda}\int |u(y, \lambda^2 t)|^2\,dy$: a solution squeezed to a small scale has small energy.`,
      why: r`Substitute $y = \lambda x$, so $dx = \lambda^{-3}dy$: the amplitude contributes $\lambda^2$ and the volume $\lambda^{-3}$.`,
      detail: r`$\int |\lambda u(\lambda x)|^2\,dx = \lambda^2 \int |u(y)|^2\,\lambda^{-3}\,dy = \lambda^{-1}\int|u(y)|^2\,dy$.

Think of a hypothetical blow-up: a flow pattern that repeatedly copies itself at smaller and smaller scales $\lambda \to \infty$, faster each time. Its energy goes **down** at each stage, so the energy bound, the only global bound we have, cannot rule it out. In the jargon, the energy is **supercritical** for 3D Navier–Stokes. (In 2D the same computation gives $\lambda^2\cdot\lambda^{-2} = 1$: energy is critical, and 2D solutions are known to stay smooth.)

Every route to the Millennium problem either finds a quantity that beats this scaling, or builds a solution that exploits it. The roadmap entry covers what has been tried, and the 2026 claim.`,
      concepts: ['calculus'],
      check: {
        prompt: r`Zoom in by $\lambda = 100$. What happens to the energy?`,
        options: [r`It is divided by $100$`, r`It is multiplied by $100$`, r`It is unchanged`],
        answer: 0,
        explain: r`Speeds go up by $100$ (energy $\times 10^4$), volume goes down by $100^3$: net $\times 10^{-2}$. Unchanged would be the critical case, which is what happens in 2D.`,
      },
    },
  ],
  takeaway: r`Conservation laws give bounds; scaling tells you whether those bounds can control small scales. For 3D Navier–Stokes, the energy bound loses to scaling by one power of $\lambda$.`,
};
