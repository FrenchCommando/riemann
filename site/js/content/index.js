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
import triples from './theorems/triples.js';
import flt4 from './theorems/flt4.js';
import vonmangoldt from './theorems/vonmangoldt.js';
import energy from './theorems/energy.js';
import flt from './theorems/flt.js';
import langlands from './theorems/langlands.js';
import rh from './theorems/rh.js';
import navierstokes from './theorems/navierstokes.js';

export { concepts, conceptById } from './concepts.js';
// Roadmaps (kind: 'roadmap') come last: they map a proof too long to walk
// through, proving what fits and citing the rest.
export const theorems = [
  pythagoras, sqrt2, euclid, fta, cantor, cantorpower, halting,
  eirrational, fermat, lagrange, primes3mod4, euler, chebyshev,
  triples, flt4, vonmangoldt, energy,
  flt, langlands, rh, navierstokes,
];
export const theoremById = Object.fromEntries(theorems.map((t) => [t.id, t]));
// Destinations: the roadmaps. Every other proof is a building block on the way
// to one of them, or a detour.
export const goals = theorems.filter((t) => t.kind === 'roadmap');
export const fields = [...new Set(theorems.map((t) => t.field))];
