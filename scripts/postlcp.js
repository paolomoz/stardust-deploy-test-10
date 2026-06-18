import { getConfig, getMetadata } from './ak.js';

/**
 * Inject a static chrome fragment (header / footer) into its host element.
 * The fragment file is raw `<style>` + DOM (no doctype/html/body). It is fetched
 * from the code origin and injected verbatim — any <script> inside it is inert.
 * @param {Element} el host element (<header> or <footer>)
 * @param {string} name fragment name ('header' | 'footer')
 */
async function loadStaticFragment(el, name) {
  if (getMetadata(name) === 'off') {
    el.remove();
    return;
  }
  const { codeBase } = getConfig();
  try {
    const resp = await fetch(`${codeBase}/fragments/${name}.html`);
    if (!resp.ok) return;
    const html = await resp.text();
    el.className = name; // so header.header / footer.footer root selectors match
    el.innerHTML = html;
  } catch (ex) {
    // fragment missing or network error — leave chrome empty
  }
}

export default async function loadPostLCP() {
  const header = document.querySelector('header');
  if (header) await loadStaticFragment(header, 'header');
  const footer = document.querySelector('footer');
  if (footer) await loadStaticFragment(footer, 'footer');
}
