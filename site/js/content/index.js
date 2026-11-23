// Course catalogue. Order = default suggested order (ties in recommendations)
// and the order fields appear on the home page. A theorem may only require
// theorems listed before it.
import pythagoras from './theorems/pythagoras.js';
import sqrt2 from './theorems/sqrt2.js';
import euclid from './theorems/euclid.js';
import fta from './theorems/fta.js';
import cantor from './theorems/cantor.js';
import cantorpower from './theorems/cantorpower.js';
import halting from './theorems/halting.js';
import eirrational from './theorems/eirrational.js';
import fermat from './theorems/fermat.js';
import lagrange from './theorems/lagrange.js';
import primes3mod4 from './theorems/primes3mod4.js';
import euler from './theorems/euler.js';
import chebyshev from './theorems/chebyshev.js';

export { concepts, conceptById } from './concepts.js';
export const theorems = [
  pythagoras, sqrt2, euclid, fta, cantor, cantorpower, halting,
  eirrational, fermat, lagrange, primes3mod4, euler, chebyshev,
];
export const theoremById = Object.fromEntries(theorems.map((t) => [t.id, t]));
export const fields = [...new Set(theorems.map((t) => t.field))];
