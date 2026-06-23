# AGENTS.md

Guidance for future agents working on the LMNAS 37 / Semnastika 18 microsite.

## Project scope

This repository is currently a standalone static coming-soon page, not a full event website. Keep changes focused unless the user explicitly asks to expand the site.

Primary files:

- `index.html` — semantic poster markup and decorative asset placement.
- `style.css` — visual system, responsive layout, z-index layering, local fonts, and firefly styling.
- `script.js` — vanilla JavaScript firefly animation.
- `Assets/` — approved visual assets and local fonts.
- `Assets/figma/` — Figma-derived/exported assets used by the current page.

Run locally with:

```bash
python3 -m http.server 8017
```

Then open `http://127.0.0.1:8017/` and verify visually in browser.

## Design source

Current design source:

```text
https://www.figma.com/design/dICcx4cjMj46tNxFXet12l/DISI-37-18?node-id=1312-34&m=dev
```

When matching Figma, use the Figma MCP if available. Do not guess from memory if a frame or asset can be inspected/exported.

## Visual direction

The approved direction is jungle/expedition for LMNAS 37 / Semnastika 18:

- dark green base, centered on `#3E5526`
- green/olive rock texture marks, not black/grey marks
- saturated yellow-gold Naluka typography
- original saturated PNG wood borders from `Assets/wood border.png`
- ruins, leaves, vines, and jungle decorative layers from `Assets/figma/`
- glowing fireflies as atmosphere, not as primary content

Avoid generic corporate landing-page styling. This page should feel like a jungle event poster translated into CSS.

## Fonts

Use local fonts only:

- `Assets/fonts/Naluka.ttf` for the main display heading.
- `Assets/fonts/Rumble Brave.otf` is available for future body/event copy if needed.

Do not replace Naluka with a web font unless the user explicitly asks.

## Current page structure

The page uses:

- visually hidden `h1` for accessibility: `LMNAS 37 and Semnastika 18`
- visible `h2.coming-soon-word`: one-line `Coming Soon`
- fixed wood rails on left/right
- decorative ruins and leaves as `img.decor`
- fixed brand header image from `Assets/figma/header-logo-bar.png`
- fixed social footer image from `Assets/figma/socials-bar.png`
- dynamic fireflies injected into `#fireflies` by `script.js`

Keep decorative images `alt=""` and `aria-hidden="true"`. Keep meaningful alt text on the header/footer images.

## Layering rules

Layering is intentional. Check computed z-indexes after edits.

Current intended hierarchy:

1. poster base green background
2. ruins/decorative environmental art where requested
3. rock texture overlay where requested
4. leaf clusters can be moved in front of the rock texture when the user wants them prominent
5. fireflies above background/decor, below the main heading
6. `Coming Soon` heading above fireflies
7. wood rails/header/footer above most decorative content

Existing selectors to inspect before changing:

- `.poster::before` — green rock texture layer using `Assets/figma/rock-texture-green.webp`
- `.decor--ruins` / `.decor--ruins-top` / `.decor--ruins-bottom`
- `.decor--leaf`
- `.fireflies` / `.firefly`
- `.coming-soon-word`
- `.wood-rail`
- `.brand-header`, `.social-footer`

Do not change z-indexes blindly. Verify with `getComputedStyle(...).zIndex` in the browser.

## Fireflies

The current firefly effect is JavaScript-driven and based on the user's provided `preview.html` reference:

- `script.js` creates `.firefly` spans inside `#fireflies`
- desktop count: `70`
- mobile count: `45`
- randomized size, velocity, glow, drift, pulse, and edge wraparound
- respects `prefers-reduced-motion` by creating static fireflies without starting the animation loop

If tuning the effect, edit `CONFIG` in `script.js` first. Keep it dependency-free vanilla JS.

## Asset notes

Important current assets:

- `Assets/wood border.png` — use this for side rails; it preserves the original saturated Figma-like wood color better than the pale exported texture.
- `Assets/figma/rock-texture-green.webp` — generated green-tinted texture derived from the Figma rock texture; keeps rock marks green/olive rather than black.
- `Assets/figma/jungle-ruins-top.svg`
- `Assets/figma/jungle-ruins-bottom.svg`
- `Assets/figma/leaf-cluster-a.svg`
- `Assets/figma/leaf-cluster-b.svg`
- `Assets/figma/leaf-cluster-c.svg`
- `Assets/figma/header-logo-bar.png`
- `Assets/figma/socials-bar.png`

Before deleting or renaming assets, run a path check against `index.html`, `style.css`, and `script.js`.

## Verification checklist

Before reporting done:

1. Start a local server: `python3 -m http.server 8017`.
2. Open `http://127.0.0.1:8017/` in browser.
3. Check browser console for JS errors.
4. Verify no missing asset/script paths.
5. Visually confirm:
   - side rails use saturated PNG wood coloring
   - `Coming Soon` is one line in Naluka
   - brand header and social footer are scaled down and readable
   - fireflies are visible and do not cover readability
   - background/decor layering matches the latest user request
   - mobile/desktop responsive behavior does not clip the main heading badly

Useful path-check snippet:

```bash
python3 - <<'PY'
from pathlib import Path
import re
root = Path('.')
html = Path('index.html').read_text()
css = Path('style.css').read_text()
paths = (
    re.findall(r'(?:src|href)="([^"]+)"', html)
    + re.findall(r'url\("?([^\)"]+)"?\)', css)
    + re.findall(r'<script src="([^"]+)"', html)
)
missing = []
for p in paths:
    if p.startswith(('http://', 'https://', '#')):
        continue
    if not (root / p).exists():
        missing.append(p)
print('checked paths:', len(paths))
print('missing:', missing)
PY
```

## Git hygiene

Do not commit, push, or create a GitHub remote unless the user explicitly asks.

This repo already has in-progress design changes. Always run `git status --short` before editing and avoid overwriting the user's or another agent's work.
