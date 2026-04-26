function $(id) {
  return document.getElementById(id);
}

function renderSkeleton(container) {
  container.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 5; i++) {
    const row = document.createElement("div");
    row.className = "resource-row";
    row.innerHTML = `
      <div class="skeleton-shimmer sk-dir-1"></div>
      <div class="skeleton-shimmer sk-dir-2"></div>
      <div class="skeleton-shimmer sk-dir-3"></div>
    `;
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

function renderRow(r) {
  const website = r.website && String(r.website).trim()
    ? `<a class="resource-row-website" href="${r.website.startsWith('http') ? r.website : 'https://' + r.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>`
    : "";

  return `
    <div class="resource-row scroll-reveal">
      <h3 class="resource-row-name">${r.name}</h3>
      <span class="resource-row-cat label-tag">${r.category}</span>
      <p class="resource-row-desc">${r.description ?? ""}</p>
      ${website}
    </div>
  `;
}

function renderEmpty(container) {
  container.innerHTML = `
    <div class="empty-state">
      <h2>No results found</h2>
      <p>Try a different search term or category.</p>
    </div>
  `;
}

async function main() {
  const list = $("directory-list");
  const searchInput = $("directory-search");
  const tabs = Array.from(document.querySelectorAll(".tab-btn-modern"));
  const resultsCount = $("results-count");

  if (!list || !searchInput) return;

  let resources = [];
  let activeCategory = "All";
  let search = "";

  renderSkeleton(list);

  try {
    resources = await fetchApprovedResources();
  } catch (err) {
    console.error(err);
    renderEmpty(list);
    return;
  }

  function applyFilters() {
    const q = search.trim().toLowerCase();
    const filtered = resources.filter((r) => {
      const matchesCategory = activeCategory === "All" || r.category === activeCategory;
      const matchesSearch =
        q === "" ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
    }

    if (!filtered.length) renderEmpty(list);
    else list.innerHTML = filtered.map(renderRow).join("");

    // Re-initialize any icons that might be rendered inside rows (if added in the future)
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }

    // Use GSAP ScrollTrigger animator (replays on scroll up/down)
    if (typeof window.animateDirectoryRows === "function") {
      window.animateDirectoryRows();
    } else if (typeof window.observeScrollReveals === "function") {
      window.observeScrollReveals();
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category") || "All";
      tabs.forEach((b) => b.classList.toggle("is-active", b === btn));
      applyFilters();
    });
  });

  searchInput.addEventListener("input", (e) => {
    search = e.target.value || "";
    applyFilters();
  });

  // Initial render
  applyFilters();

  const initialTab = tabs.find((t) => (t.getAttribute("data-category") || "All") === "All");
  if (initialTab) initialTab.classList.add("is-active");
  applyFilters();
}

document.addEventListener("DOMContentLoaded", main);
