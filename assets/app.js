/* ==========================================================================
   University Learning Plan — interactions
   Vanilla JS, no dependencies, works from the local filesystem.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionPreference.matches;

  const article = $("#article");
  const header = $(".site-header");
  const navLinks = $$(".nav a");
  const contentsNav = $(".nav");
  const mindmap = $(".mindmap");
  const mapLinks = $$(".branch-leaves a");
  const mapBranches = $$(".mindmap-branch");
  const replayButton = $(".map-replay");
  let destination = null;
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
          contentsNav?.style.setProperty("--marker-top", `${link.offsetTop + 12}px`);
          contentsNav?.style.setProperty("--marker-height", `${Math.max(20, link.offsetHeight - 24)}px`);
          contentsNav?.classList.add("has-marker");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      if (destination === active) {
        active.classList.add("is-destination");
        const arrived = active;
        window.setTimeout(() => arrived.classList.remove("is-destination"), 1500);
        destination = null;
      }
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
  document.fonts?.ready.then(requestScrollUpdate);
  updateScrollUI();

  /* Scroll motion never hides content before it reaches the viewport. */
  const readingAnimations = new Map();
  const initReadingMotion = () => {
    if (!("IntersectionObserver" in window) || typeof article?.animate !== "function") return;
    const blocks = sections.flatMap((section) =>
      Array.from(section.children).filter((element) =>
        element.matches(".section-head, .targets, p, .figure")
      )
    );
    let previousReadingY = window.scrollY;
    const observer = new IntersectionObserver((entries) => {
      const direction = window.scrollY < previousReadingY ? -1 : 1;
      previousReadingY = window.scrollY;
      let sequence = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        if (element.dataset.readingState) return;
        // A long anchor jump should not animate every intermediate chapter.
        if (destination && !destination.contains(element)) return;
        observer.unobserve(element);
        element.dataset.readingState = "seen";
        if (reduceMotion) return;

        const travel = element.matches(".figure") ? 18 : element.matches(".section-head") ? 16 : 10;
        const animation = element.animate([
          { opacity: 0.12, transform: `translate3d(0, ${direction * travel}px, 0)` },
          { opacity: 1, transform: "none" },
        ], {
          duration: element.matches(".figure") ? 580 : 500,
          delay: Math.min(sequence++ * 40, 80),
          easing: "cubic-bezier(0.22, 0.68, 0.24, 1)",
          fill: "backwards",
        });
        element.dataset.readingState = "revealed";
        readingAnimations.set(element, animation);
        const cleanUp = () => {
          if (readingAnimations.get(element) === animation) readingAnimations.delete(element);
        };
        animation.finished.then(cleanUp, cleanUp);
      });
    }, { rootMargin: `-${header?.offsetHeight || 58}px 0px -32px 0px`, threshold: 0 });

    blocks.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight - 32 && bounds.bottom > (header?.offsetHeight || 58)) {
        element.dataset.readingState = "seen";
      } else observer.observe(element);
    });
  };
  if (document.fonts) document.fonts.ready.then(initReadingMotion);
  else initReadingMotion();

  /* Native details and anchors keep the mind map usable without JavaScript. */
  if (window.matchMedia("(max-width: 760px)").matches) {
    mapBranches.forEach((branch) => { branch.open = false; });
  }
  const finishBranchMotions = [];
  mapBranches.forEach((branch) => {
    const summary = $("summary", branch);
    const panel = $(".branch-panel", branch);
    const leaves = $(".branch-leaves", branch);
    let targetOpen = branch.open;
    let animations = [];
    let revision = 0;

    branch.addEventListener("toggle", () => {
      if (!animations.length) targetOpen = branch.open;
      requestScrollUpdate();
    });
    if (!summary || !panel || !leaves || typeof branch.animate !== "function") return;
    branch.classList.add("has-motion");

    const cancelAnimations = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };
    const clearSizing = () => {
      branch.style.removeProperty("height");
      panel.style.removeProperty("height");
      leaves.style.removeProperty("opacity");
    };
    const settle = () => {
      revision += 1;
      cancelAnimations();
      branch.open = targetOpen;
      clearSizing();
      branch.classList.remove("is-expanding", "is-collapsing");
      summary.removeAttribute("aria-expanded");
      panel.inert = false;
      requestScrollUpdate();
    };
    finishBranchMotions.push(() => { if (animations.length) settle(); });

    summary.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const startHeight = branch.getBoundingClientRect().height;
      const startPanelHeight = branch.open ? panel.getBoundingClientRect().height : 0;
      const startOpacity = branch.open ? Number.parseFloat(getComputedStyle(leaves).opacity) : 0;
      targetOpen = !targetOpen;
      revision += 1;
      const currentRevision = revision;
      cancelAnimations();
      clearSizing();
      branch.classList.remove("is-expanding", "is-collapsing");

      if (reduceMotion) {
        settle();
        return;
      }

      // Measure the desired natural layout, then animate from the current frame.
      branch.open = targetOpen;
      const endHeight = branch.getBoundingClientRect().height;
      const endPanelHeight = targetOpen ? panel.getBoundingClientRect().height : 0;
      branch.open = true;
      branch.style.height = `${startHeight}px`;
      panel.style.height = `${startPanelHeight}px`;
      leaves.style.opacity = String(startOpacity);
      summary.setAttribute("aria-expanded", String(targetOpen));
      panel.inert = !targetOpen;
      branch.classList.add(targetOpen ? "is-expanding" : "is-collapsing");

      const timing = { duration: 280, easing: "cubic-bezier(0.22, 0.68, 0.24, 1)", fill: "both" };
      animations = [
        branch.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], timing),
        panel.animate([{ height: `${startPanelHeight}px` }, { height: `${endPanelHeight}px` }], timing),
        leaves.animate([{ opacity: startOpacity }, { opacity: targetOpen ? 1 : 0 }], timing),
      ];
      Promise.all(animations.map((animation) => animation.finished)).then(() => {
        if (revision === currentRevision) settle();
      }).catch(() => { /* A new click or viewport change superseded this transition. */ });
    });
  });
  window.addEventListener("resize", () => finishBranchMotions.forEach((finish) => finish()), { passive: true });
  motionPreference.addEventListener("change", (event) => {
    reduceMotion = event.matches;
    if (replayButton) replayButton.hidden = reduceMotion;
    finishBranchMotions.forEach((finish) => finish());
    if (reduceMotion) {
      readingAnimations.forEach((animation) => animation.cancel());
      readingAnimations.clear();
    }
  });

  const replayMindmap = () => {
    if (!mindmap || reduceMotion) return;
    mindmap.classList.remove("is-entering");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => mindmap.classList.add("is-entering"));
    });
  };
  replayButton?.addEventListener("click", replayMindmap);
  if (mindmap && !reduceMotion) {
    if (replayButton) replayButton.hidden = false;
    if ("IntersectionObserver" in window) {
      const mapObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          replayMindmap();
          mapObserver.disconnect();
        }
      }, { threshold: 0.15 });
      mapObserver.observe(mindmap);
    } else replayMindmap();
  }

  [...navLinks, ...mapLinks].forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      destination = document.querySelector(link.getAttribute("href"));
      if (!destination) return;
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
      requestScrollUpdate();
    });
  });

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ------------------------------------------------------------------ *
   * Mobile contents drawer
   * ------------------------------------------------------------------ */
  const navToggle = $("#navToggle");
  const navClose = $("#navClose");
  const navScrim = $("#navScrim");

  const setNavOpen = (open, restoreFocus = true) => {
    const wasOpen = document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    $(".main")?.toggleAttribute("inert", open);
    navToggle?.setAttribute("aria-expanded", String(open));
    navToggle?.setAttribute("aria-label", open ? "Close contents" : "Open contents");

    if (open && !wasOpen) {
      navClose?.focus({ preventScroll: true });
    } else if (!open && wasOpen && restoreFocus) {
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
      if (document.body.classList.contains("nav-open")) setNavOpen(false, false);
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
    if (lbZoomOut) lbZoomOut.disabled = scale <= 1.01;
    if (lbZoomIn) lbZoomIn.disabled = scale >= 5;
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
  const desktopQuery = window.matchMedia("(min-width: 1121px)");
  const handleDesktop = (event) => {
    if (event.matches) setNavOpen(false, false);
  };

  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", handleDesktop);
  else desktopQuery.addListener(handleDesktop);
})();
