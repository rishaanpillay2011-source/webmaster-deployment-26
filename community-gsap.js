// community-gsap.js — GSAP ScrollTrigger animations for the community page

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP / ScrollTrigger not loaded — community animations skipped.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const setupReveal = (selector, yOffset = 30, duration = 0.9) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      // Disable any CSS scroll-reveal so GSAP fully owns the animation
      el.classList.remove("scroll-reveal");
      gsap.set(el, { autoAlpha: 0, y: yOffset });
      
      gsap.fromTo(
        el,
        { y: yOffset, autoAlpha: 0 },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "restart none none reset",
          },
        }
      );
    });
  };

  setupReveal(".dir-title", 40, 1.1);
  setupReveal(".community-intro");
  setupReveal(".ref-section-title");
  setupReveal(".community-card");
  setupReveal(".test-divider", 30, 1.0);
});
