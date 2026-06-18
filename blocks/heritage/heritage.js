/**
 * heritage — editorial 2-col spread: archival photo + big founding year + prose.
 *
 * Authoring rows (one cell each; order matters):
 *   1. archival photo (<picture>/<img>)
 *   2. eyebrow (plain text) — e.g. "The early days"
 *   3. year — authored as <h2> (e.g. "1996"); rendered as the oversized year mark
 *   4. prose — one or more <p> in a single cell
 *   5. CTA — author as <em><a>…</a></em> (→ .btn.btn-secondary, ghost)
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

const find = (n, sel) => (n.matches(sel) ? n : n.querySelector(sel));

export default async function decorate(block) {
  const nodes = collectNodes(block);
  let media = null;
  let heading = null;
  let cta = null;
  const eyebrows = [];
  const prose = [];

  nodes.forEach((n) => {
    const m = find(n, 'picture, img');
    const h = find(n, 'h1, h2, h3, h4, h5, h6');
    const a = find(n, 'a');
    if (m && !media) { media = m; return; }
    if (h && !heading) { heading = h; return; }
    if (a) { cta = a; return; }
    const t = n.textContent.trim();
    if (!t) return;
    if (heading) prose.push(t); else eyebrows.push(t);
  });

  const figure = document.createElement('figure');
  figure.className = 'ds-archival-photo';
  if (media) figure.append(media);

  const text = document.createElement('div');
  text.className = 'ds-heritage-text';

  if (eyebrows.length) {
    const p = document.createElement('p');
    p.className = 'ds-heritage-eyebrow';
    p.textContent = eyebrows.join(' ');
    text.append(p);
  }
  if (heading) {
    heading.classList.add('ds-heritage-year');
    if (!heading.getAttribute('aria-label')) {
      heading.setAttribute('aria-label', `Founded ${heading.textContent.trim()}`);
    }
    text.append(heading);
  }
  if (prose.length) {
    const wrap = document.createElement('div');
    wrap.className = 'ds-heritage-prose';
    prose.forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      wrap.append(p);
    });
    text.append(wrap);
  }
  if (cta) text.append(cta);

  block.replaceChildren(figure, text);
}
