// stack-gsap.js — Sticky stacking card animation
// Cards enter one by one as you scroll through the section,
// with each new card layering on top while scaling down the previous ones.

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const section  = document.getElementById("stack-section");
  const cards    = section ? section.querySelectorAll(".stack-card") : [];
  if (!section || !cards.length) return;

  const TOTAL    = cards.length;
  // How many px each earlier card is shifted up to create the visual stack
  const OFFSET_PX = 18;
  // How much each card under the active one is scaled down
  const SCALE_STEP = 0.07;

  // Position each card so they all start in the same centre spot
  cards.forEach((card, i) => {
    card.style.setProperty("--card-offset", "0px");
  });

  // Master scroll timeline — pin the section, drive everything off one scrub
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
    },
  });

  cards.forEach((card, i) => {
    // The first card should be visible immediately so there's no dark gap when reaching the section
    if (i === 0) {
      gsap.set(card, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    // For subsequent cards, calculate their slice of the scroll progress (0 to 1)
    const segStart = (i - 1) / (TOTAL - 1);
    const segEnd   = (i - 1 + 0.6) / (TOTAL - 1); // quick snap-in

    // 1. Fade + rise this card into view
    tl.fromTo(
      card,
      { autoAlpha: 0, y: 60, scale: 1 },
      { autoAlpha: 1, y: 0,  scale: 1, ease: "power3.out", duration: segEnd - segStart },
      segStart
    );

    // 2. After this card is visible, push every previous card upward & scale it down
    for (let j = 0; j < i; j++) {
      const depth = i - j;            // how many layers below
      tl.to(
        cards[j],
        {
          y: -(OFFSET_PX * depth),
          scale: 1 - SCALE_STEP * depth,
          ease: "power2.out",
          duration: segEnd - segStart,
        },
        segStart                        // same moment the new card arrives
      );
    }
  });
});
