(function () {
  const THEME_KEY = "pathfinders-theme";

  function isDark() {
    return document.documentElement.classList.contains("dark");
  }

  function setTheme(dark) {
    try {
      if (dark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_KEY, "light");
      }
    } catch (_) {
      document.documentElement.classList.toggle("dark", dark);
    }
    updateThemeIcons();
  }

  function updateThemeIcons() {
    const root = document.getElementById("nav-container");
    if (!root) return;
    const suns = root.querySelectorAll(".theme-icon--sun");
    const moons = root.querySelectorAll(".theme-icon--moon");
    if (!suns.length || !moons.length) return;
    const dark = isDark();
    suns.forEach((el) => el.classList.toggle("is-visible", !dark));
    moons.forEach((el) => el.classList.toggle("is-visible", dark));
  }

  const container = document.getElementById("nav-container");
  if (!container) return;

  const base = "";
  const homeBase = "";

  const links = [
    { href: homeBase + "index.html", label: "Home", id: "index.html" },
    { href: base + "about.html", label: "About", id: "about.html" },
    { href: base + "directory.html", label: "Directory", id: "directory.html" },
    { href: base + "map.html", label: "Map", id: "map.html" },
    { href: base + "events.html", label: "Events", id: "events.html" },
    { href: base + "submit.html", label: "Submit", id: "submit.html" },
    { href: base + "code.html", label: "Code & Repo", id: "code.html" },
    { href: base + "references.html", label: "References", id: "references.html" },
  ];

  const path = window.location.pathname || "";
  const last = path.replace(/\/+$/, "").split("/").pop() || "index.html";
  const current = last === "" ? "index.html" : last;

  const activeLink = links.find((l) => l.id === current);
  const activeHref = activeLink ? activeLink.href : (homeBase + "index.html");

  container.innerHTML = `
    <nav class="site-nav">
      <div class="site-nav-inner">
        <a class="site-brand" href="${homeBase}index.html" aria-label="Pathfinders">
          <i data-lucide="compass" class="brand-logo-icon"></i>
          <span>Pathfinders</span>
        </a>

        <div class="nav-right">
          <div class="nav-links" aria-label="Primary navigation">
            ${links
              .map(
                (l) =>
                  `<a class="nav-link ${l.href === activeHref ? "is-active" : ""}" href="${l.href}">${l.label}</a>`
              )
              .join("")}
          </div>

          <a class="nav-login-link" href="${base}login.html" aria-label="Sign in or register">Sign In</a>

          <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle light or dark mode">
            <span class="theme-icon theme-icon--sun is-visible" aria-hidden="true"><i data-lucide="sun"></i></span>
            <span class="theme-icon theme-icon--moon" aria-hidden="true"><i data-lucide="moon"></i></span>
          </button>

          <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
            <span class="nav-toggle-icons">
              <i data-lucide="menu" id="nav-icon-open"></i>
              <i data-lucide="x" id="nav-icon-close" class="nav-icon-hidden"></i>
            </span>
          </button>
        </div>
      </div>
    </nav>

    <div class="nav-overlay-backdrop nav-backdrop-hidden" id="nav-backdrop"></div>
    <div class="nav-overlay" id="nav-overlay" aria-hidden="true">
      ${links
        .map((l) => {
          const isActive = l.href === activeHref;
          return `<a class="${isActive ? "is-active" : ""}" href="${l.href}">${l.label}</a>`;
        })
        .join("")}
      <a class="nav-overlay-login-link" href="${base}login.html">Sign In</a>
      <button type="button" class="theme-toggle theme-toggle--overlay" id="theme-toggle-overlay" aria-label="Toggle light or dark mode">
        <span class="theme-icon theme-icon--sun is-visible" aria-hidden="true"><i data-lucide="sun"></i></span>
        <span class="theme-icon theme-icon--moon" aria-hidden="true"><i data-lucide="moon"></i></span>
      </button>
    </div>
  `;

  const toggle = container.querySelector("#nav-toggle");
  const overlay = container.querySelector("#nav-overlay");
  const backdrop = container.querySelector("#nav-backdrop");
  const themeBtn = container.querySelector("#theme-toggle");
  const themeBtnOverlay = container.querySelector("#theme-toggle-overlay");

  function openNav() {
    overlay.classList.add("is-open");
    backdrop.classList.remove("nav-backdrop-hidden");
    overlay.setAttribute("aria-hidden", "false");
    toggle?.setAttribute("aria-expanded", "true");

    const openIcon = container.querySelector("#nav-icon-open");
    const closeIcon = container.querySelector("#nav-icon-close");
    if (openIcon) openIcon.classList.add("nav-icon-hidden");
    if (closeIcon) closeIcon.classList.remove("nav-icon-hidden");
  }

  function closeNav() {
    overlay.classList.remove("is-open");
    backdrop.classList.add("nav-backdrop-hidden");
    overlay.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");

    const openIcon = container.querySelector("#nav-icon-open");
    const closeIcon = container.querySelector("#nav-icon-close");
    if (openIcon) openIcon.classList.remove("nav-icon-hidden");
    if (closeIcon) closeIcon.classList.add("nav-icon-hidden");
  }

  if (toggle && overlay && backdrop) {
    toggle.addEventListener("click", () => {
      const isOpen = overlay.classList.contains("is-open");
      if (isOpen) closeNav();
      else openNav();
    });

    backdrop.addEventListener("click", closeNav);
    overlay.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.tagName === "A") closeNav();
    });
  }

  function bindTheme(btn) {
    if (!btn) return;
    btn.addEventListener("click", () => {
      setTheme(!isDark());
    });
  }

  bindTheme(themeBtn);
  bindTheme(themeBtnOverlay);

  updateThemeIcons();

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

})();
