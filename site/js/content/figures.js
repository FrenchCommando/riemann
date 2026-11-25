// Helpers for inline SVG figures. A figure is { svgs: [svgString, ...], caption }
// on a theorem (shown under the statement) or a step (shown under the claim).
// Colours come from CSS classes (style.css, "figures"), so they follow dark mode.

export const svg = (viewBox, label, ...body) =>
  `<svg viewBox="${viewBox}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body.join('')}</svg>`;

export const poly = (points, cls) => `<polygon points="${points}" class="${cls}"/>`;

export const path = (d, cls, attrs = '') => `<path d="${d}" class="${cls}"${attrs ? ' ' + attrs : ''}/>`;

export const text = (x, y, s, cls = '') => `<text x="${x}" y="${y}" class="f-lab${cls ? ' ' + cls : ''}">${s}</text>`;

export const dot = (x, y, cls = 'f-dot', r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;

// Path through a list of [x, y] points (rounded to 0.1 to keep the markup small).
export const line = (points, cls, close = false) =>
  path('M' + points.map(([x, y]) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join('L') + (close ? 'Z' : ''), cls);

// x² as SVG text.
export const sq = (x) => `${x}<tspan dy="-0.45em" font-size="70%">2</tspan>`;

// Arrowhead for vectors: path(d, 'f-vec', arrow).
export const arrowDefs = `<defs><marker id="f-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="11" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 5L0 10z" class="f-head"/></marker></defs>`;
export const arrow = 'marker-end="url(#f-arrow)"';
