/**
 * the-place — full-bleed landscape photo with a bottom overlay + corner tag.
 *
 * Authoring rows (one cell each; order matters):
 *   1. background photo (<picture>/<img>)
 *   2. corner tag (plain text) — e.g. "Est 1996"
 *   3. headline — authored as <h2>
 *   4. body (plain text)
 *   5. text link — plain <a> (styled text link, NOT a button — leave unwrapped)
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
  let link = null;
  const tags = [];
  const body = [];

  nodes.forEach((n) => {
    const m = find(n, 'picture, img');
    const h = find(n, 'h1, h2, h3, h4, h5, h6');
    const a = find(n, 'a');
    if (m && !media) { media = m; return; }
    if (h && !heading) { heading = h; return; }
    if (a && !link) { link = a; return; }
    const t = n.textContent.trim();
    if (!t) return;
    if (heading) body.push(t); else tags.push(t);
  });

  const children = [];
  if (media) {
    media.classList.add('ds-the-place-bg');
    children.push(media);
  }

  const scrim = document.createElement('div');
  scrim.className = 'ds-the-place-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  children.push(scrim);

  if (tags.length) {
    const tag = document.createElement('span');
    tag.className = 'ds-the-place-tag';
    tag.textContent = tags.join(' ');
    children.push(tag);
  }

  const overlay = document.createElement('div');
  overlay.className = 'ds-the-place-overlay';
  if (heading) {
    heading.classList.add('ds-the-place-h2');
    overlay.append(heading);
  }
  if (body.length) {
    const p = document.createElement('p');
    p.className = 'ds-the-place-body';
    p.textContent = body.join(' ');
    overlay.append(p);
  }
  if (link) {
    link.className = 'ds-text-link';
    overlay.append(link);
  }
  children.push(overlay);

  block.replaceChildren(...children);
}
