# University Learning Plan — Interactive Edition

A single-page, fully offline interactive edition of the Word document
`Don't open first.docx`. The document's wording is reproduced **verbatim** — no
sentence was rewritten, added to, or removed.

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
README.md
```
