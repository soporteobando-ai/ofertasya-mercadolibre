// ============================================================
// admin.js - Panel de administración del catálogo (localStorage)
// ============================================================

import { getFullCatalog, saveCatalog, resetCatalog, nextId } from "./storage.js";

let products = [];
let editingId = null;

const els = {
  tableBody: document.getElementById("product-table-body"),
  emptyCatalog: document.getElementById("empty-catalog"),
  categoryOptions: document.getElementById("category-options"),

  formSection: document.getElementById("form-section"),
  formTitle: document.getElementById("form-title"),
  form: document.getElementById("product-form"),

  fId: document.getElementById("f-id"),
  fTitle: document.getElementById("f-title"),
  fCategory: document.getElementById("f-category"),
  fPrice: document.getElementById("f-price"),
  fDescription: document.getElementById("f-description"),
  fImage: document.getElementById("f-image"),
  fImagePreview: document.getElementById("f-image-preview"),
  fAffiliate: document.getElementById("f-affiliate"),
  fRating: document.getElementById("f-rating"),
  fFeatured: document.getElementById("f-featured"),
  fActive: document.getElementById("f-active"),

  btnNew: document.getElementById("btn-new"),
  btnCancel: document.getElementById("btn-cancel"),
  btnExport: document.getElementById("btn-export"),
  btnReset: document.getElementById("btn-reset"),
  importFile: document.getElementById("import-file"),
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------
// Render de la tabla
// ---------------------------------------------------------
function renderCategoryDatalist() {
  const categories = [...new Set(products.map((p) => p.category))];
  els.categoryOptions.innerHTML = categories.map((c) => `<option value="${c}"></option>`).join("");
}

function renderTable() {
  renderCategoryDatalist();

  if (products.length === 0) {
    els.tableBody.innerHTML = "";
    els.emptyCatalog.classList.remove("hidden");
    return;
  }
  els.emptyCatalog.classList.add("hidden");

  els.tableBody.innerHTML = products
    .map((p) => {
      const isActive = p.active !== false;
      return `
        <tr class="${isActive ? "" : "opacity-50"}">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img src="${p.image}" alt="" class="w-10 h-10 rounded-lg object-cover border border-gray-200"
                   onerror="this.onerror=null;this.src='https://placehold.co/80x80?text=%3F';" />
              <span class="font-medium text-gray-900 max-w-xs truncate">${p.title}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-gray-600">${p.category}</td>
          <td class="px-4 py-3 text-gray-900 font-medium">${formatPrice(p.price)}</td>
          <td class="px-4 py-3 text-amber-600">★ ${Number(p.rating).toFixed(1)}</td>
          <td class="px-4 py-3">
            <button type="button" data-action="toggle-active" data-id="${p.id}"
              class="px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}">
              ${isActive ? "Visible" : "Oculto"}
            </button>
          </td>
          <td class="px-4 py-3">
            <button type="button" data-action="toggle-featured" data-id="${p.id}"
              class="px-3 py-1 rounded-full text-xs font-semibold ${p.featured ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}">
              ${p.featured ? "⭐ Sí" : "No"}
            </button>
          </td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <button type="button" data-action="edit" data-id="${p.id}" class="text-blue-600 hover:text-blue-800 font-medium mr-3">Editar</button>
            <button type="button" data-action="delete" data-id="${p.id}" class="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
          </td>
        </tr>`;
    })
    .join("");
}

// ---------------------------------------------------------
// Formulario
// ---------------------------------------------------------
function openForm(product = null) {
  editingId = product ? product.id : null;
  els.formTitle.textContent = product ? "Editar producto" : "Agregar producto";

  els.fId.value = product?.id ?? "";
  els.fTitle.value = product?.title ?? "";
  els.fCategory.value = product?.category ?? "";
  els.fPrice.value = product?.price ?? "";
  els.fDescription.value = product?.description ?? "";
  els.fImage.value = product?.image ?? "";
  els.fAffiliate.value = product?.affiliateUrl ?? "";
  els.fRating.value = product?.rating ?? 4.5;
  els.fFeatured.checked = Boolean(product?.featured);
  els.fActive.checked = product ? product.active !== false : true;

  updateImagePreview();
  els.formSection.classList.remove("hidden");
  els.formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeForm() {
  els.form.reset();
  editingId = null;
  els.formSection.classList.add("hidden");
}

function updateImagePreview() {
  const url = els.fImage.value.trim();
  if (url) {
    els.fImagePreview.src = url;
    els.fImagePreview.classList.remove("hidden");
  } else {
    els.fImagePreview.classList.add("hidden");
  }
}

function handleSubmit(e) {
  e.preventDefault();

  const data = {
    title: els.fTitle.value.trim(),
    category: els.fCategory.value.trim(),
    description: els.fDescription.value.trim(),
    price: Number(els.fPrice.value),
    image: els.fImage.value.trim(),
    affiliateUrl: els.fAffiliate.value.trim(),
    rating: Number(els.fRating.value),
    featured: els.fFeatured.checked,
    active: els.fActive.checked,
  };

  if (editingId) {
    products = products.map((p) => (p.id === editingId ? { ...p, ...data } : p));
  } else {
    products.push({ id: nextId(products), ...data });
  }

  saveCatalog(products);
  renderTable();
  closeForm();
}

// ---------------------------------------------------------
// Acciones de la tabla (delegación de eventos)
// ---------------------------------------------------------
function handleTableClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const product = products.find((p) => p.id === id);
  if (!product) return;

  switch (btn.dataset.action) {
    case "edit":
      openForm(product);
      break;
    case "delete":
      if (confirm(`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`)) {
        products = products.filter((p) => p.id !== id);
        saveCatalog(products);
        renderTable();
      }
      break;
    case "toggle-active":
      product.active = product.active === false ? true : false;
      saveCatalog(products);
      renderTable();
      break;
    case "toggle-featured":
      product.featured = !product.featured;
      saveCatalog(products);
      renderTable();
      break;
  }
}

// ---------------------------------------------------------
// Exportar / Importar / Reset
// ---------------------------------------------------------
function exportJson() {
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("El archivo no contiene un array de productos.");
      products = imported.map((p, i) => ({ active: true, id: p.id ?? i + 1, ...p }));
      saveCatalog(products);
      renderTable();
      alert("Catálogo importado correctamente.");
    } catch (err) {
      alert("No se pudo importar el archivo: " + err.message);
    }
  };
  reader.readAsText(file);
}

async function handleReset() {
  if (!confirm("Esto reemplaza el catálogo actual por los productos de fábrica (js/products.json). ¿Continuar?")) return;
  products = await resetCatalog();
  renderTable();
}

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
async function init() {
  products = await getFullCatalog();
  renderTable();

  els.btnNew.addEventListener("click", () => openForm());
  els.btnCancel.addEventListener("click", closeForm);
  els.form.addEventListener("submit", handleSubmit);
  els.fImage.addEventListener("input", updateImagePreview);
  els.tableBody.addEventListener("click", handleTableClick);
  els.btnExport.addEventListener("click", exportJson);
  els.btnReset.addEventListener("click", handleReset);
  els.importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) importJson(file);
    e.target.value = "";
  });
}

init();
