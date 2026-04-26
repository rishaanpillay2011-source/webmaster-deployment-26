(function () {
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
    </div>
  `;

  const toggle = container.querySelector("#nav-toggle");
  const overlay = container.querySelector("#nav-overlay");
  const backdrop = container.querySelector("#nav-backdrop");

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

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // ─────────────────────────────────────────────────────────────
  // Pathfinders AI (side drawer)
  // Injected here so it appears site-wide without a new subpage.
  // ─────────────────────────────────────────────────────────────
  if (!document.getElementById("pf-ai-root")) {
    const root = document.createElement("div");
    root.id = "pf-ai-root";
    root.innerHTML = `
      <button class="pf-ai-fab" type="button" id="pf-ai-fab" aria-label="Ask Pathfinders AI" aria-haspopup="dialog" aria-expanded="false">
        <span class="pf-ai-fab-icon" aria-hidden="true"><i data-lucide="sparkles"></i></span>
        <span class="pf-ai-fab-text">Ask AI</span>
      </button>

      <div class="pf-ai-backdrop pf-ai-backdrop--hidden" id="pf-ai-backdrop" aria-hidden="true"></div>

      <aside class="pf-ai-panel" id="pf-ai-panel" role="dialog" aria-modal="true" aria-label="Pathfinders AI" aria-hidden="true">
        <div class="pf-ai-header">
          <div class="pf-ai-title-wrap">
            <div class="pf-ai-badge" aria-hidden="true"><i data-lucide="sparkles"></i></div>
            <div>
              <div class="pf-ai-title">Pathfinders AI</div>
              <div class="pf-ai-subtitle">Local resource matching</div>
            </div>
          </div>

          <button class="pf-ai-close" type="button" id="pf-ai-close" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="pf-ai-body">
          <div class="pf-ai-intro" id="pf-ai-intro">
            <p>Tell me what you need and I’ll match you with resources in our directory.</p>
            <p class="pf-ai-intro-examples">Examples: “free food near Herndon”, “rental help in Arlington”, “legal aid for eviction”.</p>
          </div>

          <div class="pf-ai-messages" id="pf-ai-messages" aria-live="polite"></div>

          <div class="pf-ai-chips" id="pf-ai-chips" aria-label="Suggested prompts">
            <button class="pf-ai-chip" type="button" data-prompt="Free food near me">Free food near me</button>
            <button class="pf-ai-chip" type="button" data-prompt="Housing help today">Housing help today</button>
            <button class="pf-ai-chip" type="button" data-prompt="Mental health support">Mental health support</button>
          </div>
        </div>

        <form class="pf-ai-composer" id="pf-ai-composer">
          <label class="pf-ai-sr-only" for="pf-ai-input">Message</label>
          <input class="pf-ai-input" id="pf-ai-input" type="text" autocomplete="off" placeholder="Describe what you need…" />
          <button class="pf-ai-send" id="pf-ai-send" type="submit" aria-label="Send">
            <i data-lucide="send"></i>
          </button>
        </form>
      </aside>
    `;

    document.body.appendChild(root);

    const fab = document.getElementById("pf-ai-fab");
    const panel = document.getElementById("pf-ai-panel");
    const backdropAi = document.getElementById("pf-ai-backdrop");
    const closeBtn = document.getElementById("pf-ai-close");
    const composer = document.getElementById("pf-ai-composer");
    const input = document.getElementById("pf-ai-input");
    const messagesEl = document.getElementById("pf-ai-messages");
    const chipsEl = document.getElementById("pf-ai-chips");
    const introEl = document.getElementById("pf-ai-intro");

    const STORAGE_KEY = "pf_ai_chat_v1";

    function scrollMessagesToBottom() {
      if (!messagesEl) return;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setOpen(isOpen) {
      if (!fab || !panel || !backdropAi) return;

      if (isOpen) {
        panel.classList.add("is-open");
        backdropAi.classList.remove("pf-ai-backdrop--hidden");
        panel.setAttribute("aria-hidden", "false");
        backdropAi.setAttribute("aria-hidden", "false");
        fab.setAttribute("aria-expanded", "true");
        document.documentElement.classList.add("pf-ai-open");
        setTimeout(() => input?.focus(), 0);
      } else {
        panel.classList.remove("is-open");
        backdropAi.classList.add("pf-ai-backdrop--hidden");
        panel.setAttribute("aria-hidden", "true");
        backdropAi.setAttribute("aria-hidden", "true");
        fab.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("pf-ai-open");
      }
    }

    function addMessage(role, text, extraHtml = "") {
      if (!messagesEl) return;
      const row = document.createElement("div");
      row.className = `pf-ai-msg pf-ai-msg--${role}`;
      row.innerHTML = `
        <div class="pf-ai-bubble">
          <div class="pf-ai-bubble-text">${escapeHtml(text).replace(/\n/g, "<br />")}</div>
          ${extraHtml}
        </div>
      `;
      messagesEl.appendChild(row);
      introEl?.classList.add("pf-ai-hidden");
      scrollMessagesToBottom();
    }

    function saveChat() {
      try {
        if (!messagesEl) return;
        const items = Array.from(messagesEl.querySelectorAll(".pf-ai-msg")).map((node) => {
          const isUser = node.classList.contains("pf-ai-msg--user");
          const bubble = node.querySelector(".pf-ai-bubble-text");
          return { role: isUser ? "user" : "assistant", text: bubble ? bubble.textContent || "" : "" };
        });
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore storage failures
      }
    }

    function restoreChat() {
      try {
        if (!messagesEl) return;
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const items = JSON.parse(raw);
        if (!Array.isArray(items) || items.length === 0) return;
        items.forEach((m) => {
          if (!m || typeof m.text !== "string") return;
          addMessage(m.role === "user" ? "user" : "assistant", m.text);
        });
      } catch {
        // Ignore parse errors
      }
    }

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function normalizeQuery(q) {
      return String(q || "")
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, " ")
        .replace(/\s+/g, " ");
    }

    function inferCategory(q) {
      const s = normalizeQuery(q);
      const hits = [
        { cat: "Food", keys: ["food", "pantry", "grocer", "meal", "meals", "hungry", "snap"] },
        { cat: "Housing", keys: ["housing", "rent", "rental", "eviction", "shelter", "homeless", "mortgage"] },
        { cat: "Legal", keys: ["legal", "lawyer", "attorney", "court", "immigration", "tenant", "eviction"] },
        { cat: "Education", keys: ["school", "education", "tutoring", "classes", "training", "scholarship", "english"] },
        { cat: "Crisis", keys: ["crisis", "emergency", "help today", "urgent", "violence", "mental", "counseling"] },
      ];
      for (const h of hits) {
        if (h.keys.some((k) => s.includes(k))) return h.cat;
      }
      return null;
    }

    function scoreResource(r, q, category) {
      const s = normalizeQuery(q);
      let score = 0;
      if (category && String(r.category || "").toLowerCase() === category.toLowerCase()) score += 4;
      const hay = normalizeQuery(`${r.name || ""} ${r.description || ""} ${r.address || ""} ${r.category || ""}`);
      for (const token of s.split(" ").filter(Boolean)) {
        if (token.length < 3) continue;
        if (hay.includes(token)) score += 1;
      }
      return score;
    }

    async function matchResources(q) {
      const category = inferCategory(q);
      const fetcher =
        typeof window.fetchApprovedResources === "function"
          ? window.fetchApprovedResources
          : async () => (Array.isArray(window.RESOURCES) ? window.RESOURCES : []);

      const list = await fetcher();
      const approved = (Array.isArray(list) ? list : []).filter((r) => r && (r.approved ?? true));

      const scored = approved
        .map((r) => ({ r, score: scoreResource(r, q, category) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((x) => x.r);

      return { category, results: scored };
    }

    function renderResourceCards(results) {
      if (!results || results.length === 0) return "";
      const cards = results
        .map((r) => {
          const website = r.website ? `<a class="pf-ai-card-link" href="${escapeHtml(r.website)}" target="_blank" rel="noopener noreferrer">Visit website</a>` : "";
          const address = r.address ? `<div class="pf-ai-card-meta">${escapeHtml(r.address)}</div>` : "";
          return `
            <div class="pf-ai-card">
              <div class="pf-ai-card-top">
                <div class="pf-ai-card-name">${escapeHtml(r.name || "Resource")}</div>
                <div class="pf-ai-card-tag">${escapeHtml(r.category || "")}</div>
              </div>
              <div class="pf-ai-card-desc">${escapeHtml(r.description || "")}</div>
              ${address}
              <div class="pf-ai-card-actions">
                ${website}
                <a class="pf-ai-card-link pf-ai-card-link--muted" href="directory.html">Open directory</a>
              </div>
            </div>
          `;
        })
        .join("");

      return `<div class="pf-ai-cards" role="list">${cards}</div>`;
    }

    async function respond(q) {
      const cleaned = String(q || "").trim();
      if (!cleaned) return;

      addMessage("user", cleaned);

      try {
        const { category, results } = await matchResources(cleaned);
        if (results.length === 0) {
          addMessage(
            "assistant",
            `I couldn’t find a close match in the directory yet. Try adding a location (e.g. “Herndon”, “Arlington”) or a need (food, rent help, legal aid).`,
            `<div class="pf-ai-inline-actions"><a class="pf-ai-inline-link" href="directory.html">Browse the directory</a></div>`
          );
        } else {
          const header = category ? `Here are a few ${category.toLowerCase()} resources that match:` : `Here are a few resources that match:`;
          addMessage("assistant", header, renderResourceCards(results));
        }
      } catch {
        addMessage("assistant", "Something went wrong while matching resources. Please try again.");
      }

      saveChat();
    }

    fab?.addEventListener("click", () => setOpen(!panel?.classList.contains("is-open")));
    closeBtn?.addEventListener("click", () => setOpen(false));
    backdropAi?.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    chipsEl?.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const btn = t.closest("button[data-prompt]");
      if (!btn) return;
      const prompt = btn.getAttribute("data-prompt") || "";
      setOpen(true);
      respond(prompt);
    });

    composer?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input?.value || "";
      input.value = "";
      respond(val);
    });

    restoreChat();
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

})();
