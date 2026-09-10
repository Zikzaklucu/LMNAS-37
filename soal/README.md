# Arsip soal LMNas

## Approved reference and flow

SMMC reference: https://www.simonmarais.org/2025.html and the supplied recording.
Use the navigation submenu **Soal Tahun Lalu → LMNas 36 / 35 / 34**, then a dedicated edition page listing PDFs. No homepage tabs, no answer keys. Desktop supports hover; native disclosure also supports clicking, touch, Enter/Space, and Escape.

The twelve supplied PDFs are copied unchanged into `Assets/documents/soal/`. Each edition contains Penyisihan SMP, Penyisihan SMA, Semifinal SMP, and Semifinal SMA. `papers.json` records source Drive IDs, filenames, headings mapped to labels, page counts, and local destinations. The LMNas 35 page includes the supplied YouTube playlist. Silabus remains the existing Drive link.

## Local verification

Serve the repository with `python -m http.server 8137 --bind 127.0.0.1` and visit `/index.html` or `/soal/36/index.html`.
Run `node --test tests/*.test.cjs`.

## Publishing boundary

These files are implemented locally, not published automatically. No Git push or WordPress write is performed.

- Publish source pages, both navigation scripts, shared CSS, and all twelve PDFs together to GitHub Pages.
- Existing WordPress navigation copies in `LMNas_Deployed/` point to those GitHub-hosted edition routes. This avoids inventing unconfirmed WordPress slugs.
- `LMNas_Deployed/soal/{edition}/index.html` and `style.css` are optional separate WordPress handoff pairs if WordPress-native edition pages are wanted later. Their asset/PDF URLs use GitHub Pages. Actual WordPress edition URLs must be supplied before changing links to them.
- Paste each existing page's updated body HTML and its full stylesheet through the established WordPress editor. New archive behavior is inline in the handoff HTML; the guide maintains its separate stylesheet.
- Verify the public edition routes and PDF URLs after publishing. A local passing test does not mean the public site has been updated.

When updating a paper, verify its actual PDF heading rather than guessing from a draft filename. Replace the binary only with the committee-provided file, update the corresponding manifest/page label if needed, and update that edition's handoff copy. Preserve errata inside supplied papers.
