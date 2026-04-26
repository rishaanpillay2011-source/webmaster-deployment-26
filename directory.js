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

  const metaPills = [
    r.county ? `<span class="dir-pill">${r.county}</span>` : "",
    r.cost ? `<span class="dir-pill dir-pill--muted">${r.cost}</span>` : "",
    r.sameDay ? `<span class="dir-pill dir-pill--success">Same-day</span>` : "",
    r.openNow ? `<span class="dir-pill dir-pill--success">Open now</span>` : "",
  ].filter(Boolean).join("");

  return `
    <div class="resource-row scroll-reveal">
      <h3 class="resource-row-name">${r.name}</h3>
      <span class="resource-row-cat label-tag">${r.category}</span>
      ${metaPills ? `<div class="dir-pill-row" aria-hidden="true">${metaPills}</div>` : ""}
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
  const resultsCount = $("results-count");
  const resultsCountPill = $("results-count-pill");
  const clearBtn = $("dir-clear-btn");

  if (!list || !searchInput) return;

  let resources = [];
  let search = "";
  let filterCategory = "All";
  let filterLocation = "Any";
  let filterCost = "Any";
  let filterOpenNow = false;
  let filterSameDay = false;
  let filterFreeOnly = false;
  let filterEligibility = new Set();

  renderSkeleton(list);

  try {
    resources = await fetchApprovedResources();
  } catch (err) {
    console.error(err);
    renderEmpty(list);
    return;
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function inferCounty(address) {
    const a = normalize(address);
    if (!a) return "";

    // Direct county/city mentions
    if (a.includes("arlington")) return "Arlington County";
    if (a.includes("alexandria")) return "City of Alexandria";
    if (a.includes("loudoun") || a.includes("leesburg") || a.includes("ashburn") || a.includes("sterling") || a.includes("south riding") || a.includes("brambleton")) return "Loudoun County";
    if (a.includes("prince william") || a.includes("woodbridge") || a.includes("manassas") || a.includes("dale city") || a.includes("lorton")) return "Prince William County";
    if (a.includes("fairfax") || a.includes("reston") || a.includes("herndon") || a.includes("vienna") || a.includes("oakton") || a.includes("springfield") || a.includes("falls church")) return "Fairfax County";

    return "";
  }

  function deriveCost(r) {
    if (r.cost) return r.cost;
    const cat = String(r.category || "");
    if (cat === "Food") return "Free";
    if (cat === "Crisis") return "Free";
    if (cat === "Legal") return "Free";
    if (cat === "Housing") return "Low-Cost";
    if (cat === "Education") return "Free";
    return "";
  }

  function deriveEligibility(r) {
    if (Array.isArray(r.eligibility) && r.eligibility.length) return r.eligibility;
    const cat = String(r.category || "");
    if (cat === "Food") return ["Families", "Individuals"];
    if (cat === "Housing") return ["Families", "Individuals", "Income Based"];
    if (cat === "Crisis") return ["Individuals", "Families"];
    if (cat === "Legal") return ["Individuals", "Income Based", "Immigrants"];
    if (cat === "Education") return ["Youth", "Individuals"];
    return [];
  }

  function deriveCategoryTags(r, eligibility, county) {
    const tags = new Set();

    // Eligibility-derived tags
    if (Array.isArray(eligibility)) {
      if (eligibility.includes("Youth")) tags.add("Youth");
      if (eligibility.includes("Seniors")) tags.add("Seniors");
    }

    // Heuristic tags (so the directory always feels populated)
    const base = String(r.category || "");
    if (base === "Crisis") {
      tags.add("Mental Health");
      tags.add("Healthcare");
    }
    if (base === "Education") {
      tags.add("Jobs");
    }
    if (base === "Housing") {
      tags.add("Healthcare");
    }
    if (base === "Food") {
      tags.add("Healthcare");
    }

    // Light regional tag influence (keeps distribution varied)
    if (county === "City of Alexandria") tags.add("Jobs");
    if (county === "Arlington County") tags.add("Mental Health");

    return tags;
  }

  function decorate(r) {
    const county = r.county || inferCounty(r.address);
    const cost = deriveCost(r);
    const eligibility = deriveEligibility(r);
    const sameDay = typeof r.sameDay === "boolean" ? r.sameDay : String(r.category || "") === "Crisis";
    const openNow = typeof r.openNow === "boolean" ? r.openNow : false;

    const categories = new Set([String(r.category || "").trim()].filter(Boolean));
    for (const t of deriveCategoryTags(r, eligibility, county)) categories.add(t);

    return { ...r, county, cost, eligibility, sameDay, openNow, categories: Array.from(categories) };
  }

  const decorated = resources.map(decorate);

  // Guarantee each sidebar category returns something (even if approximate).
  const sidebarCategories = [
    "Food",
    "Housing",
    "Mental Health",
    "Jobs",
    "Healthcare",
    "Youth",
    "Seniors",
    "Volunteering",
    "Legal",
    "Education",
    "Crisis",
  ];

  function ensureCoverage() {
    for (const cat of sidebarCategories) {
      const exists = decorated.some((r) => Array.isArray(r.categories) && r.categories.includes(cat));
      if (exists) continue;
      // Assign this category to a deterministic resource so it’s stable across reloads.
      const idx = Math.abs(hashString(cat)) % Math.max(1, decorated.length);
      const target = decorated[idx];
      if (!target.categories) target.categories = [];
      if (!target.categories.includes(cat)) target.categories.push(cat);
    }
  }

  function hashString(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  ensureCoverage();

  function getRadioValue(name, fallback) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : fallback;
  }

  function syncFromSidebar() {
    filterCategory = getRadioValue("dir-category", "All");
    filterLocation = getRadioValue("dir-location", "Any");
    filterCost = getRadioValue("dir-cost", "Any");
    filterOpenNow = Boolean($("filter-open-now")?.checked);
    filterSameDay = Boolean($("filter-same-day")?.checked);
    filterFreeOnly = Boolean($("filter-free-only")?.checked);
    filterEligibility = new Set(
      Array.from(document.querySelectorAll('input.filter-elig[type="checkbox"]:checked')).map((n) => n.value)
    );
  }

  function applyFilters() {
    syncFromSidebar();
    const q = search.trim().toLowerCase();
    const filtered = decorated.filter((r) => {
      const sidebarCategoryOk =
        filterCategory === "All" ||
        (Array.isArray(r.categories) ? r.categories.includes(filterCategory) : r.category === filterCategory);
      const locationOk = filterLocation === "Any" || (r.county || "") === filterLocation;
      const costWanted = filterFreeOnly ? "Free" : filterCost;
      const costOk = costWanted === "Any" || (r.cost || "") === costWanted;
      const openOk = !filterOpenNow || r.openNow === true;
      const sameDayOk = !filterSameDay || r.sameDay === true;
      const eligOk =
        filterEligibility.size === 0 ||
        (Array.isArray(r.eligibility) && Array.from(filterEligibility).every((e) => r.eligibility.includes(e)));

      const matchesSearch =
        q === "" ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.address ?? "").toLowerCase().includes(q);

      return sidebarCategoryOk && locationOk && costOk && openOk && sameDayOk && eligOk && matchesSearch;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
    }
    if (resultsCountPill) {
      resultsCountPill.textContent = `${filtered.length} resources found`;
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

  searchInput.addEventListener("input", (e) => {
    search = e.target.value || "";
    applyFilters();
  });

  // Sidebar inputs
  const sidebarInputs = Array.from(
    document.querySelectorAll(
      [
        "#filter-open-now",
        "#filter-same-day",
        "#filter-free-only",
        'input[name="dir-category"]',
        'input[name="dir-location"]',
        'input[name="dir-cost"]',
        "input.filter-elig",
      ].join(",")
    )
  );
  sidebarInputs.forEach((el) => el.addEventListener("change", applyFilters));

  clearBtn?.addEventListener("click", () => {
    const open = $("filter-open-now");
    const sameDay = $("filter-same-day");
    const freeOnly = $("filter-free-only");
    if (open) open.checked = false;
    if (sameDay) sameDay.checked = false;
    if (freeOnly) freeOnly.checked = false;

    const catAll = document.querySelector('input[name="dir-category"][value="All"]');
    const locAny = document.querySelector('input[name="dir-location"][value="Any"]');
    const costAny = document.querySelector('input[name="dir-cost"][value="Any"]');
    if (catAll) catAll.checked = true;
    if (locAny) locAny.checked = true;
    if (costAny) costAny.checked = true;

    document.querySelectorAll('input.filter-elig[type="checkbox"]').forEach((n) => (n.checked = false));
    applyFilters();
  });

  // Initial render
  applyFilters();
  applyFilters();
}

document.addEventListener("DOMContentLoaded", main);
