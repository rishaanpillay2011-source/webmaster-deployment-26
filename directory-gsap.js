// directory-gsap.js — GSAP ScrollTrigger animations for directory page
//
// toggleActions: "restart none none reset"
//   - stays visible as you scroll past (no reverse)
//   - resets to hidden only when you scroll back above the trigger
//   - replays fresh every time you scroll back down into it

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP / ScrollTrigger not loaded — directory animations skipped.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Page title "Directory"
  // Strip the CSS scroll-reveal class so GSAP fully owns visibility.
  // Use fromTo() so GSAP explicitly defines both the hidden (from) and
  // visible (to) states, regardless of what CSS says.
  const pageTitle = document.querySelector(".dir-title");
  if (pageTitle) {
    pageTitle.classList.remove("scroll-reveal");
    gsap.set(pageTitle, { autoAlpha: 0, y: 40 });

    gsap.fromTo(
      pageTitle,
      { y: 40, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: pageTitle,
          start: "top 90%",
          toggleActions: "restart none none reset",
        },
      }
    );
  }

  // ── Search & Filter Controls
  const controls = document.querySelector(".directory-controls");
  if (controls) {
    controls.classList.remove("scroll-reveal");
    gsap.set(controls, { autoAlpha: 0, y: 30 });
    gsap.fromTo(
      controls,
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.1,
        scrollTrigger: {
          trigger: controls,
          start: "top 90%",
          toggleActions: "restart none none reset",
        },
      }
    );
  }

  // ── Results Meta Counter
  const meta = document.querySelector(".results-meta");
  if (meta) {
    meta.classList.remove("scroll-reveal");
    gsap.set(meta, { autoAlpha: 0, y: 20 });
    gsap.fromTo(
      meta,
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: meta,
          start: "top 90%",
          toggleActions: "restart none none reset",
        },
      }
    );
  }

  // ── Resource rows — called after directory.js renders them
  function animateResourceRows() {
    const rows = document.querySelectorAll(".resource-row:not([data-gsap-animated])");
    rows.forEach((row, i) => {
      row.setAttribute("data-gsap-animated", "1");
      row.classList.remove("scroll-reveal");
      gsap.set(row, { autoAlpha: 0, y: 28 });

      gsap.fromTo(
        row,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.04,
          scrollTrigger: {
            trigger: row,
            start: "top 92%",
            toggleActions: "restart none none reset",
          },
        }
      );
    });
  }

  // Expose for directory.js to call after rendering
  window.animateDirectoryRows = animateResourceRows;

  // Initial call in case elements already exist
  animateResourceRows();
});
