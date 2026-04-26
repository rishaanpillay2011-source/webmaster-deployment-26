(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  function observeScrollReveals() {
    document.querySelectorAll(".scroll-reveal:not([data-reveal-watched])").forEach((el) => {
      el.setAttribute("data-reveal-watched", "1");
      observer.observe(el);
    });
  }

  observeScrollReveals();

  window.observeScrollReveals = observeScrollReveals;
})();
