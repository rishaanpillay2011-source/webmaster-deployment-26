// GSAP Scroll Trigger Initialization
// Register ScrollTrigger plugin for scroll-based animations

(() => {
  if (typeof gsap === 'undefined') {
    console.error('❌ GSAP library is required');
    return;
  }

  // Check if ScrollTrigger plugin is available (loaded from animations.js)
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    console.log('✓ ScrollTrigger plugin registered');
  } else {
    console.warn('⚠️ ScrollTrigger plugin not loaded - fold animations may not work');
  }
})();
