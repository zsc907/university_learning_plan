/* ==========================================================================
   University Learning Plan — interactions
   Vanilla JS, no dependencies, works from the local filesystem.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const article = $("#article");
  const header = $(".site-header");
  const navLinks = $$(".nav a");
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  /* ------------------------------------------------------------------ *
   * Active section + back to top
   * ------------------------------------------------------------------ */
  const toTop = $("#toTop");
  let ticking = false;

  const updateScrollUI = () => {
    ticking = false;

    if (article && sections.length) {
      const marker = window.scrollY + (header?.offsetHeight || 64) + 130;
      let active = sections[0];

      for (const section of sections) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) active = section;
      }

      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atEnd) active = sections[sections.length - 1];

      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${active.id}`) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    if (toTop) {
      toTop.classList.toggle("show", window.scrollY > 720);
    }
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  window.addEventListener("load", requestScrollUpdate);
  updateScrollUI();

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ------------------------------------------------------------------ *
   * Reveal sections as they approach the viewport
   * (only elements below the first screen are hidden, so a failure
   * never leaves the document invisible)
   * ------------------------------------------------------------------ */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );

    $$(".section").forEach((section) => {
      if (section.getBoundingClientRect().top > window.innerHeight * 0.95) {
        section.classList.add("will-reveal");
        revealObserver.observe(section);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Mobile contents drawer
   * ------------------------------------------------------------------ */
  const navToggle = $("#navToggle");
  const navClose = $("#navClose");
  const navScrim = $("#navScrim");

  const setNavOpen = (open) => {
    const wasOpen = document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    $(".main")?.toggleAttribute("inert", open);
    navToggle?.setAttribute("aria-expanded", String(open));
    navToggle?.setAttribute("aria-label", open ? "Close contents" : "Open contents");

    if (open && !wasOpen) {
      navClose?.focus({ preventScroll: true });
    } else if (!open && wasOpen) {
      navToggle?.focus({ preventScroll: true });
    }
  };

  navToggle?.addEventListener("click", () => {
    setNavOpen(!document.body.classList.contains("nav-open"));
  });

  navClose?.addEventListener("click", () => setNavOpen(false));
  navScrim?.addEventListener("click", () => setNavOpen(false));

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (document.body.classList.contains("nav-open")) setNavOpen(false);
    });
  });

  /* ------------------------------------------------------------------ *
   * Figure lightbox
   * ------------------------------------------------------------------ */
  const lightbox = $("#lightbox");
  const lbImage = $("#lbImage");
  const lbStage = $("#lbStage");
  const lbScale = $("#lbScale");
  const lbTitle = $("#lbTitle");
  const lbClose = $("#lbClose");
  const lbZoomIn = $("#lbZoomIn");
  const lbZoomOut = $("#lbZoomOut");
  const lbReset = $("#lbReset");

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginX = 0;
  let dragOriginY = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const applyTransform = () => {
    if (!lbImage) return;
    lbImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    if (lbScale) lbScale.textContent = `${Math.round(scale * 100)}%`;
    lbStage?.classList.toggle("can-pan", scale > 1.01);
    lbStage?.classList.toggle("is-zoomed", scale > 1.01);
  };

  const setScale = (next) => {
    scale = clamp(next, 1, 5);
    if (scale <= 1.01) {
      translateX = 0;
      translateY = 0;
    }
    applyTransform();
  };

  const resetView = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    dragging = false;
    applyTransform();
  };

  const openLightbox = (button) => {
    if (!lightbox || !lbImage) return;
    const img = button.querySelector("img");
    lbImage.src = button.dataset.src || img?.src || "";
    lbImage.alt = img?.alt || "Document figure";
    if (lbTitle) lbTitle.textContent = button.dataset.title || "Figure";
    resetView();
    lightbox.showModal();
  };

  $$(".figure-zoom").forEach((button) => {
    button.addEventListener("click", () => openLightbox(button));
  });

  lbClose?.addEventListener("click", () => lightbox?.close());

  lbZoomIn?.addEventListener("click", () => setScale(scale * 1.35));
  lbZoomOut?.addEventListener("click", () => setScale(scale / 1.35));
  lbReset?.addEventListener("click", resetView);

  lightbox?.addEventListener("close", () => {
    resetView();
    if (lbImage) lbImage.removeAttribute("src");
  });

  lbStage?.addEventListener(
    "wheel",
    (event) => {
      if (!lightbox?.open) return;
      event.preventDefault();
      setScale(scale * (event.deltaY < 0 ? 1.14 : 0.88));
    },
    { passive: false }
  );

  lbStage?.addEventListener("dblclick", (event) => {
    event.preventDefault();
    setScale(scale > 1.01 ? 1 : 2.2);
  });

  lbStage?.addEventListener("pointerdown", (event) => {
    if (scale <= 1.01) return;
    dragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOriginX = translateX;
    dragOriginY = translateY;
    lbStage.setPointerCapture?.(event.pointerId);
    lbStage.classList.add("dragging");
  });

  lbStage?.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    translateX = dragOriginX + (event.clientX - dragStartX);
    translateY = dragOriginY + (event.clientY - dragStartY);
    applyTransform();
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    lbStage?.classList.remove("dragging");
    if (event?.pointerId !== undefined) {
      lbStage?.releasePointerCapture?.(event.pointerId);
    }
  };

  lbStage?.addEventListener("pointerup", endDrag);
  lbStage?.addEventListener("pointercancel", endDrag);

  /* ------------------------------------------------------------------ *
   * Keyboard: Esc closes the mobile contents drawer
   * (native dialogs handle their own Esc behaviour)
   * ------------------------------------------------------------------ */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.body.classList.contains("nav-open")) {
      setNavOpen(false);
    }
  });

  /* ------------------------------------------------------------------ *
   * Close the mobile drawer when returning to desktop widths
   * ------------------------------------------------------------------ */
  const desktopQuery = window.matchMedia("(min-width: 1025px)");
  const handleDesktop = (event) => {
    if (event.matches) setNavOpen(false);
  };

  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", handleDesktop);
  else desktopQuery.addListener(handleDesktop);
})();
