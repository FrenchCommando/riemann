// A small QR encoder for the Reed–Solomon page: byte mode, version 3 (29×29),
// error-correction level H, mask 0. It follows ISO/IEC 18004, and the figure it
// draws was checked with an independent decoder, clean and with the sticker.
//
// The arithmetic is the page's own: bytes are elements of F_256 built from
// x^8 + x^4 + x^3 + x^2 + 1, with α = x (the byte 2) as primitive element.

// ---------- F_256 by logarithms ----------

export const EXP = new Array(510);
export const LOG = new Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = EXP[i + 255] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
}
export const gmul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

// g(x) = (x − α^0)(x − α^1)…(x − α^(n−1)), coefficients from x^n down to x^0.
export function rsGenerator(n) {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(g.length + 1).fill(0);
    g.forEach((c, j) => { next[j] ^= c; next[j + 1] ^= gmul(c, EXP[i]); });
    g = next;
  }
  return g;
}

// Check bytes: the remainder of data(x)·x^n on division by g(x), so that the
// codeword data ‖ check is a multiple of g, i.e. vanishes at α^0, …, α^(n−1).
export function rsCheck(data, n) {
  const g = rsGenerator(n);
  const r = new Array(n).fill(0);
  for (const d of data) {
    const f = d ^ r.shift();
    r.push(0);
    for (let i = 0; i < n; i++) r[i] ^= gmul(g[i + 1], f);
  }
  return r;
}

// ---------- version 3-H layout ----------

const V = 3, SIZE = 17 + 4 * V;
const BLOCKS = 2, DATA_PER_BLOCK = 13, CHECK_PER_BLOCK = 22;
const LEVEL_H = 2, MASK = 0;
export const CAPACITY = 24; // bytes in byte mode

function codewords(text) {
  const bytes = [...new TextEncoder().encode(text)];
  if (bytes.length > CAPACITY) throw new Error(`QR 3-H holds ${CAPACITY} bytes, got ${bytes.length}`);
  const bits = [];
  const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
  put(0b0100, 4); // byte mode
  put(bytes.length, 8);
  bytes.forEach((b) => put(b, 8));
  const cap = BLOCKS * DATA_PER_BLOCK * 8;
  put(0, Math.min(4, cap - bits.length)); // terminator
  put(0, (8 - (bits.length % 8)) % 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let pad = 0xec; data.length < BLOCKS * DATA_PER_BLOCK; pad ^= 0xec ^ 0x11) data.push(pad);

  const blocks = Array.from({ length: BLOCKS }, (_, b) => data.slice(b * DATA_PER_BLOCK, (b + 1) * DATA_PER_BLOCK));
  const checks = blocks.map((d) => rsCheck(d, CHECK_PER_BLOCK));
  // Interleave, so a local stain is shared between the blocks.
  const out = [];
  for (let i = 0; i < DATA_PER_BLOCK; i++) blocks.forEach((d) => out.push(d[i]));
  for (let i = 0; i < CHECK_PER_BLOCK; i++) checks.forEach((c) => out.push(c[i]));
  return out;
}

// Returns SIZE rows of booleans (true = dark), without the quiet zone.
export function encode(text) {
  const dark = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const fixed = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const setF = (x, y, v) => { dark[y][x] = v; fixed[y][x] = true; };

  for (let i = 0; i < SIZE; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); } // timing
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) setF(x, y, d !== 2 && d !== 4);
    }
  };
  finder(3, 3); finder(SIZE - 4, 3); finder(3, SIZE - 4);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    setF(22 + dx, 22 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); // alignment
  }

  // Format strip: 5 bits (level, mask) + 10 BCH check bits from
  // x^10 + x^8 + x^5 + x^4 + x^2 + x + 1, XOR a fixed pattern.
  const info = (LEVEL_H << 3) | MASK;
  let rem = info;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const fmt = ((info << 10) | rem) ^ 0x5412;
  const bit = (i) => ((fmt >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) setF(8, i, bit(i));
  setF(8, 7, bit(6)); setF(8, 8, bit(7)); setF(7, 8, bit(8));
  for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) setF(SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) setF(8, SIZE - 15 + i, bit(i));
  setF(8, SIZE - 8, true); // the always-dark module

  // Codeword bits, zigzagging up and down two-module columns from the bottom right.
  const bits = codewords(text).flatMap((b) => Array.from({ length: 8 }, (_, i) => ((b >>> (7 - i)) & 1) === 1));
  let k = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip the vertical timing column
    const upward = ((right + 1) & 2) === 0;
    for (let v = 0; v < SIZE; v++) {
      const y = upward ? SIZE - 1 - v : v;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (!fixed[y][x]) dark[y][x] = (k < bits.length ? bits[k++] : false) !== ((x + y) % 2 === 0); // mask 0
      }
    }
  }
  return dark;
}
