// references-gsap.js — GSAP ScrollTrigger animations for references page
// Sources slide in smoothly and replay when scrolled back up

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP / ScrollTrigger not loaded — references animations skipped.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Page title
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

  // Reference rows — stagger slide-up from bottom
  const rows = document.querySelectorAll(".reference-row");
  rows.forEach((row, i) => {
    // Disable any CSS scroll-reveal so GSAP fully owns the animation
    row.classList.remove("scroll-reveal");
    gsap.set(row, { autoAlpha: 0, y: 30 });
    gsap.fromTo(
      row,
      { y: 30, autoAlpha: 0 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: row,
          start: "top 90%",
          toggleActions: "restart none none reset",
        },
      }
    );
  });

  // Section titles (Image Citations, Resource Citations)
  const sectionTitles = document.querySelectorAll(".ref-section-title");
  sectionTitles.forEach((title) => {
    title.classList.remove("scroll-reveal");
    gsap.set(title, { autoAlpha: 0, y: 30 });
    gsap.fromTo(
      title,
      { y: 30, autoAlpha: 0 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: title,
          start: "top 90%",
          toggleActions: "restart none none reset",
        },
      }
    );
  });
});
