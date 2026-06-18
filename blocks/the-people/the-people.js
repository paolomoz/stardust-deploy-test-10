/**
 * the-people — 2-up full-bleed photo split. Each half is a whole-tile link to a
 * soda-fountain page (the entire half is the click target — no inner button).
 *
 * Authoring shape (one ROW per half; per-half field order):
 *   photo (<picture>/<img>) | eyebrow (text) | heading (<h2>) | teaser (text) | link (<a>)
 *
 * Segmented by heading boundary with pre-heading photo + eyebrow buffered onto
 * the group the heading opens (#76), so it tolerates one-row-per-half and a
 * flattened single cell alike. The authored <a> supplies the half's href; its
 * text becomes the ghost CTA label (rendered as a <span>, since the half itself
 * is the anchor).
 */

const find = (n, sel) => (n.matches(sel) ? n : n.querySelector(sel));

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

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const groups = [];
  let cur = null;
  let pendingMedia = null;
  let pendingText = [];

  nodes.forEach((n) => {
    const h = find(n, 'h1, h2, h3, h4, h5, h6');
    const m = find(n, 'picture, img');
    const a = find(n, 'a');
    if (h) {
      cur = {
        media: pendingMedia, eyebrow: pendingText.join(' '), heading: h, teaser: [], link: null,
      };
      groups.push(cur);
      pendingMedia = null;
      pendingText = [];
      return;
    }
    if (m) { pendingMedia = m; return; }
    if (a) { if (cur) cur.link = a; return; }
    const t = n.textContent.trim();
    if (!t) return;
    // Text belongs to the OPEN group's teaser only while that group is still
    // being filled (no CTA yet AND no next unit's media has arrived). Otherwise
    // it's the NEXT half's eyebrow — buffer it (#76).
    if (cur && !cur.link && !pendingMedia) cur.teaser.push(t);
    else pendingText.push(t);
  });

  const halves = groups.map((g) => {
    const half = document.createElement('a');
    half.className = 'ds-people-half';
    if (g.link) half.href = g.link.getAttribute('href');

    if (g.media) {
      g.media.classList.add('ds-people-half-bg');
      half.append(g.media);
    }

    const scrim = document.createElement('div');
    scrim.className = 'ds-people-half-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    half.append(scrim);

    const overlay = document.createElement('div');
    overlay.className = 'ds-people-overlay';
    if (g.eyebrow) {
      const p = document.createElement('p');
      p.className = 'ds-people-eyebrow';
      p.textContent = g.eyebrow;
      overlay.append(p);
    }
    if (g.heading) {
      const h2 = document.createElement('h2');
      h2.className = 'ds-people-h3';
      h2.textContent = g.heading.textContent.trim();
      overlay.append(h2);
    }
    if (g.teaser.length) {
      const p = document.createElement('p');
      p.className = 'ds-people-teaser';
      p.textContent = g.teaser.join(' ');
      overlay.append(p);
    }
    if (g.link) {
      const cta = document.createElement('span');
      cta.className = 'ds-people-cta';
      cta.textContent = g.link.textContent.trim();
      overlay.append(cta);
    }
    half.append(overlay);
    return half;
  });

  block.replaceChildren(...halves);
}
