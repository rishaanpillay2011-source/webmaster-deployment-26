function el(id) {
  return document.getElementById(id);
}

function createFeaturedItem(r) {
  const iconName =
    r.category === "Housing"
      ? "home"
      : r.category === "Health"
        ? "heart-pulse"
        : r.category === "Legal"
          ? "scale"
          : "building-2";

  const icon = `<i data-lucide="${iconName}" class="featured-item-icon"></i>`;

  const websiteLink = r.website
    ? `<a class="featured-item-link" href="${r.website}" target="_blank" rel="noopener noreferrer">View Resource →</a>`
    : "";

  return `
    <div class="featured-item scroll-reveal">
      <div>${icon}</div>
      <div class="featured-item-name">${r.name}</div>
      <div class="featured-item-desc">${r.description ?? ""}</div>
      ${websiteLink}
    </div>
  `;
}

async function main() {
  const grid = el("featured-grid");
  const skeleton = el("featured-skeleton");
  if (!grid) return;

  grid.innerHTML = "";
  if (skeleton) skeleton.hidden = false;

  try {
    const featured = await fetchFeaturedResources(3);
    if (skeleton) skeleton.hidden = true;
    grid.innerHTML = featured.map(createFeaturedItem).join("");

    if (window.lucide?.createIcons) window.lucide.createIcons();
    if (typeof window.animateFeaturedItems === "function") {
      window.animateFeaturedItems();
    } else if (typeof window.observeScrollReveals === "function") {
      window.observeScrollReveals();
    }
  } catch (err) {
    console.error(err);
    if (skeleton) skeleton.hidden = true;
    grid.innerHTML = `<div class="empty-state"><h2>Unable to load featured hubs</h2><p>Please try again later.</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", main);
