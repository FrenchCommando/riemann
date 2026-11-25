import { svg, path, text, line, arrowLine } from '../figures.js';

const r = String.raw;

// A vortex tube stretched: length ×4, radius ÷2 (same volume), vorticity ×4.
const tube = (cx, top, h, rad, label) => [
  path(`M${cx - rad} ${top}V${top + h}M${cx + rad} ${top}V${top + h}`, 'f-vec'),
  `<ellipse cx="${cx}" cy="${top}" rx="${rad}" ry="${rad / 3}" class="f-sq"/>`,
  `<ellipse cx="${cx}" cy="${top + h}" rx="${rad}" ry="${rad / 3}" class="f-line"/>`,
  path(`M${cx - rad * 0.75} ${top + h / 2 + 4}Q${cx} ${top + h / 2 + 4 + rad / 2.5} ${cx + rad * 0.75} ${top + h / 2 + 4}`, 'f-arc'),
  text(cx, top + h + 26, label, 'f-sm f-acc'),
].join('');
const stretching = svg('0 0 340 300', 'Left, a short wide vortex tube spinning with vorticity omega. Right, the same tube stretched to four times the length and half the radius, spinning with vorticity four omega',
  tube(80, 110, 60, 40, 'ω'),
  arrowLine(140, 140, 200, 140, 'f-curve', 8),
  text(170, 125, 'stretch', 'f-pt'),
  tube(260, 20, 240, 20, '4ω'),
  arrowLine(260, 14, 260, 2, 'f-thin', 5), arrowLine(260, 266, 260, 278, 'f-thin', 5));

// y' = y² (blows up at t = 1) against y' = y (grows forever but stays finite).
const T = 230, V = 22; // units per 1 on t and y axes
const riccati = [], expo = [];
for (let i = 0; i <= 400; i++) {
  const t = (1.2 * i) / 400;
  if (t < 0.92) riccati.push([T * t, -V * (1 / (1 - t))]);
  expo.push([T * t, -V * Math.exp(t)]);
}
const blowup = svg('-25 -290 330 320', 'Two curves starting at 1. The exponential e to the t, solving y prime equals y, grows gently. The curve 1 over 1 minus t, solving y prime equals y squared, shoots to infinity at t = 1, marked by a dashed vertical line',
  path(`M0 0H${T * 1.25}M0 0V-280`, 'f-axis'),
  path(`M${T} 0V-280`, 'f-alt'),
  line(expo, 'f-vec'),
  line(riccati, 'f-curve'),
  text(T, 14, 't = 1', 'f-pt'), text(-12, -V, '1', 'f-pt'),
  text(T * 1.1, -V * Math.exp(1.1) - 14, 'y′ = y', 'f-sm'),
  text(T * 0.74, -262, 'y′ = y²', 'f-sm f-acc'));

export default {
  id: 'stretching3d',
  field: 'Analysis',
  title: '3D is different: vortex stretching',
  attribution: 'Helmholtz, 1858 (vortex dynamics); Beale–Kato–Majda, 1984 (blow-up criterion)',
  statement: r`In 3D the vorticity $\omega = \nabla\times u$ obeys
$$\partial_t\omega + (u\cdot\nabla)\omega = (\omega\cdot\nabla)u + \nu\Delta\omega.$$
The **stretching term** $(\omega\cdot\nabla)u$ vanishes for 2D flows and can amplify vorticity in 3D. A smooth solution breaks down at a time $T^*$ only if $\int_0^{T^*}\max_x|\omega|\,dt = \infty$.`,
  figure: {
    svgs: [stretching],
    caption: r`Stretch a vortex tube to four times its length and it thins to half the radius (volume is conserved); its circulation is conserved too, so its spin rate quadruples. Nothing like this can happen in 2D.`,
  },
  prereqs: ['vorticity', 'vectorcalc', 'calculus'],
  requiresTheorems: ['vorticity2d'],
  intro: r`The 2D proof worked because vorticity could only be carried and diffused. In 3D one more term appears, and it's the one physicists see in every turbulent flow: vortex tubes stretched by the flow spin faster and thinner. This proof finds the term, shows exactly why 2D escapes it, and explains why it makes blow-up conceivable.`,
  steps: [
    {
      title: 'The 3D vorticity equation',
      claim: r`Taking the curl of Navier–Stokes gives $\partial_t\omega + (u\cdot\nabla)\omega = (\omega\cdot\nabla)u + \nu\Delta\omega$.`,
      cited: r`The vector identities $(u\cdot\nabla)u = \nabla(\tfrac12|u|^2) - u\times\omega$ and, for divergence-free $u$ and $\omega$, $\nabla\times(u\times\omega) = (\omega\cdot\nabla)u - (u\cdot\nabla)\omega$`,
      why: r`As in 2D, the curl removes every gradient (the pressure and $\nabla\frac12|u|^2$). What remains of the nonlinear term is $\nabla\times(\omega\times u) = (u\cdot\nabla)\omega - (\omega\cdot\nabla)u$, using $\nabla\cdot u = 0$ and $\nabla\cdot\omega = 0$ (a curl is always divergence-free).`,
      detail: r`The 2D identity $(u\cdot\nabla)u = \nabla(\frac12|u|^2) + \omega\,u^\perp$ is the special case: for a planar flow, $-u\times\omega$ with $\omega = (0, 0, \omega_3)$ is exactly $\omega_3\,u^\perp$.

The left side is again "vorticity carried by the flow". On the right, $\nu\Delta\omega$ diffuses it as before. The new term $(\omega\cdot\nabla)u$ is the derivative of the velocity **along the vortex lines**: where the flow pulls apart along the direction of spin, vorticity grows.`,
      concepts: ['vorticity', 'vectorcalc'],
    },
    {
      title: 'Why 2D escapes',
      claim: r`For a planar flow $u = (u_1(x_1, x_2), u_2(x_1, x_2), 0)$: $\ \omega = (0, 0, \omega_3)$ and $(\omega\cdot\nabla)u = \omega_3\,\partial_3 u = 0$.`,
      why: r`The only nonzero component of the curl is $\omega_3 = \partial_1u_2 - \partial_2u_1$, since nothing depends on $x_3$ and $u_3 = 0$. So $\omega\cdot\nabla = \omega_3\partial_3$, and $u$ does not depend on $x_3$.`,
      detail: r`Check the other components: $\omega_1 = \partial_2u_3 - \partial_3u_2 = 0 - 0$ and $\omega_2 = \partial_3u_1 - \partial_1u_3 = 0 - 0$.

Geometrically: in a planar flow the vortex lines point straight out of the plane, and nothing ever varies in that direction, so they can't be stretched. The 3D equation then reduces exactly to the 2D vorticity equation from the previous stop.`,
      concepts: ['vorticity'],
      check: {
        prompt: r`Why is the stretching term zero for planar flows?`,
        options: [
          r`Vorticity points out of the plane, and the flow doesn't vary in that direction`,
          r`Because the vorticity is zero in 2D`,
          r`Because viscosity cancels it`,
        ],
        answer: 0,
        explain: r`$(\omega\cdot\nabla)u = \omega_3\,\partial_3 u$, and $\partial_3 u = 0$. Planar flows certainly have vorticity; it just can't be stretched.`,
      },
    },
    {
      title: 'Stretching amplifies',
      claim: r`In the straining flow $u = \alpha\,(-\tfrac{x_1}{2}, -\tfrac{x_2}{2}, x_3)$, vorticity along the $x_3$-axis feels $(\omega\cdot\nabla)u = \alpha\,\omega$: it grows like $e^{\alpha t}$ until diffusion stops it.`,
      why: r`The strain is divergence-free ($-\frac\alpha2 - \frac\alpha2 + \alpha = 0$). For $\omega = (0, 0, \omega_3)$, $(\omega\cdot\nabla)u = \omega_3\,\partial_3 u = \omega_3\,(0, 0, \alpha) = \alpha\,\omega$.`,
      detail: r`So, following a fluid particle on the axis and ignoring diffusion, $\frac{d\omega_3}{dt} = \alpha\,\omega_3$: exponential growth. The flow squeezes inward ($-\frac\alpha2$ in $x_1, x_2$) and pulls out along the axis ($+\alpha$), stretching any vortex line along it, which is the figure above. It's the figure skater pulling in their arms: circulation is conserved while the radius shrinks.

With viscosity, the stretching can balance diffusion exactly: the **Burgers vortex** is a steady solution of Navier–Stokes in this strain, a vortex tube of width about $\sqrt{\nu/\alpha}$. Stretching sets the size of the smallest eddies in turbulence.`,
      concepts: ['vorticity', 'calculus'],
    },
    {
      title: 'Quadratic growth blows up',
      claim: r`The model equation $y' = y^2$, $y(0) = y_0 \gt 0$, has the solution $y = \dfrac{y_0}{1 - y_0 t}$, which is infinite at $t = 1/y_0$.`,
      figure: {
        svgs: [blowup],
        caption: r`$y' = y$ grows forever but is finite at every time; $y' = y^2$ reaches infinity at $t = 1$ (both start at $y = 1$).`,
      },
      why: r`Separate variables: $\frac{dy}{y^2} = dt$ gives $-\frac1y = t - \frac1{y_0}$. Check: $\frac{d}{dt}\frac{y_0}{1 - y_0t} = \frac{y_0^2}{(1-y_0t)^2} = y^2$.`,
      detail: r`Why this model: the stretching term $(\omega\cdot\nabla)u$ multiplies $\omega$ by a velocity gradient, and velocity gradients are typically about as large as the vorticity itself (on average they are exactly as large: $\int|\nabla u|^2 = \int|\omega|^2$ holds in 3D too, by the same integration by parts as in the previous proof). So, very roughly, $\frac{d}{dt}|\omega| \lesssim |\omega|^2$: a growth rate that increases with the size, like $y' = y^2$, rather than a fixed rate like the strain example.

This is only a caricature. The true equation has transport, diffusion and geometry (the stretching depends on how vortex lines are aligned with the strain), and they could prevent the blow-up. Whether they always do is the 3D question.`,
      concepts: ['calculus'],
      check: {
        prompt: r`For $y' = y^2$ with $y(0) = 4$, when does $y$ become infinite?`,
        options: [r`$t = \frac14$`, r`$t = 4$`, r`Never`],
        answer: 0,
        explain: r`$y = \frac{4}{1 - 4t}$, infinite at $t = \frac14$. Larger data blow up sooner.`,
      },
    },
    {
      title: 'Blow-up means vorticity blows up',
      claim: r`A smooth solution on $[0, T^*)$ can be continued past $T^*$ unless $\displaystyle\int_0^{T^*}\max_x|\omega(x, t)|\,dt = \infty$.`,
      cited: r`Beale, Kato and Majda, Comm. Math. Phys. 1984 (for Euler; the same holds for Navier–Stokes)`,
      why: r`So every possible singularity is a vorticity singularity: if the largest vorticity stays integrable in time, all higher derivatives stay bounded. In 2D the maximum of $|\omega|$ can't increase at all (previous stop), so the criterion holds trivially.`,
      detail: r`This turns the Millennium question into a question about one quantity: can the stretching term drive $\max|\omega|$ to infinity fast enough? Refinements say the **direction** of vorticity matters too: if the vortex lines stay smoothly aligned where $|\omega|$ is large, there is no blow-up (Constantin and Fefferman, 1993). A blow-up would need vortex lines to twist sharply as they intensify.

That is where the search for a singularity starts: the roadmap at the end of this path picks up from here.`,
      concepts: ['vorticity'],
      check: {
        prompt: r`What does the Beale–Kato–Majda criterion say about 2D flows?`,
        options: [
          r`They never blow up: $\max|\omega|$ can't increase, so its time integral is finite`,
          r`They blow up when the enstrophy is large`,
          r`It doesn't apply to 2D`,
        ],
        answer: 0,
        explain: r`In 2D $|\omega|$ is only transported and diffused, so $\max|\omega|$ stays below its initial value, and the integral over any finite time is finite.`,
      },
    },
  ],
  takeaway: r`3D vorticity can be stretched, and stretching makes it grow faster the larger it is. Any blow-up must be a vorticity blow-up, which is where the Millennium problem lives.`,
};
