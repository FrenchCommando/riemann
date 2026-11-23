// Course catalogue. Order = default suggested order (ties in recommendations).
import sqrt2 from './theorems/sqrt2.js';
import euclid from './theorems/euclid.js';
import fta from './theorems/fta.js';
import cantor from './theorems/cantor.js';
import fermat from './theorems/fermat.js';
import euler from './theorems/euler.js';

export { concepts, conceptById } from './concepts.js';
export const theorems = [sqrt2, euclid, fta, cantor, fermat, euler];
export const theoremById = Object.fromEntries(theorems.map((t) => [t.id, t]));
