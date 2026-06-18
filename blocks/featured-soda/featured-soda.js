/**
 * featured-soda — section head + 3-up soda card grid + a foot text link.
 *
 * Authoring shape:
 *   Head rows (before the first card; no card heading):
 *     - eyebrow (plain text)
 *     - section title (<h2>)
 *   Card rows (one ROW per card — each row carries the card's fields as cells):
 *     badge (text) | name (<h3>) | photo (<picture>/<img>) | style (text) | readmore (<a>)
 *   Foot row (after the cards; a link, no card heading):
 *     - text link (plain <a> — "See the lineup →")
 *
 * Cards are detected by the per-card heading (h3/h4); the lone section title is
 * h2 one level up, so it stays in the head. Field cells are classified by content
 * (heading / picture / link / text-before-name=badge / text-after-name=style) so
 * authored field order is tolerated, and each "cell" is flattened to its children
 * so DA cell-collapsing doesn't drop fields.
 */

const find = (n, sel) => (n.matches(sel) ? n : n.querySelector(sel));

function rowNodes(row) {
  const out = [];
  [...row.children].forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      out.push(p);
    }
  });
  return out.length ? out : [...row.children];
}

function buildCard(nodes) {
  let name = null;
  let photo = null;
  let link = null;
  const before = [];
  const after = [];
  nodes.forEach((n) => {
    const h = find(n, 'h1, h2, h3, h4, h5, h6');
    const m = find(n, 'picture, img');
    const a = find(n, 'a');
    if (h && !name) { name = h; return; }
    if (m && !photo) { photo = m; return; }
    if (a && !link) { link = a; return; }
    const t = n.textContent.trim();
    if (!t) return;
    (name ? after : before).push(t);
  });

  const card = document.createElement('article');
  card.className = 'ds-card';

  if (before.length) {
    const badge = document.createElement('span');
    badge.className = 'ds-card-badge';
    badge.textContent = before.join(' ');
    card.append(badge);
  }
  if (name) {
    const h3 = document.createElement('h3');
    h3.className = 'ds-card-name';
    h3.textContent = name.textContent.trim();
    card.append(h3);
  }
  if (photo) {
    const wrap = document.createElement('div');
    wrap.className = 'ds-card-photo-wrap';
    photo.classList.add('ds-card-photo');
    wrap.append(photo);
    card.append(wrap);
  }
  if (after.length) {
    const style = document.createElement('p');
    style.className = 'ds-card-style';
    style.textContent = after.join(' ');
    card.append(style);
  }
  if (link) {
    link.className = 'ds-card-readmore';
    card.append(link);
  }
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const headNodes = [];
  const cardRows = [];
  const footNodes = [];

  rows.forEach((row) => {
    const nodes = rowNodes(row);
    const isCard = nodes.some((n) => find(n, 'h3, h4'));
    if (isCard) cardRows.push(nodes);
    else if (cardRows.length === 0) headNodes.push(...nodes);
    else footNodes.push(...nodes);
  });

  const out = [];

  // Head: eyebrow (text) then section title (h2)
  let headEyebrow = null;
  let headHeading = null;
  headNodes.forEach((n) => {
    const h = find(n, 'h1, h2, h3, h4, h5, h6');
    if (h && !headHeading) { headHeading = h; return; }
    const t = n.textContent.trim();
    if (t && !headEyebrow) headEyebrow = t;
  });
  if (headEyebrow) {
    const p = document.createElement('p');
    p.className = 'ds-section-eyebrow';
    p.textContent = headEyebrow;
    out.push(p);
  }
  if (headHeading) {
    headHeading.classList.add('ds-section-h2');
    out.push(headHeading);
  }

  // Card grid
  const grid = document.createElement('div');
  grid.className = 'ds-card-grid';
  cardRows.forEach((nodes) => grid.append(buildCard(nodes)));
  out.push(grid);

  // Foot link
  const footLink = footNodes.map((n) => find(n, 'a')).find(Boolean);
  if (footLink) {
    const foot = document.createElement('div');
    foot.className = 'ds-strip-foot';
    footLink.className = 'ds-text-link';
    foot.append(footLink);
    out.push(foot);
  }

  block.replaceChildren(...out);
}
