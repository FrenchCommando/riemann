// Tiny formatter: $inline$, $$display$$, **bold**, *italic*, "- " lists, blank-line paragraphs.
// Math is rendered with KaTeX here (not auto-render), so tests can check every formula.
import katex from '../vendor/katex/katex.js';

export const opts = { strict: 'error' };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderMath(tex, displayMode, throwOnError) {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: true, strict: opts.strict === 'error' ? 'error' : 'warn' });
  } catch (e) {
    if (throwOnError) throw new Error(`KaTeX: ${e.message} in: ${tex}`);
    return `<code class="tex-error">${esc(tex)}</code>`;
  }
}

function withMath(text, fn, throwOnError) {
  const parts = [];
  const masked = text.replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, (_, d, i) => {
    parts.push(renderMath(d ?? i, d !== undefined, throwOnError));
    return `\u0000${parts.length - 1}\u0000`;
  });
  return fn(esc(masked)).replace(/\u0000(\d+)\u0000/g, (_, n) => parts[+n]);
}

const inlineMarks = (s) =>
  s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');

export function inline(text, throwOnError = false) {
  return withMath(text, inlineMarks, throwOnError);
}

export function block(text, throwOnError = false) {
  return withMath(text, (s) =>
    s.trim().split(/\n\s*\n/).map((para) => {
      const lines = para.split('\n');
      if (lines.every((l) => /^\s*- /.test(l))) {
        return '<ul>' + lines.map((l) => `<li>${inlineMarks(l.replace(/^\s*- /, ''))}</li>`).join('') + '</ul>';
      }
      if (lines.some((l) => /^\s*- /.test(l))) {
        // paragraph followed by list items
        const head = lines.filter((l) => !/^\s*- /.test(l)).join(' ');
        const items = lines.filter((l) => /^\s*- /.test(l));
        return `<p>${inlineMarks(head)}</p><ul>` + items.map((l) => `<li>${inlineMarks(l.replace(/^\s*- /, ''))}</li>`).join('') + '</ul>';
      }
      return `<p>${inlineMarks(lines.join(' '))}</p>`;
    }).join(''), throwOnError);
}
