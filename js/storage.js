// ============================================================
// storage.js - Capa de persistencia del catálogo (localStorage)
//
// El sitio no tiene backend, así que el panel admin.html guarda
// los cambios en el navegador (localStorage). El sitio público
// (index.html) lee ese mismo catálogo si existe; si no, usa el
// products.json de fábrica.
// ============================================================

const STORAGE_KEY = "ofertasya_catalog_v1";

async function fetchDefaultCatalog() {
  const res = await fetch("js/products.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const products = await res.json();
  return products.map((p) => ({ active: true, ...p }));
}

/** Devuelve el catálogo completo (incluye productos inactivos). */
export async function getFullCatalog() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // localStorage corrupto: seguimos al catálogo por defecto
    }
  }
  const defaults = await fetchDefaultCatalog();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

/** Devuelve solo los productos activos (para el sitio público). */
export async function getActiveCatalog() {
  const all = await getFullCatalog();
  return all.filter((p) => p.active !== false);
}

export function saveCatalog(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export async function resetCatalog() {
  const defaults = await fetchDefaultCatalog();
  saveCatalog(defaults);
  return defaults;
}

export function nextId(products) {
  return products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}
