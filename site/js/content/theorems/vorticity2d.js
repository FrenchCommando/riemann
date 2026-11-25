import { svg, text, arrowLine } from '../figures.js';

const r = String.raw;

// A 2D Gaussian vortex: u = (−y, x)·e^{−r²}, drawn as arrows on a grid.
const vortexArrows = [];
for (let i = -5; i <= 5; i++) {
  for (let j = -5; j <= 5; j++) {
    const x = i / 2.2, y = j / 2.2, g = Math.exp(-(x * x + y * y));
    const ux = -y * g, uy = x * g, s = 52;
    if (Math.hypot(ux, uy) < 0.05) continue;
    const cx = 150 + 26 * i, cy = 150 - 26 * j;
    vortexArrows.push(arrowLine(cx - (s * ux) / 2, cy + (s * uy) / 2, cx + (s * ux) / 2, cy - (s * uy) / 2, 'f-vec', 6));
  }
}
const vortex = svg('0 0 300 300', 'Arrows of a single two-dimensional vortex, circulating counterclockwise, fastest at a ring around the centre and fading far away',
  ...vortexArrows, text(150, 290, 'u = (−y, x) e^(−r²)', 'f-pt'));

export default {
  id: 'vorticity2d',
  field: 'Analysis',
  title: '2D flows stay smooth: the vorticity bound',
  attribution: 'Ladyzhenskaya, 1959 (Navier–Stokes); Wolibner 1933 and Yudovich 1963 (Euler)',
  statement: r`For the 2D Navier–Stokes equations on the torus, the vorticity $\omega = \partial_1 u_2 - \partial_2 u_1$ satisfies
$$\frac{d}{dt}\,\frac12\int \omega^2 \;=\; -\nu\int |\nabla\omega|^2 \;\le\; 0,$$
and $\int |\nabla u|^2 = \int \omega^2$. So the size of the velocity gradients never exceeds its initial value, which rules out blow-up in 2D.`,
  figure: {
    svgs: [vortex],
    caption: r`A 2D vortex. In two dimensions vorticity is a single number at each point; the flow can carry it around and diffuse it, but this proof shows it can't amplify it.`,
  },
  prereqs: ['vorticity', 'vectorcalc', 'calculus'],
  requiresTheorems: ['energy'],
  intro: r`The energy identity bounds $\int |u|^2$, but that is too weak to stop small scales from forming. In 2D there is a second bound, one derivative stronger: the vorticity can't grow. That extra derivative is exactly what scaling demanded, and it's why the 2D problem was solved in 1959 while 3D is a Millennium problem.`,
  steps: [
    {
      title: 'The nonlinearity in 2D',
      claim: r`$(u\cdot\nabla)u = \nabla\big(\tfrac12|u|^2\big) + \omega\,u^\perp$, where $u^\perp = (-u_2, u_1)$.`,
      why: r`Check the first component: the right side is $u_1\partial_1u_1 + u_2\partial_1u_2 - u_2(\partial_1 u_2 - \partial_2 u_1) = u_1\partial_1 u_1 + u_2\partial_2 u_1$, which is the first component of $(u\cdot\nabla)u$. The second is the same with the roles swapped.`,
      detail: r`The point of the identity: a gradient term will be invisible after taking the curl (next step), so all of the nonlinearity's effect on vorticity sits in $\omega\,u^\perp$.

Second component, for the record: $\partial_2(\tfrac12|u|^2) + \omega u_1 = u_1\partial_2 u_1 + u_2\partial_2u_2 + u_1(\partial_1u_2 - \partial_2 u_1) = u_1\partial_1u_2 + u_2\partial_2 u_2$. ✓`,
      concepts: ['vectorcalc'],
    },
    {
      title: 'The vorticity equation',
      claim: r`$\partial_t\omega + u\cdot\nabla\omega = \nu\Delta\omega$.`,
      why: r`Take the 2D curl ($F \mapsto \partial_1 F_2 - \partial_2 F_1$) of the Navier–Stokes equation. Gradients disappear, so the pressure and $\nabla(\frac12|u|^2)$ go, and $\operatorname{curl}(\omega u^\perp) = \nabla\cdot(\omega u) = u\cdot\nabla\omega$ because $\nabla\cdot u = 0$.`,
      detail: r`Term by term: $\operatorname{curl}\partial_t u = \partial_t\omega$; $\operatorname{curl}\nabla(\cdot) = 0$ since mixed partials commute; $\operatorname{curl}\Delta u = \Delta\omega$. For the last term, with $F = \omega u^\perp = (-\omega u_2, \omega u_1)$:
$$\partial_1(\omega u_1) - \partial_2(-\omega u_2) = \nabla\cdot(\omega u) = u\cdot\nabla\omega + \omega\,\nabla\cdot u = u\cdot\nabla\omega.$$

Read the equation: vorticity is **carried along** by the flow ($u\cdot\nabla\omega$) and **diffused** ($\nu\Delta\omega$). Nothing on the right can create it. In particular, the largest value of $|\omega|$ can only go down.`,
      concepts: ['vorticity', 'vectorcalc'],
      check: {
        prompt: r`Why does the pressure disappear from the vorticity equation?`,
        options: [
          r`It enters as a gradient $\nabla p$, and the curl of a gradient is zero`,
          r`Because the pressure is constant in 2D`,
          r`Because $\nu \gt 0$`,
        ],
        answer: 0,
        explain: r`$\partial_1\partial_2 p - \partial_2\partial_1 p = 0$. The pressure is far from constant, but it never affects vorticity directly.`,
      },
    },
    {
      title: 'Enstrophy only goes down',
      claim: r`$\displaystyle \frac{d}{dt}\,\frac12\int\omega^2 = -\nu\int|\nabla\omega|^2 \le 0.$`,
      why: r`The same three moves as the energy identity: multiply by $\omega$ and integrate; the transport term gives $\int u\cdot\nabla(\tfrac12\omega^2) = -\int \tfrac12\omega^2\,\nabla\cdot u = 0$; the diffusion term integrates by parts to $-\nu\int|\nabla\omega|^2$.`,
      detail: r`$\int \omega\,\partial_t\omega = \frac{d}{dt}\frac12\int\omega^2$. Then
- $\int \omega\,(u\cdot\nabla\omega) = \int u\cdot\nabla\big(\tfrac12\omega^2\big) = 0$, integrating by parts and using $\nabla\cdot u = 0$;
- $\nu\int\omega\,\Delta\omega = -\nu\int|\nabla\omega|^2$.

$\int\omega^2$ is called the **enstrophy**. So in 2D there are two decreasing quantities, energy and enstrophy, where 3D has only one.`,
      concepts: ['vectorcalc', 'calculus'],
    },
    {
      title: 'Enstrophy controls all the gradients',
      claim: r`On the torus, for divergence-free $u$: $\displaystyle \int|\nabla u|^2 = \int\omega^2$.`,
      why: r`Expand $\omega^2 = (\partial_1u_2)^2 + (\partial_2u_1)^2 - 2\,\partial_1u_2\,\partial_2u_1$. Integrating by parts twice, $\int\partial_1u_2\,\partial_2u_1 = \int\partial_1u_1\,\partial_2u_2 = -\int(\partial_1u_1)^2$, using $\partial_2u_2 = -\partial_1u_1$.`,
      detail: r`Moving $\partial_1$ off $u_2$ and onto $\partial_2 u_1$, then $\partial_2$ off that and onto $u_2$:
$$\int\partial_1u_2\,\partial_2u_1 = -\int u_2\,\partial_1\partial_2u_1 = \int \partial_2 u_2\,\partial_1u_1.$$
Incompressibility gives $\partial_2 u_2 = -\partial_1 u_1$, so this is $-\int(\partial_1u_1)^2$. Therefore
$$\int\omega^2 = \int(\partial_1u_2)^2 + (\partial_2u_1)^2 + 2(\partial_1u_1)^2 = \int(\partial_1u_2)^2 + (\partial_2u_1)^2 + (\partial_1u_1)^2 + (\partial_2u_2)^2,$$
using $(\partial_2u_2)^2 = (\partial_1u_1)^2$ once more. The right side is $\int|\nabla u|^2$, the sum of all four squared partial derivatives. $\blacksquare$`,
      concepts: ['vectorcalc', 'calculus'],
      check: {
        prompt: r`Which property of the flow did this identity use?`,
        options: [r`Incompressibility, $\partial_1 u_1 + \partial_2 u_2 = 0$`, r`That the flow is a rotation`, r`That the viscosity is small`],
        answer: 0,
        explain: r`It is used twice: to swap $\partial_2 u_2$ for $-\partial_1 u_1$. For a compressible flow, $\int |\nabla u|^2$ also includes the divergence, which vorticity can't see.`,
      },
    },
    {
      title: 'Why this beats scaling in 2D',
      claim: r`Under the zoom $u \mapsto \lambda u(\lambda x, \lambda^2 t)$, the 2D enstrophy is multiplied by $\lambda^2$. A solution concentrating at small scales would need unbounded enstrophy, but enstrophy is bounded by its initial value. With this bound, solutions stay smooth for all time.`,
      cited: r`Ladyzhenskaya, 1959, for the bootstrap from the enstrophy bound to full smoothness`,
      why: r`$|\nabla u_\lambda|^2$ picks up $\lambda^4$ (one $\lambda$ from the amplitude and one from the derivative, squared), and the area element $\lambda^{-2}$: net $\lambda^2$. Zooming in makes enstrophy larger, so a bounded enstrophy forbids zooming in indefinitely.`,
      detail: r`This is the gap the energy proof identified, closed. Energy, which scales like $\lambda^{-1}$ in 3D and $\lambda^0$ in 2D, was not strong enough to stop concentration in 3D. In 2D the enstrophy bound is a full derivative stronger, and turning it into bounds on every higher derivative is a routine (if lengthy) bootstrap, cited here.

What makes 2D special is the vorticity equation itself: vorticity is only transported and diffused. In 3D, vorticity is a vector, and its equation has one extra term, $(\omega\cdot\nabla)u$, which **can** create vorticity. That's the next stop.`,
      concepts: ['vorticity'],
      check: {
        prompt: r`Under the zoom by $\lambda = 10$, how does the 2D enstrophy change?`,
        options: [r`Multiplied by $100$`, r`Divided by $100$`, r`Unchanged`],
        answer: 0,
        explain: r`Gradients squared gain $10^4$, area loses $10^2$: net $\times 100$. Unchanged is the 2D energy, which is critical.`,
      },
    },
  ],
  takeaway: r`In 2D vorticity is only carried and diffused, so it can't grow; its size controls every velocity gradient, which beats scaling and keeps flows smooth.`,
};
