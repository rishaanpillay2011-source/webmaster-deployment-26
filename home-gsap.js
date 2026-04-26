// home-gsap.js — Hero entrance + section scroll animations

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP not loaded — home animations skipped.");
    return;
  }

  const hasSplitText = typeof SplitText !== "undefined";
  gsap.registerPlugin(ScrollTrigger);
  if (hasSplitText) gsap.registerPlugin(SplitText);

  // ─────────────────────────────────────────────
  // 1. ANIMATED DOT GRID CANVAS
  // ─────────────────────────────────────────────
  const canvas = document.getElementById("hero-grid-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let mouse = { x: -9999, y: -9999 };
    const DOT_GAP = 40;
    const DOT_R = 1.2;
    const INFLUENCE = 120;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.closest(".hero").addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.closest(".hero").addEventListener("mouseleave", () => {
      mouse.x = -9999; mouse.y = -9999;
    });

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / DOT_GAP) + 1;
      const rows = Math.ceil(canvas.height / DOT_GAP) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * DOT_GAP;
          const y = r * DOT_GAP;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const glow = Math.max(0, 1 - dist / INFLUENCE);

          ctx.beginPath();
          const radius = DOT_R + glow * 2.5;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(91, 163, 217, ${0.25 + glow * 0.7})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(drawGrid);
    }
    drawGrid();
  }

  // ─────────────────────────────────────────────
  // 2. HERO ENTRANCE TIMELINE
  // ─────────────────────────────────────────────
  const heroTitle = document.getElementById("hero-title");
  const heroEyebrow = document.getElementById("hero-eyebrow");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroCtas = document.getElementById("hero-ctas");
  const heroStats = document.getElementById("hero-stats");
  const heroScrollCue = document.getElementById("hero-scroll-cue");
  const heroTags = document.querySelectorAll(".hero-tag");

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Eyebrow slides in
  if (heroEyebrow) {
    tl.fromTo(heroEyebrow,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      0.2
    );
  }

  // Title — animate whole element (no SplitText; preserves color/shadow)
  if (heroTitle) {
    tl.fromTo(heroTitle,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" },
      0.45
    );
  }

  // Subtitle
  if (heroSubtitle) {
    tl.fromTo(heroSubtitle,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      1.1
    );
  }

  // CTAs
  if (heroCtas) {
    tl.fromTo(heroCtas,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      1.35
    );
  }

  // Stats
  if (heroStats) {
    const statNums = heroStats.querySelectorAll(".hero-stat-num");
    tl.fromTo(heroStats,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      1.55
    );
    // Stagger stat numbers count up via textContent illusion
    statNums.forEach((el) => {
      const finalText = el.textContent.trim();
      const finalNum = parseInt(finalText, 10);
      if (!isNaN(finalNum)) {
        const suffix = finalText.replace(String(finalNum), "");
        tl.fromTo(
          { val: 0 },
          {
            val: finalNum, duration: 1.4, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(this.targets()[0].val) + suffix; }
          },
          1.65
        );
      }
    });
  }

  // Scroll cue
  if (heroScrollCue) {
    tl.fromTo(heroScrollCue,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6 },
      1.9
    );

    heroScrollCue.addEventListener("click", () => {
      const next = document.querySelector(".alerts-section");
      if (next) next.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Floating tags — stagger in then gently float
  heroTags.forEach((tag, i) => {
    tl.fromTo(tag,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5 },
      1.0 + i * 0.08
    );
    // Infinite gentle float after entrance
    gsap.to(tag, {
      y: `${(i % 2 === 0 ? -1 : 1) * 10}px`,
      duration: 2.5 + i * 0.3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 2 + i * 0.1,
    });
  });

  // ─────────────────────────────────────────────
  // 3. SCROLL-DRIVEN EXIT
  // ─────────────────────────────────────────────
  const heroSection = document.querySelector(".hero");
  const heroInner = document.querySelector(".hero-inner");

  if (heroSection && heroInner) {
    gsap.to(heroInner, {
      yPercent: -25,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      },
    });

    // Fade floating tags out on scroll
    if (heroTags.length) {
      gsap.to(heroTags, {
        opacity: 0,
        y: -20,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "30% top",
          scrub: true,
        },
      });
    }

    // Scroll cue hides as soon as you scroll
    if (heroScrollCue) {
      gsap.to(heroScrollCue, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "10% top",
          scrub: true,
        },
      });
    }
  }

  // ─────────────────────────────────────────────
  // 4. SECTION SCROLL ANIMATIONS
  //    Pattern: toggleActions "restart none none reset"
  //    Plays when entering, resets to hidden when leaving back
  // ─────────────────────────────────────────────

  // ── Notice board label — chars fly in from center
  const alertsLabel = document.querySelector(".gsap-split-label");
  if (alertsLabel && hasSplitText) {
    const splitLabel = new SplitText(alertsLabel, { type: "chars,words" });
    gsap.fromTo(splitLabel.chars, 
      { y: 100, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: { each: 0.05, from: "random" },
        scrollTrigger: {
          trigger: alertsLabel,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      }
    );
  }

  // ── Notice board items — stagger slide-in from left
  const alertItems = document.querySelectorAll(".gsap-alert-item");
  if (alertItems.length) {
    gsap.from(alertItems, {
      scrollTrigger: {
        trigger: ".alerts-list",
        start: "top 85%",
        toggleActions: "restart none none reset",
      },
      x: -32,
      autoAlpha: 0,
      duration: 0.35,
      ease: "power3.out",
      stagger: { amount: 0.18, from: "start" }
    });
  }

  // ── Mission quote — chars cascade in from right
  const missionQuote = document.querySelector(".gsap-split-quote");
  if (missionQuote && hasSplitText) {
    const splitQuote = new SplitText(missionQuote, { type: "chars,words" });
    gsap.fromTo(splitQuote.chars, 
      { y: 100, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: { each: 0.03, from: "random" },
        scrollTrigger: {
          trigger: missionQuote,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      }
    );
  }

  // ── Mission text paragraphs — fade up staggered
  const missionTexts = document.querySelectorAll(".gsap-split-mission");
  if (missionTexts.length) {
    gsap.fromTo(
      missionTexts,
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: { amount: 0.4, from: "start" },
        scrollTrigger: {
          trigger: ".mission-grid",
          start: "top 85%",
          toggleActions: "restart none none reset",
        },
      }
    );
  }

  // ── Stack Intro Text — eyebrow, headline lines, sub-text
  const stackIntro   = document.getElementById("stack-intro");
  const stackEyebrow = document.getElementById("stack-eyebrow");
  const stackLines   = document.querySelectorAll(".stack-line");
  const stackSub     = document.getElementById("stack-sub");

  if (stackIntro && stackEyebrow && stackLines.length && stackSub) {
    // Set initial hidden state in JS so CSS never conflicts
    gsap.set(stackEyebrow, { autoAlpha: 0, y: 20 });
    gsap.set(stackLines,   { autoAlpha: 0, y: 50 });
    gsap.set(stackSub,     { autoAlpha: 0, y: 24 });

    const stackTl = gsap.timeline({
      scrollTrigger: {
        trigger: stackIntro,
        start: "top 75%",
        toggleActions: "restart none none reset",
      },
    });

    stackTl
      .to(stackEyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" })
      .to(stackLines,   { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out", stagger: 0.18 }, "-=0.3")
      .to(stackSub,     { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.4");
  }
});


