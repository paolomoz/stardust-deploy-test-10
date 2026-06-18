/**
 * hero — full-bleed photo with bottom overlay (brand statement).
 *
 * Authoring rows (one cell each; order matters):
 *   1. hero photo (<picture>/<img>) — full-bleed background
 *   2. eyebrow (plain text) — above the headline
 *   3. headline — authored as <h1> (the page's single <h1>)
 *   4. subhead (plain text) — below the headline
 *   5. primary CTA — author as <strong><a>…</a></strong> (→ .btn.btn-primary)
 *
 * Reads by classifying collected nodes (tolerant of DA cell-flattening and of
 * the pipeline unwrapping <p> in single-text cells). The prototype's JS scroll
 * reveals are intentionally dropped — content renders visible.
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
  const subheads = [];

  nodes.forEach((n) => {
    const m = find(n, 'picture, img');
    const h = find(n, 'h1, h2, h3, h4, h5, h6');
    const a = find(n, 'a');
    if (m && !media) { media = m; return; }
    if (h && !heading) { heading = h; return; }
    if (a) { cta = a; return; }
    const t = n.textContent.trim();
    if (t) (heading ? subheads : eyebrows).push(t);
  });

  const photoWrap = document.createElement('div');
  photoWrap.className = 'ds-hero-photo-wrap';
  if (media) {
    media.classList.add('ds-hero-photo');
    photoWrap.append(media);
  }

  const scrim = document.createElement('div');
  scrim.className = 'ds-hero-scrim';
  scrim.setAttribute('aria-hidden', 'true');

  const overlay = document.createElement('div');
  overlay.className = 'ds-hero-overlay';

  if (eyebrows.length) {
    const p = document.createElement('p');
    p.className = 'ds-hero-eyebrow';
    p.textContent = eyebrows.join(' ');
    overlay.append(p);
  }
  if (heading) {
    heading.classList.add('ds-hero-h1');
    overlay.append(heading);
  }
  if (subheads.length) {
    const p = document.createElement('p');
    p.className = 'ds-hero-subhead';
    p.textContent = subheads.join(' ');
    overlay.append(p);
  }
  if (cta) {
    const row = document.createElement('div');
    row.className = 'ds-hero-cta-row';
    row.append(cta);
    overlay.append(row);
  }

  block.replaceChildren(photoWrap, scrim, overlay);
}
