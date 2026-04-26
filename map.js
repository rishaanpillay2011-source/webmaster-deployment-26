function $(id) {
  return document.getElementById(id);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markerInnerHtml({ selected, pulse }) {
  const classes = ["map-marker"];
  if (selected) classes.push("selected");
  if (pulse) classes.push("pulse");
  return `
    <div class="${classes.join(" ")}">
      <div class="map-marker-dot"></div>
    </div>
  `;
}

function updateMarkerStyles(markersById, { activeId, hoveredId }) {
  markersById.forEach((marker, id) => {
    const root = marker.getElement?.() ?? null;
    if (!root) return;
    const inner = root.querySelector?.(".map-marker");
    if (!inner) return;

    inner.classList.toggle("selected", id === activeId);
    inner.classList.toggle("pulse", id === hoveredId);
  });
}

function safeHref(url) {
  const s = String(url ?? "").trim();
  if (!s || !/^https?:\/\//i.test(s)) return "#";
  return s.replace(/"/g, "&quot;");
}

function renderSidebarItem(r, { activeId }) {
  const website =
    r.website && String(r.website).trim()
      ? `<a class="map-item-website" href="${safeHref(r.website)}" target="_blank" rel="noopener noreferrer">Visit website</a>`
      : "";

  const active = r.id === activeId ? " active" : "";

  return `
    <div class="map-item${active}" data-id="${escapeHtml(r.id)}" tabindex="0" role="button">
      <h4>${escapeHtml(r.name)}</h4>
      <span class="label-tag">${escapeHtml(r.category)}</span>
      ${r.address ? `<p class="map-item-address">${escapeHtml(r.address)}</p>` : ""}
      ${website}
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const sidebarList = $("map-resource-list");
  const searchInput = $("map-search");
  const mapEl = $("map-container");

  if (!sidebarList || !searchInput || !mapEl) return;

  if (typeof L === "undefined") {
    sidebarList.innerHTML =
      '<p class="map-loading-msg">Map library failed to load. Check your network connection.</p>';
    return;
  }

  sidebarList.innerHTML = '<p class="map-loading-msg">Loading resources…</p>';

  const map = L.map(mapEl).setView([38.8816, -77.1945], 11);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap contributors © CARTO",
    maxZoom: 19,
  }).addTo(map);

  requestAnimationFrame(() => {
    map.invalidateSize();
  });
  setTimeout(() => map.invalidateSize(), 200);

  const markersById = new Map();
  let allResources = [];
  let activeId = null;
  let hoveredId = null;
  let searchQuery = "";

  function matchesSearch(r) {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const hay = `${r.name} ${r.category} ${r.address ?? ""} ${r.website ?? ""}`.toLowerCase();
    return hay.includes(q);
  }

  function filteredResources() {
    return allResources.filter((r) => {
      const lat = r.lat;
      const lng = r.lng;
      const hasCoords =
        lat != null &&
        lng != null &&
        !Number.isNaN(Number(lat)) &&
        !Number.isNaN(Number(lng));
      return hasCoords && matchesSearch(r);
    });
  }

  function clearMarkers() {
    markersById.forEach((m) => m.remove());
    markersById.clear();
  }

  function renderSidebar(items) {
    if (!items.length) {
      sidebarList.innerHTML =
        '<div class="empty-state map-empty"><h2>No results</h2><p>Try a different search term.</p></div>';
      return;
    }

    sidebarList.innerHTML = items.map((r) => renderSidebarItem(r, { activeId })).join("");

    sidebarList.querySelectorAll(".map-item").forEach((item) => {
      const id = item.getAttribute("data-id");
      if (!id) return;

      item.addEventListener("mouseenter", () => {
        hoveredId = id;
        item.classList.add("is-hovered");
        updateMarkerStyles(markersById, { activeId, hoveredId });
      });
      item.addEventListener("mouseleave", () => {
        hoveredId = null;
        item.classList.remove("is-hovered");
        updateMarkerStyles(markersById, { activeId, hoveredId });
      });

      item.addEventListener("click", () => {
        const r = items.find((x) => x.id === id);
        activeId = id;
        hoveredId = null;
        sidebarList.querySelectorAll(".map-item").forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        if (r && r.lat != null && r.lng != null) {
          map.setView([Number(r.lat), Number(r.lng)], 14);
        }
        updateMarkerStyles(markersById, { activeId, hoveredId });
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function renderMarkers(items) {
    clearMarkers();

    items.forEach((r) => {
      const lat = Number(r.lat);
      const lng = Number(r.lng);
      const icon = L.divIcon({
        className: "map-marker-wrap leaflet-marker-icon-custom",
        html: markerInnerHtml({ selected: r.id === activeId, pulse: r.id === hoveredId }),
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`<strong style="font-family: var(--font-body); font-size: 1.05rem;">${escapeHtml(r.name)}</strong><br/><br/><span style="font-family: var(--font-body); font-size: 0.9rem; color: var(--muted);">${escapeHtml(r.description || "No description provided.")}</span>`);

      marker.on("click", () => {
        activeId = r.id;
        hoveredId = null;
        const el = sidebarList.querySelector(
          `.map-item[data-id="${String(r.id).replace(/"/g, "")}"]`
        );
        sidebarList.querySelectorAll(".map-item").forEach((node) => node.classList.remove("active"));
        el?.classList.add("active");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        map.setView([lat, lng], 14);
        updateMarkerStyles(markersById, { activeId, hoveredId });
      });

      markersById.set(r.id, marker);
    });

    updateMarkerStyles(markersById, { activeId, hoveredId });
  }

  function refreshUI() {
    const items = filteredResources();
    if (activeId && !items.some((r) => r.id === activeId)) activeId = null;
    renderSidebar(items);
    renderMarkers(items);
  }

  try {
    const data = await fetchApprovedResources();
    allResources = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    sidebarList.innerHTML =
      '<div class="empty-state map-empty"><h2>Unable to load map</h2><p>Please try again later.</p></div>';
    return;
  }

  refreshUI();

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value || "";
    refreshUI();
  });
});
