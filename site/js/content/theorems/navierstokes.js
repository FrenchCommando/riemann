import { svg, poly, path, text } from '../figures.js';

const r = String.raw;

// Clay's four alternatives: rows are the domain, columns whether a force is allowed.
const cell = (x, y, cls) => poly(`${x},${y} ${x + 120},${y} ${x + 120},${y + 70} ${x},${y + 70}`, cls);
const grid = svg('0 0 340 200', "The Clay problem's four alternatives: A and B prove smoothness forever with no force, on R3 and on the torus; C and D prove blow-up with a smooth force, on R3 and on the torus. C and D are the ones claimed in 2026",
  cell(90, 50, 'f-tri'), cell(90, 120, 'f-tri'), cell(210, 50, 'f-sq'), cell(210, 120, 'f-sq'),
  text(150, 22, 'no force', 'f-sm'), text(150, 38, 'smooth forever', 'f-pt'),
  text(270, 22, 'smooth force', 'f-sm'), text(270, 38, 'blow-up', 'f-pt'),
  text(45, 85, 'ℝ³', 'f-sm'), text(45, 155, 'torus 𝕋³', 'f-sm'),
  text(150, 85, 'A', 'f-big'), text(150, 155, 'B', 'f-big'),
  text(270, 78, 'C', 'f-big'), text(270, 148, 'D', 'f-big'),
  text(270, 102, 'claimed 2026', 'f-pt'), text(270, 172, 'claimed 2026', 'f-pt'),
  path('M210 50V190', 'f-mark'));

export default {
  id: 'navierstokes',
  kind: 'roadmap',
  field: 'Frontiers',
  title: 'Navier–Stokes existence and smoothness',
  attribution: 'Millennium Prize problem, stated by Charles Fefferman, 2000',
  statement: r`Prove one of: smooth initial data in 3D always give a smooth solution for all time (A on $\mathbb{R}^3$, B on the torus, no external force), **or** some smooth data with a smooth force give a solution that breaks down in finite time (C on $\mathbb{R}^3$, D on the torus).`,
  figure: {
    svgs: [grid],
    caption: r`Clay's four alternatives; any one of them solves the problem. The September 2026 claim is a blow-up result, so it targets C and D, which allow a smooth external force.`,
  },
  prereqs: ['vectorcalc', 'calculus'],
  requiresTheorems: ['energy'],
  intro: r`The energy proof showed the one global bound we have and why scaling defeats it. This roadmap covers what has been proved since Leray, why the problem resisted, the 20-year search for a blow-up, and the 2026 claim that one has been found, with what is and isn't settled.`,
  steps: [
    {
      title: 'The question, precisely',
      claim: r`For smooth, divergence-free initial velocity $u_0$ (decaying at infinity on $\mathbb{R}^3$, or periodic), does the solution of Navier–Stokes stay smooth, with finite energy, for all time?`,
      cited: r`Fefferman, official problem description, Clay Mathematics Institute, 2000`,
      why: r`Smooth solutions exist for a short time; the question is whether they can stop being smooth. "Breakdown" means $|u|$ becomes unbounded (equivalently its derivatives) at some finite time $T^*$. Alternatives C and D allow a smooth, suitably decaying force $f$ on the right side of the equation.`,
      detail: r`Why the force matters for the statement: with $f = 0$, any energy in the solution came from the initial data and only decreases. A force can keep pumping energy in, so blow-up with forcing is, in principle, easier to achieve. Clay nonetheless counts it: the official C and D allow a smooth force with the same decay as the data. Many analysts expect forcing to make little difference to whether blow-up is possible, but that expectation is not a proof.`,
      concepts: ['vectorcalc'],
    },
    {
      title: 'What has been proved',
      claim: r`Weak solutions exist for all time; smooth solutions exist for short times, and for all time if the data are small; in 2D everything is smooth forever; in 3D any singular set is very small.`,
      cited: r`Leray 1934; Fujita–Kato 1964; Ladyzhenskaya 1959; Caffarelli–Kohn–Nirenberg 1982`,
      why: r`Leray used the energy bound to build global "turbulent" (weak) solutions, but couldn't show they are smooth or unique. Fujita–Kato's fixed-point method needs smallness in a scale-invariant norm. In 2D energy is critical, which closes the argument. CKN: the singular set in space-time has one-dimensional parabolic Hausdorff measure zero.`,
      detail: r`The pattern is that everything that works uses either smallness, or a quantity that is critical or better under scaling. In 3D the only coercive global quantity, the energy, is supercritical, and every attempt to bootstrap from it to smoothness loses at small scales. That's the whole difficulty in one sentence, and the energy proof derives the scaling exponent.

A related open question: are Leray's weak solutions unique? Buckmaster and Vicol (2019) showed that a still weaker notion of solution is badly non-unique, and Albritton, Brué and Colombo (2022) showed non-uniqueness of Leray solutions when a force is allowed.`,
      concepts: ['vectorcalc'],
      check: {
        prompt: r`Why does the 2D problem not have the same difficulty?`,
        options: [
          r`In 2D the energy is scale-invariant (critical), so it controls small scales`,
          r`2D flows have no nonlinearity`,
          r`2D flows have no pressure`,
        ],
        answer: 0,
        explain: r`Under $u \mapsto \lambda u(\lambda x, \lambda^2 t)$ the 2D energy is multiplied by $\lambda^2\cdot\lambda^{-2} = 1$. The nonlinearity and pressure are still there; scaling is what changes.`,
      },
    },
    {
      title: 'A barrier for regularity proofs',
      claim: r`An "averaged" version of Navier–Stokes that keeps the energy identity and the standard harmonic-analysis estimates does blow up in finite time.`,
      cited: r`Tao, *J. Amer. Math. Soc.* 2016`,
      why: r`Tao modified the nonlinearity so that it still does no work (energy is conserved exactly as before) but routes energy into ever smaller scales in a controlled cascade. Since the modified equation blows up, a regularity proof for the real equation must use some finer feature of the real nonlinearity.`,
      detail: r`The blow-up is engineered like a sequence of circuits, each transferring its energy to a copy of itself at a smaller scale, faster each time: exactly the scenario the scaling computation in the energy proof allows. Tao suggested that the real Navier–Stokes nonlinearity might be able to simulate such circuits, which would mean blow-up for the real equation too. That turned the search toward constructing a singularity.`,
      concepts: ['calculus'],
    },
    {
      title: 'The search for a blow-up',
      claim: r`For the inviscid Euler equations (Navier–Stokes with $\nu = 0$), finite-time blow-up from smooth data was found numerically and then proved with computer assistance, in a domain with a boundary.`,
      cited: r`Luo–Hou 2014 (numerics); Elgindi 2021 (rougher data); Chen–Hou 2022 (computer-assisted proof)`,
      why: r`Luo and Hou simulated an axisymmetric flow in a cylinder whose vorticity concentrates at a ring on the wall and appears to blow up. Elgindi proved blow-up for slightly non-smooth ($C^{1,\alpha}$) data. Chen and Hou proved blow-up near the Luo–Hou scenario for smooth data, using a computer-assisted stability analysis of an approximately self-similar profile.`,
      detail: r`Why Euler first: without viscosity there is no smoothing to fight. The strategy that emerged: find an (approximately) **self-similar** profile, a flow that reproduces itself at smaller scales and shorter times, and prove that nearby flows are attracted to it. Computer assistance enters through rigorous interval arithmetic bounds on the linearised stability problem. Moving from Euler to Navier–Stokes means showing viscosity can't stop the cascade. Scaling is what leaves room for that: under $u \mapsto \lambda u(\lambda x, \lambda^2 t)$ the viscous term scales exactly like the nonlinear one, so viscosity does not automatically win at small scales.`,
      concepts: ['calculus'],
    },
    {
      title: 'Status, November 2026',
      claim: r`On 8 September 2026 OpenAI announced a proof, formalised in Lean, that a smooth solution driven by a smooth external force can blow up in finite time, which addresses alternatives C and D. As of November it has not been independently verified, and the Clay Institute has not ruled.`,
      cited: r`OpenAI, announcement of 8 Sep 2026; Clay Mathematics Institute statement; reporting listed below`,
      why: r`The announcement attributes the proof to a large group of AI agents running on an unreleased model, reaching the result in about 88 hours, followed by a Lean formalisation. The Clay Institute said the problem has "apparently been settled" but that its evaluation is unhurried; its rules require publication, two years and general acceptance.`,
      detail: r`What is reported, from the sources below:
- **Scope.** The result uses a smooth force, so it is a C/D result. Critics, among them the mathematician Chris Budd, argue the problem "in its cleanest form", blow-up from the unforced equations, remains open, while noting that many expect forcing not to matter much.
- **Verification.** Lean checks that the formal statement follows; whether the formal statement matches Clay's (boundary conditions, decay and regularity of the force) is exactly what human reviewers are now examining. The sources consulted here do not describe the blow-up mechanism in detail.
- **Priority.** Tristan Buckmaster (NYU) and Levent Alpöge reported their own breakthrough on the problem in August 2026 after about a year of work, and raised questions about whether it influenced OpenAI's models; OpenAI says the proofs differ significantly.

As with the Riemann Hypothesis entry: this is taken from the reporting listed below, written with Claude, and the situation is changing.`,
      concepts: [],
      check: {
        prompt: r`Which of Clay's alternatives does the 2026 claim address?`,
        options: [
          r`C and D: finite-time blow-up with a smooth force`,
          r`A and B: smoothness forever without a force`,
          r`All four`,
        ],
        answer: 0,
        explain: r`It is a blow-up construction that uses forcing. A and B (global smoothness without force) would contradict it only if the force were zero, so they aren't settled either way by this.`,
      },
    },
    {
      title: 'What would remain',
      claim: r`Even if the forced blow-up stands, the unforced question (can a smooth flow, left alone, develop a singularity?) stays open, along with uniqueness of Leray's solutions and what a singularity means for real turbulence.`,
      cited: r`Fefferman 2000 (statement); Albritton–Brué–Colombo 2022 (forced non-uniqueness)`,
      why: r`With $f = 0$, any blow-up must be powered by the initial energy alone, which decreases. Turning a forced construction into an unforced one means making the flow generate its own "forcing" from a larger-scale part of itself, which is the kind of self-similar cascade the Euler work suggests might be possible.`,
      detail: r`Physically, a singularity in Navier–Stokes would mean the continuum model itself breaks down at small scales and must be replaced (by molecular dynamics, say) at least momentarily. Mathematically, it would explain why every regularity strategy failed: they were trying to prove something false. Either way, the Millennium problem as posed accepts a forced blow-up as a solution, so the prize question and the physics question have come apart.`,
      concepts: ['vectorcalc'],
    },
  ],
  takeaway: r`Smoothness proofs need a quantity that beats scaling; the only global one, energy, loses. The search therefore turned to constructing a self-similar cascade, and in 2026 a forced blow-up was claimed.`,
  sources: [
    { label: 'Navier–Stokes existence and smoothness (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Navier%E2%80%93Stokes_existence_and_smoothness' },
    { label: 'Plus Magazine: A millennium problem solved by AI?', url: 'https://plus.maths.org/navier-stokes-millennium-problem-solved-ai' },
    { label: 'Simon Willison, 8 Sep 2026: Some thoughts on the Navier–Stokes Millennium Prize Problem', url: 'https://simonwillison.net/2026/Sep/8/on-navier-stokes/' },
    { label: 'Millennium Prize Problems (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Millennium_Prize_Problems' },
  ],
};
