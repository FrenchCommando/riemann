// Helpers for inline SVG figures. A figure is { svgs: [svgString, ...], caption }
// on a theorem (shown under the statement) or a step (shown under the claim).
// Colours come from CSS classes (style.css, "figures"), so they follow dark mode.

export const svg = (viewBox, label, ...body) =>
  `<svg viewBox="${viewBox}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body.join('')}</svg>`;

export const poly = (points, cls) => `<polygon points="${points}" class="${cls}"/>`;

export const path = (d, cls, attrs = '') => `<path d="${d}" class="${cls}"${attrs ? ' ' + attrs : ''}/>`;

export const text = (x, y, s, cls = '') => `<text x="${x}" y="${y}" class="f-lab${cls ? ' ' + cls : ''}">${s}</text>`;

export const rect = (x, y, w, h, cls) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;

export const dot =(x, y, cls = 'f-dot', r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;

// Path through a list of [x, y] points (rounded to 0.1 to keep the markup small).
export const line = (points, cls, close = false) =>
  path('M' + points.map(([x, y]) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join('L') + (close ? 'Z' : ''), cls);

// A table of cells: rows of strings, cell size s, origin (x0, y0); highlight(i, j)
// returns a class for the cell background, or '' for none.
export const grid = (rows, x0, y0, s, highlight = () => '', textCls = () => '') =>
  rows.flatMap((row, i) => row.map((v, j) => {
    const x = x0 + j * s, y = y0 + i * s, h = highlight(i, j);
    return (h ? rect(x, y, s, s, h) : '') + rect(x, y, s, s, 'f-cell') + (v === '' ? '' : text(x + s / 2, y + s / 2, v, textCls(i, j)));
  })).join('');

// x² as SVG text.
export const sq = (x) => `${x}<tspan dy="-0.45em" font-size="70%">2</tspan>`;

// Arrowhead for vectors: path(d, 'f-vec', arrow).
export const arrowDefs = `<defs><marker id="f-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="11" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 5L0 10z" class="f-head"/></marker></defs>`;
export const arrow = 'marker-end="url(#f-arrow)"';
