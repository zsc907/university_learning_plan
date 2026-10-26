# University Learning Plan — Interactive Edition

A single-page, fully offline interactive edition of the University Learning
Plan. The current wording comes from `src/content.txt`, updated from the revised
text supplied on 26 October 2026, and is reproduced **verbatim**. The two figures
from the original Word document are preserved.

## Open it

Double-click `index.html`, or drag it into any modern browser. No server,
build step, or network connection is required.

## Typography

The publication uses three self-hosted variable typefaces:

- **Cormorant Garamond** — the cover title and section headings.
- **Source Serif 4** — the long-form reading text.
- **Inter** — the contents rail, numbers, captions and interface labels.

Only the Latin subsets are bundled, as WOFF2 files in `assets/fonts/`. The
main font files are preloaded on HTTP(S), text loads with `font-display:
swap`, and sensible serif and sans-serif system fallbacks take over if a font
file cannot load. The fonts are licensed under the SIL Open Font License; see
`assets/fonts/OFL.txt`.

## What is interactive

- **Learning mind map** — the cover connects university learning to three
  expandable goals and their existing action targets. Select an action to
  read its section. Native details and links work without JavaScript. On
  phones, the branches start collapsed to keep the cover compact.
- **Contents rail** — sticky section navigation with scroll-spy highlighting,
  a moving chapter marker, and a collapsible drawer on small screens.
- **Figure viewer** — open either document figure, then zoom with the
  toolbar, mouse wheel, or double-click, and drag to pan.
- **Reading experience** — a quiet, fixed masthead, figure zoom affordances,
  and a back-to-top button. Motion is limited and respects
  `prefers-reduced-motion`.

The mind map draws its connections and introduces its branches once on entry.
The Replay control repeats that animation. Branches expand and collapse with
synchronized height, content and connector motion. Rapid clicks reverse from
the current frame; resizing or changing motion preferences settles the layout.
Hover or keyboard focus highlights only the current branch's connections.
Native details remain the fallback without JavaScript.

As readers scroll, newly encountered headings, text, targets and figures
gently enter once. Content is always visible by default; the effect is an
enhancement applied only when a block reaches the viewport. Already visible
content is left still. Chapter jumps briefly accent the destination title.

Each goal's existing Targets now sit directly under its heading. Supporting
labels and figure captions use a consistent readable typographic scale.

Press <kbd>Esc</kbd> to close the contents drawer or the figure viewer.

## How the content stays faithful

`tools/build_site.py` reads `src/content.txt`, escapes each paragraph, and
injects it into `src/index.template.html`. Sections are matched by their
headings, so adding paragraphs does not shift content into another section.
Before saving the page, the script re-parses the result and asserts that every
source paragraph appears exactly once and in order. The two existing figures
are retained in their original positions.

Short interface labels — "Contents", "Targets", figure captions — are
navigation aids built from facts already stated in the document. The
document's own sentences are untouched.

## Files

```
index.html               Built page (open this)
assets/styles.css        Editorial layout, responsive and print styles
assets/mindmap.css        Mind map, reading layout and interaction feedback
assets/app.js            Interactions, no dependencies
assets/fonts/            Self-hosted WOFF2 typefaces and their OFL licence
assets/figure-1.jpg      Self-study program figure from the DOCX
assets/figure-2.png      Study OS screenshot from the DOCX
assets/favicon.svg       Favicon
src/index.template.html  Shell template with the article placeholder
src/content.txt          Current revised article text
README.md
```

## Rebuild

Edit `src/content.txt` to update the wording. Python's standard library is
sufficient; the build does not require the original Word document.

From the workspace root, with the bundled Python runtime:

```powershell
python tools/build_site.py
```

The script regenerates `index.html` and verifies text fidelity while preserving
the existing figures. Run `python tools/verify_content.py` from the workspace
root to also check local assets and navigation anchors.

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
