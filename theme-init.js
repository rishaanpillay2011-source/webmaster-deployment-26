(function () {
  try {
    if (localStorage.getItem("pathfinders-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (_) {
    /* ignore */
  }
})();
