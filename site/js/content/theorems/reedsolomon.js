import { svg, path, text, dot, line } from '../figures.js';
import { encode } from '../qrcode.js';

const r = String.raw;

// ---------- the QR code, clean and with a sticker ----------
// Always dark on white (classes f-qr, f-qrbg ignore dark mode): inverted QR
// codes don't scan everywhere. The sticker covers modules 9..18 in both
// directions; the symbol was checked to decode whether the sticker reads as
// light, dark or noise.

const URL_TEXT = 'https://riemann.http.nyc';
const qr = encode(URL_TEXT);
const N = qr.length;
const modules = qr.flatMap((row, y) => row.map((d, x) => (d ? `M${x} ${y}h1v1h-1z` : ''))).join('');
const qrSvg = (label, sticker) => svg(`-4 -4 ${N + 8} ${N + 8}`, label,
  `<rect x="-4" y="-4" width="${N + 8}" height="${N + 8}" class="f-qrbg"/>`,
  path(modules, 'f-qr', 'shape-rendering="crispEdges"'),
  sticker ? `<rect x="9" y="9" width="10" height="10" rx="1.6" class="f-sticker"/><text x="14" y="14.4" class="f-sticker-ink">ζ</text>` : '');
const clean = qrSvg(`A QR code for ${URL_TEXT}`);
const stickered = qrSvg(`The same QR code with a square sticker over the middle, hiding 100 of its 841 modules`, true);

// ---------- a parabola oversampled at 7 points, 2 values corrupted ----------

const m = (x) => 0.25 * x * x - 1.2 * x + 3;
// The horizontal line marks the sample points, not y = 0 (values start near 1).
const X = 40, Y = 40, OX = 30, OY = 208;
const px = (x) => OX + X * x, py = (y) => OY - 8 - Y * (y - 0.9);
const wrong = { 2: 3.4, 5: 1.2 };
const curve = Array.from({ length: 61 }, (_, i) => { const x = -0.2 + (6.4 * i) / 60; return [px(x), py(m(x))]; });
const parabola = svg('0 0 300 236', 'A parabola through seven points at x equals 0 to 6. Two of the received values, at x equals 2 and x equals 5, have been moved off the curve; the other five still lie on it, and only one parabola passes through five of the seven points',
  path(`M${OX} ${OY}H${px(6.4)}`, 'f-axis'),
  line(curve, 'f-curve'),
  ...Object.entries(wrong).map(([x, y]) => path(`M${px(+x)} ${py(m(+x))}V${py(y)}`, 'f-alt')),
  ...[0, 1, 2, 3, 4, 5, 6].map((x) => (x in wrong
    ? dot(px(x), py(wrong[x]), 'f-d2', 6) + dot(px(x), py(m(x)), 'f-mark', 4)
    : dot(px(x), py(m(x)), 'f-dot2', 5))),
  ...[0, 1, 2, 3, 4, 5, 6].map((x) => text(px(x), OY + 16, `a${String.fromCharCode(0x2081 + x)}`, 'f-pt')));

export default {
  id: 'reedsolomon',
  field: 'Algebra',
  title: 'QR codes survive damage: Reed–Solomon codes',
  attribution: 'Irving Reed and Gustave Solomon, 1960; the QR code: Masahiro Hara, Denso Wave, 1994',
  statement: r`Encode $k$ symbols from a field as the values of a polynomial of degree $\lt k$ at $n$ distinct points. Then any two codewords differ in at least $n - k + 1$ places, so up to $(n - k)/2$ wrong symbols can be corrected, or up to $n - k$ missing ones. QR codes do this with bytes, in $\mathbb F_{256}$.`,
  figure: {
    svgs: [clean, stickered],
    caption: r`Both encode the address of this site at the highest error-correction level, H, and both scan: try it with your phone. The sticker on the right hides $100$ of the $841$ modules. These codes are computed by this page, with the arithmetic of the previous proofs.`,
  },
  prereqs: ['polynomials', 'codes', 'fields'],
  requiresTheorems: ['cyclicunits'],
  intro: r`A QR code stores its data as bytes and adds extra bytes so that a scanner can rebuild what a smudge, a tear or a logo destroys. The principle is that a polynomial is pinned down by a few of its values: sample it at more points than needed, and you can afford to lose some.`,
  steps: [
    {
      title: 'Messages as polynomials',
      claim: r`Turn the message $m_0, \dots, m_{k-1}$ (elements of a field $F$) into $m(x) = m_0 + m_1 x + \dots + m_{k-1} x^{k-1}$, and send its values $m(a_1), \dots, m(a_n)$ at $n \ge k$ distinct points of $F$.`,
      figure: {
        svgs: [parabola],
        caption: r`The idea over the real numbers, with $k = 3$: the message is a parabola, sent as its values at $n = 7$ points. Two values arrive wrong (orange). Five of the seven still lie on the original parabola, and no other parabola passes through five of them.`,
      },
      why: r`The $k$ coefficients are the information; the other $n - k$ values are redundancy. Any $k$ correct values determine $m$ (step 4), so the extra values are there to outvote or replace damaged ones.`,
      detail: r`Over $\mathbb F_{256}$ the symbols are bytes, and there are $256$ possible points, so a codeword has at most $256$ bytes. QR codes use $n \le 255$, with the points $1, \alpha, \alpha^2, \dots$ given by the primitive element of the previous proof.

QR encoders actually send the $k$ message bytes unchanged, followed by $n - k$ check bytes: the remainder that makes the codeword a multiple of $(x - 1)(x - \alpha) \cdots (x - \alpha^{n-k-1})$. That form is equivalent to this one (it is the same code up to a change of coordinates, by a discrete Fourier transform over $\mathbb F_{256}$); the version with values is the easiest to reason about.`,
      concepts: ['polynomials', 'codes'],
    },
    {
      title: 'Codewords are far apart',
      claim: r`Different messages give codewords that agree in at most $k - 1$ of the $n$ places. So the code has minimum distance $n - k + 1$.`,
      why: r`If $m \ne m'$, then $m - m'$ is a nonzero polynomial of degree $\lt k$, so it has at most $k - 1$ roots. The codewords agree at $a_i$ exactly when $a_i$ is a root of $m - m'$.`,
      detail: r`So they differ in at least $n - (k - 1) = n - k + 1$ places. That is the best any code can do: the **Singleton bound** says a code with $|F|^k$ codewords of length $n$ has distance at most $n - k + 1$ (delete $n - k$ positions; two codewords must then coincide). Reed–Solomon codes meet it exactly.`,
      concepts: ['polynomials', 'codes'],
      check: {
        prompt: r`A QR code of version 1 at level H uses $n = 26$ bytes with $k = 9$ data bytes. What is the minimum distance?`,
        options: [r`$18$`, r`$17$`, r`$9$`],
        answer: 0,
        explain: r`$n - k + 1 = 26 - 9 + 1 = 18$: two different messages give codewords differing in at least $18$ of the $26$ bytes.`,
      },
    },
    {
      title: 'Correcting errors',
      claim: r`If at most $t$ symbols are wrong and $2t \le n - k$, the codeword nearest to what was received is the one that was sent.`,
      why: r`The sent codeword is within $t$ of what was received. Any other codeword within $t$ of it would be within $2t \le n - k$ of the sent one, closer than the minimum distance $n - k + 1$.`,
      detail: r`This is the triangle inequality for Hamming distance: $d(c, c') \le d(c, \text{received}) + d(\text{received}, c') \le 2t$.

The statement says the nearest codeword is right, not how to find it quickly; trying all $256^k$ messages is hopeless. Scanners use algebra instead: from what was received they compute **syndromes** (the received word evaluated at $1, \alpha, \alpha^2, \dots$, all zero when nothing is wrong), solve for an **error-locator polynomial** whose roots mark the bad positions (Berlekamp–Massey), find those roots (Chien search) and compute the corrections (Forney). All of it is arithmetic in $\mathbb F_{256}$.`,
      concepts: ['codes'],
      check: {
        prompt: r`A block with $22$ check bytes ($n - k = 22$). How many wrong bytes can always be corrected?`,
        options: [r`$11$`, r`$22$`, r`$10$`],
        answer: 0,
        explain: r`$2t \le 22$ gives $t = 11$. If the positions of the bad bytes were known, all $22$ could be repaired (next step).`,
      },
    },
    {
      title: 'Missing values',
      claim: r`If up to $n - k$ symbols are lost but their positions are known, the message is recovered exactly.`,
      why: r`At least $k$ values survive. Two polynomials of degree $\lt k$ that agree at $k$ points are equal (their difference would have $k$ roots), so the surviving values determine $m$.`,
      detail: r`Lagrange interpolation writes the polynomial down. Through points $(a_1, y_1), \dots, (a_k, y_k)$:
$$m(x) = \sum_{i=1}^k y_i \prod_{j \ne i} \frac{x - a_j}{a_i - a_j}.$$
Each product is $1$ at $a_i$ and $0$ at the other points. It needs division, which is why the symbols must live in a field.

Mixed damage works too: $e$ known erasures and $t$ unknown errors can be repaired as long as $e + 2t \le n - k$.`,
      concepts: ['polynomials'],
      check: {
        prompt: r`Why is it enough to know any $k$ of the values?`,
        options: [
          r`Two polynomials of degree $\lt k$ that agree at $k$ points have a difference with $k$ roots, so they are equal`,
          r`Because $n \ge k$`,
          r`Because the field has $256$ elements`,
        ],
        answer: 0,
        explain: r`A nonzero polynomial of degree $\lt k$ has fewer than $k$ roots, so the difference must be the zero polynomial.`,
      },
    },
    {
      title: 'In a real QR code',
      claim: r`The codes above are version 3 at level H: $26$ data bytes in two blocks, each with $13$ data bytes and $22$ check bytes. Each block survives $11$ wrong bytes, which is why the sticker doesn't matter.`,
      cited: r`QR code specification, ISO/IEC 18004; decoding: Berlekamp, 1968; Massey, 1969; Forney, 1965`,
      why: r`Each block is a Reed–Solomon code with $n = 35$ and $k = 13$, so $t = (35 - 13)/2 = 11$ by step 3. The four levels L, M, Q and H trade capacity for robustness, repairing roughly $7\%$, $15\%$, $25\%$ and $30\%$ of the bytes.`,
      detail: r`How a symbol is laid out:
- Each byte is placed as a little $2 \times 4$ patch of modules, snaking up and down two-module columns from the bottom right. A smudge therefore ruins whole bytes, which is the unit Reed–Solomon counts.
- The two blocks are interleaved byte by byte, so a local stain is shared between them rather than overwhelming one.
- A fixed **mask** pattern is XORed over the data so that no large blank areas or finder-like shapes appear by accident.
- The format strip by the corner squares records the level and the mask, protected by its own BCH code (the Frobenius proof shows how that code was designed).

The sticker here covers a $10 \times 10$ patch of modules. It touches $18$ bytes, $8$ in one block and $10$ in the other, both within the $11$ a block can repair. At $11 \times 12$ modules it would touch $12$ bytes in each block, one more than can be repaired; whether the code still scans then depends on how many of those bytes the sticker happens to leave intact.`,
      concepts: ['codes'],
      check: {
        prompt: r`Why are the bytes of the two blocks interleaved?`,
        options: [
          r`So that damage in one area is split between the blocks, each correcting up to $11$ bytes`,
          r`To make the code look random`,
          r`Because a block can't hold more than $13$ bytes`,
        ],
        answer: 0,
        explain: r`Each block repairs its own errors. A stain that fell entirely on one block could exceed its $11$, while the other block had errors to spare.`,
      },
    },
  ],
  takeaway: r`A polynomial of degree $\lt k$ is pinned down by any $k$ of its values. Send more values than that, and the extras repair the rest.`,
  sources: [
    { label: 'Reed–Solomon error correction (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction' },
    { label: 'QR code (Wikipedia)', url: 'https://en.wikipedia.org/wiki/QR_code' },
    { label: 'Reed and Solomon, Polynomial codes over certain finite fields, J. SIAM 8 (1960)', url: 'https://doi.org/10.1137/0108018' },
  ],
};
