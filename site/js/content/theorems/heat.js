import { svg, path, text, line } from '../figures.js';

const r = String.raw;

// A square wave smoothed by the heat equation: u = (4/π) Σ_{k odd} e^{−k²τ} sin(kx)/k,
// with τ = νt. τ = 0 is drawn with 41 terms (the jump plus Gibbs ripples).
const X = 45, Y = 55; // units per 1
const wave = (tau, K) => {
  const pts = [];
  for (let i = 0; i <= 400; i++) {
    const x = (2 * Math.PI * i) / 400;
    let s = 0;
    for (let k = 1; k <= K; k += 2) s += (Math.exp(-k * k * tau) * Math.sin(k * x)) / k;
    pts.push([X * x, -Y * (4 / Math.PI) * s]);
  }
  return pts;
};
const smoothing = svg('-20 -70 330 155', 'A square wave on one period, jumping between 1 and minus 1, and the same profile after the heat equation has run for three increasing times: the corners round off and the wave flattens toward a smooth sine-like curve of shrinking height',
  path(`M0 0H${X * 2 * Math.PI}`, 'f-axis'),
  line(wave(0, 41), 'f-thin'),
  line(wave(0.01, 199), 'f-vec'),
  line(wave(0.1, 199), 'f-curve'),
  line(wave(0.5, 199), 'f-alt'),
  text(X * Math.PI, 74, 'π', 'f-pt'), text(X * 2 * Math.PI, 74, '2π', 'f-pt'), text(-10, -Y, '1', 'f-pt'), text(-12, Y, '−1', 'f-pt'));

export default {
  id: 'heat',
  field: 'Analysis',
  title: 'Viscosity smooths: the heat equation',
  attribution: 'Joseph Fourier, Théorie analytique de la chaleur, 1822',
  statement: r`Let $f$ be $2\pi$-periodic and integrable, with Fourier coefficients $c_k$. Then
$$u(x, t) = \sum_{k \in \mathbb Z} c_k\, e^{-\nu k^2 t}\, e^{ikx}$$
solves $\partial_t u = \nu\,\partial_x^2 u$ with $u(\cdot, 0) = f$, and for every $t \gt 0$ it is infinitely differentiable, even if $f$ has jumps.`,
  figure: {
    svgs: [smoothing],
    caption: r`A square wave (thin grey, with the ripples of a 41-term partial sum) after times $\nu t = 0.01$ (white), $0.1$ (red) and $0.5$ (dashed), computed from the formula above. Corners round off instantly; the whole wave then fades.`,
  },
  prereqs: ['fourier', 'calculus'],
  requiresTheorems: ['pythagoras'],
  intro: r`The term $\nu \Delta u$ in the Navier–Stokes equations is the heat equation's diffusion. Before facing the nonlinear fluid equations, see exactly what diffusion does on its own: it kills each Fourier wave at a rate $\nu k^2$, so the finest details vanish first, and any rough initial state becomes smooth at once.`,
  steps: [
    {
      title: 'Waves are the natural coordinates',
      claim: r`$e^{ikx}$ is an eigenfunction of $\partial_x^2$: $\ \partial_x^2\, e^{ikx} = -k^2 e^{ikx}$.`,
      why: r`Differentiate twice: each derivative brings down a factor $ik$, and $(ik)^2 = -k^2$.`,
      detail: r`So the operator $\partial_x^2$, which is hard to think about in general, acts on each wave by plain multiplication by $-k^2$. Writing $u(x, t) = \sum_k a_k(t)\, e^{ikx}$ therefore turns one partial differential equation into one simple ordinary equation per wave.

The minus sign matters: $-k^2 \le 0$, so diffusion only ever damps waves, never amplifies them.`,
      concepts: ['fourier'],
    },
    {
      title: 'Each wave decays on its own',
      claim: r`$a_k(t) = c_k\, e^{-\nu k^2 t}$.`,
      why: r`Substituting $u = \sum a_k e^{ikx}$ into $\partial_t u = \nu\,\partial_x^2 u$ and matching waves gives $a_k' = -\nu k^2 a_k$, with $a_k(0) = c_k$.`,
      detail: r`Matching coefficients is allowed because the waves are orthogonal: if $\sum_k b_k e^{ikx} = 0$, multiplying by $e^{-ijx}$ and integrating gives $b_j = 0$. Each $a_k$ solves $a_k' = -\nu k^2 a_k$, whose solution is the exponential.

The decay rate grows like $k^2$: wave $k = 10$ fades a hundred times faster than wave $k = 1$. **Fine detail is destroyed first.** In time $t$, diffusion erases features smaller than about $\sqrt{\nu t}$.`,
      concepts: ['fourier', 'calculus'],
      check: {
        prompt: r`At time $t$, by what factor is wave $k = 10$ damped compared with wave $k = 1$?`,
        options: [r`$e^{-99\nu t}$`, r`$e^{-9\nu t}$`, r`$\frac{1}{10}$`],
        answer: 0,
        explain: r`$e^{-100\nu t} / e^{-\nu t} = e^{-99\nu t}$. The rate goes like $k^2$, not $k$.`,
      },
    },
    {
      title: 'Instantly smooth',
      claim: r`For $t \gt 0$, every derivative $\partial_x^m u$ exists and is continuous.`,
      why: r`Differentiating $m$ times multiplies the coefficients by $(ik)^m$. Since $|c_k| \le M = \frac{1}{2\pi}\int|f|$, the differentiated series is dominated by $M\sum |k|^m e^{-\nu k^2 t}$, which converges: the Gaussian factor beats any power.`,
      detail: r`**Bounded coefficients:** $|c_k| = \big|\frac{1}{2\pi}\int f e^{-ikx}\big| \le \frac{1}{2\pi}\int |f| = M$, because $|e^{-ikx}| = 1$. Nothing about smoothness of $f$ is needed: a square wave has $|c_k| \sim \frac{2}{\pi |k|}$.

**Domination:** $\big|(ik)^m c_k e^{-\nu k^2 t} e^{ikx}\big| \le M |k|^m e^{-\nu k^2 t}$, and $\sum_k |k|^m e^{-\nu k^2 t} \lt \infty$ for any fixed $t \gt 0$ (the terms eventually fall below $e^{-|k|}$, say). By the Weierstrass test the differentiated series converges uniformly, so term-by-term differentiation is valid and the result is continuous. This holds for every $m$.

Compare the jump at $t = 0$: its coefficients decay only like $1/k$, too slowly for even one derivative.`,
      concepts: ['fourier', 'series'],
      check: {
        prompt: r`Why does the proof need $t \gt 0$ strictly?`,
        options: [
          r`At $t = 0$ there is no factor $e^{-\nu k^2 t}$ to beat $|k|^m$, and $f$ itself may have jumps`,
          r`Because the heat equation has no solution at $t = 0$`,
          r`Because $\nu$ could be zero`,
        ],
        answer: 0,
        explain: r`At $t = 0$ the series is just $f$, with coefficients that may decay as slowly as $1/k$. Any positive time supplies the Gaussian decay.`,
      },
    },
    {
      title: 'Energy only goes down',
      claim: r`$\displaystyle \frac{d}{dt}\,\frac12\int_0^{2\pi} u^2\,dx = -\nu\int_0^{2\pi} (\partial_x u)^2\,dx \le 0.$`,
      why: r`$\frac{d}{dt}\frac12\int u^2 = \int u\,\partial_t u = \nu\int u\,\partial_x^2 u$, and integrating by parts on a full period (no boundary terms) gives $-\nu\int(\partial_x u)^2$.`,
      detail: r`Equivalently, wave by wave, by Parseval: $\frac{1}{2\pi}\int u^2 = \sum_k |c_k|^2 e^{-2\nu k^2 t}$, a sum of decreasing terms.

This is the exact template of the Navier–Stokes energy identity on the next stop of this path: multiply by $u$, integrate, integrate by parts, and the diffusion term becomes $-\nu \times$ (a square). The new difficulty there is the nonlinear term, which this equation doesn't have.`,
      concepts: ['calculus'],
    },
    {
      title: 'Small scales smooth fastest',
      claim: r`If $u(x, t)$ solves the heat equation, so does $u(\lambda x, \lambda^2 t)$: a pattern $\lambda$ times smaller smooths $\lambda^2$ times faster.`,
      why: r`$\partial_t$ of $u(\lambda x, \lambda^2 t)$ brings out $\lambda^2$, and so does $\partial_x^2$; both sides of the equation scale by $\lambda^2$.`,
      detail: r`This is the same scaling as Navier–Stokes, $x \to \lambda x$, $t \to \lambda^2 t$. It's why viscosity is the hope for smoothness: at small scales it acts fastest.

The catch, which the energy identity's last step quantifies: in Navier–Stokes the nonlinear term scales exactly like the viscous one, so zooming in doesn't let viscosity win automatically. Whether it wins anyway is the Millennium question.`,
      concepts: ['calculus'],
      check: {
        prompt: r`A smudge of size 1 mm takes 1 second to diffuse. Roughly how long for a smudge of 1 cm?`,
        options: [r`About $100$ seconds`, r`About $10$ seconds`, r`About $1000$ seconds`],
        answer: 0,
        explain: r`Diffusion time scales like size squared: $(10)^2 = 100$ times longer.`,
      },
    },
  ],
  takeaway: r`Diffusion damps each wave at rate $\nu k^2$: rough data become smooth instantly, energy decreases, and small scales are erased first.`,
};
