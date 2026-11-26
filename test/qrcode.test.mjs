import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXP, LOG, gmul, rsCheck, encode } from '../site/js/content/qrcode.js';

// The figure was checked once with an independent decoder (jsQR), clean and with
// the sticker read as light, dark or noise. These tests pin down the algebra the
// Reed–Solomon and primitive-element pages describe, so a change can't silently
// break it.

test('F_256: x is primitive for x^8 + x^4 + x^3 + x^2 + 1', () => {
  assert.equal(new Set(EXP.slice(0, 255)).size, 255);
  assert.equal(gmul(0x02, 0x80), 0x1d);
  for (let a = 1; a < 256; a++) assert.equal(EXP[LOG[a]], a);
});

test('Reed–Solomon: a codeword vanishes at α^0, …, α^(n−k−1) and nowhere else checked', () => {
  const data = Array.from({ length: 13 }, (_, i) => (i * 37 + 5) & 0xff);
  const cw = [...data, ...rsCheck(data, 22)];
  const at = (a) => cw.reduce((acc, c) => gmul(acc, a) ^ c, 0);
  for (let i = 0; i < 22; i++) assert.equal(at(EXP[i]), 0, `nonzero at α^${i}`);
  assert.notEqual(at(EXP[22]), 0);
});

test('QR: 29×29 with the three finder squares', () => {
  const m = encode('https://riemann.http.nyc');
  assert.equal(m.length, 29);
  for (const [x, y] of [[0, 0], [22, 0], [0, 22]]) {
    for (let i = 0; i < 7; i++) {
      assert.ok(m[y][x + i] && m[y + 6][x + i] && m[y + i][x] && m[y + i][x + 6], `finder at ${x},${y}`);
    }
    assert.ok(m[y + 3][x + 3] && !m[y + 1][x + 1], `finder centre at ${x},${y}`);
  }
  assert.throws(() => encode('x'.repeat(25)));
});
