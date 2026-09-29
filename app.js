// Kaif Jamali Motors - Application Logic

let currentBikes = [];
let filteredBikes = [];
let currentCategory = "All";
let searchQuery = "";
let sortBy = "default";

let selectedBikeForOrder = null;
let currentEditBikeId = null;
let isAdminLoggedIn = false;

// DOM Element References
const bikesGrid = document.getElementById("bikesGrid");
const bikeCountEl = document.getElementById("bikeCount");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryTabs = document.querySelectorAll(".tab-btn");

// Toast Notification Manager
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" ? "fa-check-circle" : type === "danger" ? "fa-exclamation-circle" : "fa-info-circle";
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Load & Render Bikes Catalog
async function loadBikesCatalog() {
  bikesGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
      <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i>
      <p style="margin-top: 1rem; color: var(--text-muted);">Fetching bikes from Kaif Jamali Motors database...</p>
    </div>
  `;

  const response = await DataService.getBikes();
  currentBikes = response.data || [];
  
  // Show source badge in navbar or log
  console.log(`Bikes loaded from: ${response.source}`);
  applyFiltersAndRender();
}

// Filter, Sort & Render Bikes Grid
function applyFiltersAndRender() {
  filteredBikes = currentBikes.filter(bike => {
    const matchesCategory = currentCategory === "All" || bike.category.toLowerCase() === currentCategory.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = bike.title.toLowerCase().includes(query) ||
                          bike.brand.toLowerCase().includes(query) ||
                          bike.category.toLowerCase().includes(query) ||
                          (bike.description && bike.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  // Sorting
  if (sortBy === "price-low") {
    filteredBikes.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredBikes.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredBikes.sort((a, b) => a.title.localeCompare(b.title));
  }

  renderBikesGrid(filteredBikes);
}

function renderBikesGrid(bikes) {
  bikeCountEl.textContent = bikes.length;

  if (bikes.length === 0) {
    bikesGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-motorcycle"></i>
        <h3>No Bikes Found</h3>
        <p>No bikes match your search criteria. Try clearing search or select a different category.</p>
      </div>
    `;
    return;
  }

  bikesGrid.innerHTML = bikes.map(bike => `
    <div class="bike-card">
      <div class="card-img-wrapper">
        <img src="${bike.image_url}" alt="${bike.title}" onerror="this.src='https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'">
        <span class="card-category-badge">${bike.category}</span>
        <span class="card-stock-badge">${bike.stock || 'In Stock'}</span>
      </div>
      <div class="card-content">
        <span class="card-brand">${bike.brand}</span>
        <h3 class="card-title">${bike.title}</h3>
        
        <div class="card-specs">
          <div class="spec-item">
            <span>Speed</span>
            <strong>${bike.top_speed || 'N/A'}</strong>
          </div>
          <div class="spec-item">
            <span>Engine</span>
            <strong>${bike.engine || 'N/A'}</strong>
          </div>
          <div class="spec-item">
            <span>Power</span>
            <strong>${bike.power || 'N/A'}</strong>
          </div>
        </div>
        
        <div class="card-footer">
          <div class="card-price">
            <span class="price-label">Price</span>
            <span class="price-amount">$${Number(bike.price).toLocaleString()}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline btn-sm" onclick="openDetailModal('${bike.id}')">
              <i class="fas fa-info-circle"></i> Specs
            </button>
            <button class="btn btn-primary btn-sm" onclick="openOrderModal('${bike.id}')">
              <i class="fas fa-shopping-bag"></i> Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// Modal View Controllers
function openDetailModal(bikeId) {
  const bike = currentBikes.find(b => b.id == bikeId);
  if (!bike) return;

  document.getElementById("detailModalImage").src = bike.image_url;
  document.getElementById("detailModalTitle").textContent = bike.title;
  document.getElementById("detailModalBrand").textContent = bike.brand + " • " + bike.category;
  document.getElementById("detailModalPrice").textContent = "$" + Number(bike.price).toLocaleString();
  document.getElementById("detailModalDesc").textContent = bike.description || "No description provided.";
  
  document.getElementById("detailModalSpeed").textContent = bike.top_speed || "N/A";
  document.getElementById("detailModalEngine").textContent = bike.engine || "N/A";
  document.getElementById("detailModalPower").textContent = bike.power || "N/A";
  document.getElementById("detailModalStock").textContent = bike.stock || "In Stock";

  const orderBtn = document.getElementById("detailModalOrderBtn");
  orderBtn.onclick = () => {
    closeModal("detailModal");
    openOrderModal(bikeId);
  };

  openModal("detailModal");
}

function openOrderModal(bikeId) {
  selectedBikeForOrder = currentBikes.find(b => b.id == bikeId);
  if (!selectedBikeForOrder) return;

  document.getElementById("orderBikeTitle").textContent = selectedBikeForOrder.title;
  document.getElementById("orderBikePrice").textContent = "$" + Number(selectedBikeForOrder.price).toLocaleString();
  document.getElementById("orderBikeImg").src = selectedBikeForOrder.image_url;

  openModal("orderModal");
}

function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

// Order Form Submission
document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedBikeForOrder) return;

  const btn = e.target.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting Inquiry...`;

  const orderPayload = {
    customer_name: document.getElementById("custName").value.trim(),
    customer_email: document.getElementById("custEmail").value.trim(),
    customer_phone: document.getElementById("custPhone").value.trim(),
    city: document.getElementById("custCity").value.trim(),
    message: document.getElementById("custMessage").value.trim(),
    bike_id: selectedBikeForOrder.id,
    bike_title: selectedBikeForOrder.title,
    bike_price: selectedBikeForOrder.price
  };

  const res = await DataService.submitOrder(orderPayload);
  btn.disabled = false;
  btn.innerHTML = `<i class="fas fa-paper-plane"></i> Submit Order Inquiry`;

  if (res.success) {
    closeModal("orderModal");
    e.target.reset();
    showToast(`Order inquiry submitted for ${selectedBikeForOrder.title}! Kaif Jamali team will contact you shortly.`);
    if (isAdminLoggedIn) loadAdminOrders();
  } else {
    showToast("Failed to submit inquiry. Please try again.", "danger");
  }
});

// Admin Portal Logic
function checkAdminSession() {
  if (sessionStorage.getItem("kj_admin_session") === "true") {
    isAdminLoggedIn = true;
    updateAdminNavUI();
  }
}

function updateAdminNavUI() {
  const adminBtn = document.getElementById("adminPortalBtn");
  if (isAdminLoggedIn) {
    adminBtn.innerHTML = `<i class="fas fa-user-shield"></i> Admin Panel`;
  } else {
    adminBtn.innerHTML = `<i class="fas fa-lock"></i> Admin Login`;
  }
}

document.getElementById("adminPortalBtn").addEventListener("click", () => {
  if (isAdminLoggedIn) {
    openAdminDashboard();
  } else {
    openModal("adminLoginModal");
  }
});

// Admin Login Form
document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const pass = document.getElementById("adminPass").value;
  if (pass === "admin123" || pass === "kaif123") {
    isAdminLoggedIn = true;
    sessionStorage.setItem("kj_admin_session", "true");
    updateAdminNavUI();
    closeModal("adminLoginModal");
    e.target.reset();
    showToast("Welcome back, Admin Kaif Jamali!");
    openAdminDashboard();
  } else {
    showToast("Invalid Admin Password! (Default is admin123)", "danger");
  }
});

// Admin Dashboard Tabs & Data
function openAdminDashboard() {
  openModal("adminDashboardModal");
  loadAdminBikes();
  loadAdminOrders();
}

function switchAdminTab(tabName) {
  document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));

  document.getElementById(`tabBtn-${tabName}`).classList.add("active");
  document.getElementById(`tabContent-${tabName}`).classList.add("active");
}

async function loadAdminBikes() {
  const tableBody = document.getElementById("adminBikesTableBody");
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading inventory...</td></tr>`;

  const res = await DataService.getBikes();
  const bikes = res.data || [];

  tableBody.innerHTML = bikes.map(bike => `
    <tr>
      <td><img src="${bike.image_url}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'"></td>
      <td><strong>${bike.title}</strong><br><small style="color:var(--text-muted);">${bike.brand}</small></td>
      <td>${bike.category}</td>
      <td style="color:var(--primary); font-weight:700;">$${Number(bike.price).toLocaleString()}</td>
      <td>${bike.top_speed || 'N/A'}</td>
      <td><span class="badge-status status-confirmed">${bike.stock || 'In Stock'}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditBikeModal('${bike.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteBike('${bike.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

async function loadAdminOrders() {
  const tableBody = document.getElementById("adminOrdersTableBody");
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading inquiries...</td></tr>`;

  const res = await DataService.getOrders();
  const orders = res.data || [];

  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No customer inquiries received yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = orders.map(ord => `
    <tr>
      <td><small>${new Date(ord.created_at || Date.now()).toLocaleDateString()}</small></td>
      <td><strong>${ord.customer_name}</strong><br><small>${ord.customer_phone}</small></td>
      <td>${ord.customer_email}<br><small style="color:var(--primary);">${ord.city}</small></td>
      <td><strong>${ord.bike_title}</strong><br><small>$${Number(ord.bike_price).toLocaleString()}</small></td>
      <td><small style="max-width:200px; display:inline-block;">${ord.message || 'No note'}</small></td>
      <td>
        <select class="sort-select" onchange="handleOrderStatusChange('${ord.id}', this.value)" style="padding:4px 8px; font-size:0.8rem;">
          <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Confirmed" ${ord.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <span class="badge-status status-${(ord.status || 'Pending').toLowerCase()}">${ord.status || 'Pending'}</span>
      </td>
    </tr>
  `).join("");
}

// Add/Edit Bike Modal Controllers
function openAddBikeModal() {
  currentEditBikeId = null;
  document.getElementById("bikeFormTitle").textContent = "Add New Bike Listing";
  document.getElementById("bikeForm").reset();
  openModal("bikeFormModal");
}

function openEditBikeModal(bikeId) {
  const bike = currentBikes.find(b => b.id == bikeId);
  if (!bike) return;

  currentEditBikeId = bikeId;
  document.getElementById("bikeFormTitle").textContent = "Edit Bike Details";

  document.getElementById("formTitle").value = bike.title;
  document.getElementById("formBrand").value = bike.brand;
  document.getElementById("formCategory").value = bike.category;
  document.getElementById("formPrice").value = bike.price;
  document.getElementById("formImage").value = bike.image_url;
  document.getElementById("formSpeed").value = bike.top_speed || "";
  document.getElementById("formEngine").value = bike.engine || "";
  document.getElementById("formPower").value = bike.power || "";
  document.getElementById("formStock").value = bike.stock || "In Stock";
  document.getElementById("formDesc").value = bike.description || "";

  openModal("bikeFormModal");
}

// Bike Form Submit (Add/Edit)
document.getElementById("bikeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const bikePayload = {
    title: document.getElementById("formTitle").value.trim(),
    brand: document.getElementById("formBrand").value.trim(),
    category: document.getElementById("formCategory").value,
    price: Number(document.getElementById("formPrice").value),
    image_url: document.getElementById("formImage").value.trim(),
    top_speed: document.getElementById("formSpeed").value.trim(),
    engine: document.getElementById("formEngine").value.trim(),
    power: document.getElementById("formPower").value.trim(),
    stock: document.getElementById("formStock").value,
    description: document.getElementById("formDesc").value.trim()
  };

  if (currentEditBikeId) {
    await DataService.updateBike(currentEditBikeId, bikePayload);
    showToast("Bike listing updated successfully!");
  } else {
    await DataService.addBike(bikePayload);
    showToast("New bike added to catalog!");
  }

  closeModal("bikeFormModal");
  await loadBikesCatalog();
  if (isAdminLoggedIn) loadAdminBikes();
});

// Delete Bike
async function handleDeleteBike(bikeId) {
  if (confirm("Are you sure you want to delete this bike listing from the inventory?")) {
    await DataService.deleteBike(bikeId);
    showToast("Bike listing deleted.");
    await loadBikesCatalog();
    loadAdminBikes();
  }
}

// Order Status Change
async function handleOrderStatusChange(orderId, newStatus) {
  await DataService.updateOrderStatus(orderId, newStatus);
  showToast(`Order status updated to ${newStatus}`);
  loadAdminOrders();
}

function handleAdminLogout() {
  sessionStorage.removeItem("kj_admin_session");
  isAdminLoggedIn = false;
  updateAdminNavUI();
  closeModal("adminDashboardModal");
  showToast("Admin logged out.");
}

function copySqlSchema() {
  const sqlText = document.getElementById("sqlText").innerText;
  navigator.clipboard.writeText(sqlText);
  showToast("SQL Schema copied to clipboard! Paste it into Supabase SQL Editor.");
}

// Event Listeners for Filters & Search
categoryTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    categoryTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    applyFiltersAndRender();
  });
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  applyFiltersAndRender();
});

sortSelect.addEventListener("change", (e) => {
  sortBy = e.target.value;
  applyFiltersAndRender();
});

// Mobile Navigation Drawer Toggle
document.getElementById("mobileToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("active");
});

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
  checkAdminSession();
  loadBikesCatalog();
});
