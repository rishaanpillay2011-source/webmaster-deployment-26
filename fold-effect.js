// ==================== FOLD EFFECT - 3-PANEL PAPER FOLD ====================
// Unfolds top and bottom panels via scrolling while marquee text scrolls horizontally
// Designed for inline document flow (not fixed)

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ==================== MARQUEE TEXT HORIZONTAL SCROLL ====================
// Rows alternate direction: left scroll (rows 0,2) vs right scroll (rows 1,3)

gsap.utils.toArray('.marquee').forEach((el, index) => {
  const w = el.querySelector('.track');
  if (!w) return;
  
  // Even indices (0,2,4...): scroll left [-300 to -2000]
  // Odd indices (1,3,5...): scroll right [-1700 to 0]
  const [x, xEnd] = (index % 2 == 0) ? [-300, -2000] : [-1700, 0];
  
  gsap.fromTo(w, { x }, {
    x: xEnd,
    scrollTrigger: {
      trigger: '#fold-effect',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1
    }
  });
});

// ==================== FOLD PANEL UNFOLDING ====================
// Top panel unfolds from rotateX(-120deg) to rotateX(0deg)
// Bottom panel unfolds from rotateX(120deg) to rotateX(0deg)

gsap.fromTo('.fold-top', 
  { rotateX: -120 },
  {
    rotateX: 0,
    scrollTrigger: {
      trigger: '#fold-effect',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5
    }
  }
);

gsap.fromTo('.fold-bottom',
  { rotateX: 120 },
  {
    rotateX: 0,
    scrollTrigger: {
      trigger: '#fold-effect',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5
    }
  }
);

// ==================== CONTENT SYNC LOOP ====================
// Sync all .fold-content elements with smooth vertical translation
// This keeps marquee text perfectly aligned across fold seams

const centerContent = document.getElementById('center-content');
const centerFold = document.getElementById('center-fold');
const foldsContent = Array.from(document.querySelectorAll('.fold-content'));

let targetScroll = 0;
let currentScroll = 0;

const tick = () => {
  // Get scroll position relative to fold section
  const foldEffect = document.getElementById('fold-effect');
  const scrollTop = window.scrollY || window.pageYOffset;
  const foldRect = foldEffect.getBoundingClientRect();
  const foldScrollTop = scrollTop + foldRect.top;
  
  // Calculate target scroll based on fold visibility
  const startTrigger = foldScrollTop - window.innerHeight * 0.8;
  const endTrigger = foldScrollTop + foldRect.height - window.innerHeight * 0.2;
  const range = endTrigger - startTrigger;
  const progress = (scrollTop - startTrigger) / range;
  
  targetScroll = Math.max(0, Math.min(1, progress)) * (centerContent.clientHeight - centerFold.clientHeight);
  currentScroll += (targetScroll - currentScroll) * 0.1;
  
  foldsContent.forEach(content => {
    content.style.transform = `translateY(${currentScroll}px)`;
  });
  
  requestAnimationFrame(tick);
};

tick();

// ==================== ALL IN ONE PLACE STAGGER ====================
window.addEventListener('load', () => {
  if (typeof SplitText === 'undefined') {
    console.error('❌ SplitText not loaded');
    return;
  }

  gsap.registerPlugin(SplitText);

  const textEl = document.querySelector('.allinone-text');
  if (!textEl) {
    console.warn('⚠️ .allinone-text not found');
    return;
  }

  const split = SplitText.create(textEl, {
    type: "chars, words",
  });

  gsap.from(split.chars, {
    y: 100,
    autoAlpha: 0,
    stagger: {
      amount: 0.5,
      from: "random"
    },
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".allinone-section",
      start: "top 75%",
      toggleActions: "play none none reset",
    }
  });
});

// ==================== PARALLAX EXPLORE -> FURTHER TRANSITION ====================
// Ocean rises from the bottom to cover the mountain scene (Unfold-style reveal)
const parallaxSection = document.querySelector('#parallax-section');
if (parallaxSection) {
  gsap.registerPlugin(ScrollTrigger);

  const peffectLayer = document.querySelector('.parallax-peffect');
  const waterLayer = document.querySelector('.parallax-water');
  const parallaxLabel = document.querySelector('.parallax-label');
  const parallaxDetail = document.querySelector('.parallax-label--further');
  const arrowBtn = document.querySelector('.parallax-arrow');

  // Set initial state: ocean starts below the viewport, fully visible (not faded)
  gsap.set(waterLayer, { yPercent: 100, opacity: 1 });

  const parallaxTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: parallaxSection,
      start: 'top top',
      end: '+=120%',
      scrub: 0.6,
      pin: true,
      pinSpacing: true,
      markers: false,
    }
  });

  const parallaxTrigger = parallaxTimeline.scrollTrigger;

  // Mountains drift upward and darken as the ocean rises
  parallaxTimeline.to(peffectLayer, {
    yPercent: -15,
    scale: 1.05,
    duration: 1,
    ease: 'none',
  }, 0);

  // Terrain gradient darkens to deep ocean colour
  parallaxTimeline.to('.parallax-terrain', {
    background: 'linear-gradient(180deg, #1a3d6b 0%, #112d53 38%, #081b38 77%, #041020 100%)',
    duration: 1,
    ease: 'none',
  }, 0);

  // Ocean rises from the bottom to fully cover the scene
  parallaxTimeline.to(waterLayer, {
    yPercent: 0,
    duration: 1,
    ease: 'power1.inOut',
  }, 0.05);

  // "EXPLORE" fades out and drifts up as the ocean starts rising
  parallaxTimeline.to(parallaxLabel, {
    opacity: 0,
    yPercent: -30,
    duration: 0.35,
    ease: 'power2.in',
  }, 0.15);

  // Arrow fades out
  parallaxTimeline.to('.parallax-arrow', {
    opacity: 0,
    y: '20px',
    duration: 0.3,
    ease: 'power2.in',
  }, 0.2);

  // "FURTHER" fades in once the ocean has mostly covered
  parallaxTimeline.fromTo(parallaxDetail, {
    opacity: 0,
    yPercent: 20,
  }, {
    opacity: 1,
    yPercent: 0,
    duration: 0.35,
    ease: 'power2.out',
  }, 0.6);

  // "Join Now" button fades in at the very end
  parallaxTimeline.fromTo('.parallax-join-btn', {
    opacity: 0,
    yPercent: 30,
  }, {
    opacity: 1,
    yPercent: 0,
    duration: 0.4,
    ease: 'power2.out',
    onStart: () => {
      gsap.set('.parallax-join-btn', { pointerEvents: 'auto' });
    },
    onReverseComplete: () => {
      gsap.set('.parallax-join-btn', { pointerEvents: 'none' });
    }
  }, 0.75);

  if (arrowBtn && parallaxTrigger) {
    arrowBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      gsap.to(window, {
        scrollTo: {
          y: parallaxTrigger.end,
          autoKill: false,
        },
        duration: 0.9,
        ease: 'power2.inOut',
      });
    });
  }
}