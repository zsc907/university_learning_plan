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

The source document is read from
`C:\Users\samue\Desktop\Don't open first.docx` (change `SOURCE` in
`tools/build_site.py` if it moves).

From the workspace root, with the bundled Python runtime:

```powershell
python tools/build_site.py
```

The script regenerates `index.html`, re-extracts the figures, and re-runs the
text-fidelity verification.
