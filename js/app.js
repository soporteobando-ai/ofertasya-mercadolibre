// ============================================================
// OfertasYA - Catálogo de afiliados Mercado Libre
// app.js - Lógica de carga, filtrado y render (JS vanilla, modular)
// ============================================================

import { getActiveCatalog } from "./storage.js";

const state = {
  products: [],
  activeCategory: "Todos",
  searchTerm: "",
};

const els = {
  grid: document.getElementById("products-grid"),
  emptyState: document.getElementById("empty-state"),
  categoryFilters: document.getElementById("category-filters"),
  resultsCount: document.getElementById("results-count"),
  searchInput: document.getElementById("search-input"),
  searchInputMobile: document.getElementById("search-input-mobile"),
  mobileMenuBtn: document.getElementById("mobile-menu-btn"),
  mobileMenu: document.getElementById("mobile-menu"),
  year: document.getElementById("year"),
};

// ---------------------------------------------------------
// Carga de datos
// ---------------------------------------------------------
async function loadProducts() {
  try {
    state.products = await getActiveCatalog();
  } catch (err) {
    console.error("No se pudieron cargar los productos:", err);
    els.grid.innerHTML = `
      <p class="col-span-full text-center text-red-500 py-10">
        Ocurrió un error al cargar el catálogo. Si abriste el archivo directamente
        con doble clic, iniciá un servidor local (ver README) ya que los navegadores
        bloquean la carga de JSON con file://.
      </p>`;
  }
}

// ---------------------------------------------------------
// Utilidades
// ---------------------------------------------------------
function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  let stars = "★".repeat(full);
  if (hasHalf) stars += "⯨";
  stars += "☆".repeat(5 - full - (hasHalf ? 1 : 0));
  return stars;
}

function getCategories(products) {
  const unique = [...new Set(products.map((p) => p.category))];
  return ["Todos", ...unique];
}

// ---------------------------------------------------------
// Render de filtros de categoría
// ---------------------------------------------------------
function renderCategoryFilters() {
  const categories = getCategories(state.products);

  els.categoryFilters.innerHTML = categories
    .map((cat) => {
      const isActive = cat === state.activeCategory;
      return `
        <button
          type="button"
          data-category="${cat}"
          class="filter-btn ${isActive ? "active" : ""} px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-blue-500 hover:text-blue-600 transition"
        >
          ${cat}
        </button>`;
    })
    .join("");

  els.categoryFilters.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeCategory = btn.dataset.category;
      renderCategoryFilters();
      renderProducts();
    });
  });
}

// ---------------------------------------------------------
// Render de tarjetas de producto
// ---------------------------------------------------------
function createProductCard(product) {
  const { title, category, description, price, image, affiliateUrl, rating, featured } = product;

  const badge = featured
    ? `<span class="badge-featured absolute top-3 left-3 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
         ⭐ Destacado
       </span>`
    : "";

  return `
    <article class="product-card bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-100">
      <div class="relative">
        <img
          src="${image}"
          alt="${title}"
          loading="lazy"
          class="w-full h-48 object-cover"
          onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=Sin+imagen';"
        />
        ${badge}
      </div>

      <div class="p-4 flex flex-col flex-1">
        <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">${category}</span>
        <h3 class="mt-1 font-bold text-gray-900 leading-snug line-clamp-2">${title}</h3>
        <p class="mt-2 text-sm text-gray-500 line-clamp-2">${description}</p>

        <div class="mt-3 flex items-center gap-1 text-amber-500 text-sm stars">
          <span>${renderStars(rating)}</span>
          <span class="text-gray-500 text-xs ml-1">(${rating.toFixed(1)})</span>
        </div>

        <div class="mt-3 text-2xl font-extrabold text-gray-900">
          ${formatPrice(price)}
        </div>

        <a
          href="${affiliateUrl}"
          target="_blank"
          rel="nofollow noopener noreferrer sponsored"
          class="mt-4 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition transform hover:scale-[1.02]"
        >
          Ver en Mercado Libre
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </article>`;
}

function getFilteredProducts() {
  const term = state.searchTerm.trim().toLowerCase();

  return state.products.filter((p) => {
    const matchesCategory = state.activeCategory === "Todos" || p.category === state.activeCategory;
    const matchesSearch =
      !term ||
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const filtered = getFilteredProducts();

  els.resultsCount.textContent = `${filtered.length} producto${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    els.grid.innerHTML = "";
    els.emptyState.classList.remove("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");
  els.grid.innerHTML = filtered.map(createProductCard).join("");
}

// ---------------------------------------------------------
// Eventos de búsqueda (sincroniza input desktop/móvil)
// ---------------------------------------------------------
function handleSearchInput(value) {
  state.searchTerm = value;
  if (els.searchInput) els.searchInput.value = value;
  if (els.searchInputMobile) els.searchInputMobile.value = value;
  renderProducts();
}

function initSearch() {
  els.searchInput?.addEventListener("input", (e) => handleSearchInput(e.target.value));
  els.searchInputMobile?.addEventListener("input", (e) => handleSearchInput(e.target.value));
}

// ---------------------------------------------------------
// Menú móvil
// ---------------------------------------------------------
function initMobileMenu() {
  els.mobileMenuBtn?.addEventListener("click", () => {
    els.mobileMenu.classList.toggle("hidden");
  });
}

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
async function init() {
  if (els.year) els.year.textContent = new Date().getFullYear();

  initSearch();
  initMobileMenu();

  await loadProducts();
  renderCategoryFilters();
  renderProducts();
}

init();
