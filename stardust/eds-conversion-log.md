# EDS conversion log — Wasatch Back Sodaworks

Source prototype: `Wasatch Back Homepage.dc.html` (`<x-dc>` document-content, single
`<style>` block + real image assets under `assets/generated/`). Single-page site.

## Runtime
Target started as **vanilla `aem-boilerplate`** → ran the **AuthorKit runtime bootstrap**:
- Ported `scripts/ak.js`, `scripts.js`, `lazy.js`, `utils/*`, `tools/**`, `deps/**`,
  `head.html`, `blocks/fragment`, `blocks/section-metadata`, `.hlxignore` from
  `github.com/aemsites/author-kit@main`.
- Removed `scripts/aem.js`, `scripts/delayed.js`, boilerplate blocks
  (`header`, `footer`, `cards`, `columns`, `widget`, `hero`), `styles/fonts.css`,
  `styles/lazy-styles.css`.
- **Static chrome fragments**: author-kit `main` ships a *block-based* header
  (`postlcp.js` → `loadBlock(header)`) — NOT the static-fragment model this skill
  needs. So `scripts/postlcp.js` was authored fresh: it fetches
  `/fragments/{header,footer}.html` from `codeBase` and injects via `innerHTML`,
  setting `el.className = name` first (#21) so `header.header` / `footer.footer`
  root selectors match. The `utils/footer.js` `loadBlock(footer)` import was removed
  from `lazy.js` (#15) to avoid the double-load error box.
- `scripts.js` `hostnames` set to `['aem.page', 'aem.live']`.
- Vendored runtime added to `.eslintignore`; `blocks/section-metadata` +
  `blocks/fragment` added to `.stylelintignore`.
- Pre-existing boilerplate dep conflict (eslint 8 vs `@babel/eslint-parser@8`
  wanting eslint 9/10) resolved with `--legacy-peer-deps` + adding `@babel/core`.
  `playwright` added as devDependency for QA + the Step-10 diff probes.

## Blocks (one per prototype `<section>` — locked, no abstraction)
| block | prototype section | notes |
|---|---|---|
| `hero` | `hero` | full-bleed photo + overlay; the page's single `<h1>` |
| `heritage` | `heritage` | 2-col editorial; big "1996" year is the `<h2>` |
| `the-place` | `the-place` | full-bleed photo + overlay + corner tag; text-link CTA (not a button) |
| `featured-soda` | `featured-soda` | 3-up soda card grid (one row per card) + foot text link |
| `the-people` | `the-people` | 2-up photo split; each half a whole-tile `<a>` |

Header (eyebrow promo banner + sticky nav) + footer (mega 3-pillar) → static
fragments at `fragments/{header,footer}.html`. Mobile nav re-implemented as the
prototype's CSS-only checkbox hack (fragment JS is inert).

All block JS reads via a flatten-tolerant cell collector and classifies nodes by
content (#62/#79) rather than fixed row indices. `the-people` buffers the
pre-heading eyebrow onto the group its heading opens (#76) — caught in local QA
(half 2's eyebrow had leaked into half 1's teaser) and fixed.

## Fonts (all self-hosted, all OFL — no licensing obligation)
- `--hero` Lilita One (loaded by the proto via Google Fonts) → self-hosted static 400.
- `--display` "Bellfort" is **proprietary and never shipped/loaded by the proto**;
  its documented OFL fallback **Bebas Neue** is self-hosted as the intended display
  face (#77).
- `--body` Public Sans (named by the proto, never loaded → proto fell back to
  system) self-hosted variable; body defaults to a **metric-matched Arial**
  (`size-adjust 123.36% / ascent 77.01% / descent 18.24%`, computed from the woff2)
  and `body.session` swaps to Public Sans — zero CLS. No font lines in `head.html`.

The Step-10 `content-diff` FONT FORK (proto "Bebas Neue→sys" / "Public Sans→sys"
vs EDS real faces) is therefore the **intended** improvement, not a defect (#77).

## Images
Committed to `/img/wasatch/`. **Authored content `<img>` must be fully-qualified to
a reachable code origin** — root-relative `/img/...` caused all 8 to fail Media-Bus
ingestion (`about:error` ×8, #75), because the pipeline resolves content `<img src>`
against the *content* origin. Switched to
`https://wasatch-back--…aem.page/img/wasatch/…`; the preview then fetched the bytes
and rewrote to origin-independent `./media_<hash>` URLs (survives a merge to main).
The local QA harness rewrites those absolute URLs back to root-relative (#43).

## Deploy
- Branch `wasatch-back` pushed → Code Sync built the branch preview.
- Content body fragment `content/index.html` (metadata block + 5 sections) sanitised
  (#7) and PUT to DA Source API; previewed on the branch.
- Served at the **root** `/` (EDS strips `index`; `/index` 404s) —
  `https://wasatch-back--stardust-deploy-test-10--paolomoz.aem.page/`.

## Step-10 reconcile (both probes)
- `visual-diff`: 2 STRETCHED IMAGE flags, both the `the-people` `object-fit:cover`
  fountain halves — **justified** (#45), not defects.
- `content-diff`: **identical inventories** (proto & EDS each: 28 text nodes —
  7 headings, 9 eyebrows, 7 CTAs, 5 body; 8 img), **0 structural 🔴**. Only the
  intended FONT FORK advisory.
