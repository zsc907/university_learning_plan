# University Learning Plan — Interactive Edition

A single-page, fully offline interactive edition of the Word document
`Version 2.docx`. The document's wording is reproduced **verbatim** — no
sentence was rewritten, added to, or removed.

## Open it

Double-click `index.html`, or drag it into any modern browser. No server,
build step, or network connection is required.

## What is interactive

- **Contents rail** — sticky section navigation with scroll-spy highlighting,
  and a collapsible drawer on small screens.
- **Figure viewer** — open either document figure, then zoom with the
  toolbar, mouse wheel, or double-click, and drag to pan.
- **Reading time** — estimated from the document text and shown beneath the title.
- **Reading experience** — restrained reveal animations and a back-to-top button.

Press <kbd>Esc</kbd> to close the contents drawer or the figure viewer.

## How the content stays faithful

`tools/build_site.py` reads the DOCX with `python-docx`, escapes each
paragraph, and injects it into `src/index.template.html`. After generating the
page, the script re-parses the result and asserts that every document
paragraph appears exactly once and in order. The two figures are extracted
from the DOCX package itself.

Short interface labels — "Contents", "Targets", figure captions — are
navigation aids built from facts already stated in the document. The
document's own sentences are untouched.

## Files

```
index.html               Built page (open this)
assets/styles.css        Layout, responsive and print styles
assets/app.js            Interactions, no dependencies
assets/figure-1.jpg      Self-study program figure from the DOCX
assets/figure-2.png      Study OS screenshot from the DOCX
assets/favicon.svg       Favicon
src/index.template.html  Shell template with the article placeholder
README.md
```

## Rebuild

The source document is read from `C:\Users\samue\Desktop\Version 2.docx`
(change `SOURCE` in `tools/build_site.py` if it moves).

From the workspace root, with the bundled Python runtime:

```powershell
python tools/build_site.py
```

The script regenerates `index.html`, re-extracts the figures, and re-runs the
text-fidelity verification.

## Deploy to GitHub Pages

The site is fully static and every asset path is relative, so it works at
`https://<username>.github.io/<repo>/` without any base-path configuration.

### Upload in the browser (no Git required)

1. Create a **public** repository on GitHub (for example `learning-plan`).
2. On the repository page choose **Add file → Upload files**.
3. Open this folder and select its **contents** — `index.html`, `assets/`,
   `src/`, `README.md`, `.nojekyll` — then drag them in and commit. Do not
   upload the outer `university-learning-plan` folder itself.
4. Open **Settings → Pages → Build and deployment**. Set **Source** to
   *Deploy from a branch*, **Branch** to `main`, **Folder** to `/ (root)`,
   then **Save**.
5. Wait for the first deployment, then open
   `https://<username>.github.io/<repo>/`.

### Deploy with Git

```powershell
cd "C:\Users\samue\Desktop\dsh\gecc1230\university-learning-plan"
git init -b main
git add .
git commit -m "Add interactive learning plan site"
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Then enable Pages with the same **Settings → Pages** steps above.

### Notes

- `index.html` must be at the **repository root**. If the whole outer folder
  is uploaded, the page ends up at `/repo/university-learning-plan/` and the
  main URL returns 404.
- Free GitHub Pages sites require a public repository.
- To publish at `https://<username>.github.io/`, name the repository
  `<username>.github.io`.
- Pushes to `main` redeploy automatically. Hard-refresh (<kbd>Ctrl</kbd>+<kbd>F5</kbd>)
  if an old version is cached.
