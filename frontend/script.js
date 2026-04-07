/**
 * Main Frontend JavaScript
 * Handles all frontend logic for search and database management
 */

const API_BASE_URL = 'https://zeerostock-assignment-2.onrender.com';

// ============= STATE MANAGEMENT =============

const state = {
  searchResults: [],
  suppliers: [],
  inventory: [],
  analytics: [],
  isSearching: false
};

// ============= UTILITY FUNCTIONS =============

/**
 * Show toast notification
 */
const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

/**
 * Show loading spinner
 */
const showLoading = (show = true) => {
  const spinner = document.getElementById('loadingSpinner');
  if (show) {
    spinner.classList.remove('hidden');
  } else {
    spinner.classList.add('hidden');
  }
};

/**
 * Disable search button during fetch
 */
const setSearchButtonState = (disabled = false) => {
  const btn = document.getElementById('searchBtn');
  btn.disabled = disabled;
  btn.style.opacity = disabled ? '0.6' : '1';
};

// ============= PART A: SEARCH FUNCTIONALITY =============

/**
 * Build filter badge display
 */
const updateFilterBadges = () => {
  const badges = document.getElementById('filterBadges');
  const filters = [];

  const q = document.getElementById('searchInput').value;
  if (q) filters.push(`🔍 "${q}"`);

  const category = document.getElementById('categoryFilter').value;
  if (category) filters.push(`📂 ${category}`);

  const minPrice = document.getElementById('minPriceInput').value;
  if (minPrice) filters.push(`💰 ≥ $${minPrice}`);

  const maxPrice = document.getElementById('maxPriceInput').value;
  if (maxPrice) filters.push(`💰 ≤ $${maxPrice}`);

  if (filters.length === 0) {
    badges.innerHTML = '';
  } else {
    badges.innerHTML = filters.map(f => `<span class="badge">${f}</span>`).join('');
  }
};

/**
 * Load unique categories for dropdown
 */
const loadCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();

    if (data.success) {
      const categorySelect = document.getElementById('categoryFilter');
      const categoryOptions = data.data;

      categoryOptions.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    showToast('Failed to load categories', 'error');
  }
};

/**
 * Search inventory with filters
 */
const searchInventory = async () => {
  try {
    const q = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const minPrice = document.getElementById('minPriceInput').value;
    const maxPrice = document.getElementById('maxPriceInput').value;

    // Build query string
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    showLoading(true);
    setSearchButtonState(true);

    console.log(`🔍 Searching with params: ${params.toString()}`);

    const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      state.searchResults = data.data;
      displaySearchResults(data.data);
      showToast(`Found ${data.count} items`, 'success');
    } else {
      showToast('Search failed', 'error');
    }
  } catch (error) {
    console.error('Search error:', error);
    showToast('Error searching inventory', 'error');
  } finally {
    showLoading(false);
    setSearchButtonState(false);
  }
};

/**
 * Display search results in table format
 */
const displaySearchResults = (results) => {
  const container = document.getElementById('resultsContainer');

  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>❌ No items found matching your criteria</p>
        <small>Try adjusting your filters</small>
      </div>
    `;
    return;
  }

  let html = `
    <div class="results-summary">
      <h3>Results: ${results.length} items found</h3>
    </div>
    <div class="table-wrapper">
      <table class="results-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
  `;

  results.forEach(item => {
    html += `
      <tr>
        <td><strong>${item.productName}</strong></td>
        <td><span class="category-badge">${item.category}</span></td>
        <td>${formatCurrency(item.price)}</td>
        <td>${item.supplier}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
};

/**
 * Reset all filters
 */
const resetFilters = () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('minPriceInput').value = '';
  document.getElementById('maxPriceInput').value = '';
  updateFilterBadges();
  document.getElementById('resultsContainer').innerHTML = '';
  showToast('Filters reset', 'info');
};

// ============= PART B: SUPPLIER MANAGEMENT =============

/**
 * Load all suppliers
 */
const loadSuppliers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/supplier`);
    const data = await response.json();

    if (data.success) {
      state.suppliers = data.data;
      displaySuppliers(data.data);
      populateSupplierDropdown(data.data);
    }
  } catch (error) {
    console.error('Error loading suppliers:', error);
    showToast('Failed to load suppliers', 'error');
  }
};

/**
 * Display suppliers list
 */
const displaySuppliers = (suppliers) => {
  const container = document.getElementById('suppliersList');

  if (suppliers.length === 0) {
    container.innerHTML = '<p class="empty-state">No suppliers found</p>';
    return;
  }

  let html = '<div class="items-list">';
  suppliers.forEach(supplier => {
    html += `
      <div class="list-item">
        <div class="item-content">
          <h4>${supplier.name}</h4>
          <p>📍 ${supplier.city}</p>
          <small>ID: ${supplier.id}</small>
        </div>
        <button class="btn btn-small btn-danger" onclick="deleteSupplier(${supplier.id})">
          Delete
        </button>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
};

/**
 * Add new supplier
 */
const addSupplier = async () => {
  try {
    const name = document.getElementById('supplierName').value.trim();
    const city = document.getElementById('supplierCity').value.trim();

    if (!name || !city) {
      showToast('Please fill all supplier fields', 'error');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/supplier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city })
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Supplier "${name}" added successfully`, 'success');
      document.getElementById('supplierName').value = '';
      document.getElementById('supplierCity').value = '';
      loadSuppliers();
    } else {
      showToast(data.message || 'Failed to add supplier', 'error');
    }
  } catch (error) {
    console.error('Error adding supplier:', error);
    showToast('Error adding supplier', 'error');
  }
};

/**
 * Delete supplier
 */
const deleteSupplier = async (id) => {
  if (!confirm('Are you sure you want to delete this supplier?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/supplier/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showToast('Supplier deleted', 'success');
      loadSuppliers();
      loadInventory();
    } else {
      showToast(data.message || 'Failed to delete supplier', 'error');
    }
  } catch (error) {
    console.error('Error deleting supplier:', error);
    showToast('Error deleting supplier', 'error');
  }
};

/**
 * Populate supplier dropdown for inventory form
 */
const populateSupplierDropdown = (suppliers) => {
  const select = document.getElementById('inventorySupplier');
  select.innerHTML = '<option value="">Select Supplier</option>';

  suppliers.forEach(supplier => {
    const option = document.createElement('option');
    option.value = supplier.id;
    option.textContent = supplier.name;
    select.appendChild(option);
  });
};

// ============= PART B: INVENTORY MANAGEMENT =============

/**
 * Load all inventory items
 */
const loadInventory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    const data = await response.json();

    if (data.success) {
      state.inventory = data.data;
      displayInventory(data.data);
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
    showToast('Failed to load inventory', 'error');
  }
};

/**
 * Display inventory items
 */
const displayInventory = (items) => {
  const container = document.getElementById('inventoryList');

  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">No inventory items found</p>';
    return;
  }

  let html = '<div class="items-list">';
  items.forEach(item => {
    const totalValue = item.quantity * item.price;
    html += `
      <div class="list-item">
        <div class="item-content">
          <h4>${item.product_name}</h4>
          <p>📦 ${item.category} | 🏢 ${item.supplier_name}</p>
          <p>Qty: <strong>${item.quantity}</strong> | Price: ${formatCurrency(item.price)} | Total: ${formatCurrency(totalValue)}</p>
          <small>ID: ${item.id}</small>
        </div>
        <button class="btn btn-small btn-danger" onclick="deleteInventoryItem(${item.id})">
          Delete
        </button>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
};

/**
 * Add new inventory item
 */
const addInventoryItem = async () => {
  try {
    const supplier_id = document.getElementById('inventorySupplier').value;
    const product_name = document.getElementById('inventoryProduct').value.trim();
    const category = document.getElementById('inventoryCategory').value;
    const quantity = document.getElementById('inventoryQuantity').value;
    const price = document.getElementById('inventoryPrice').value;

    if (!supplier_id || !product_name || !category || !quantity || !price) {
      showToast('Please fill all inventory fields', 'error');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplier_id: parseInt(supplier_id),
        product_name,
        category,
        quantity: parseInt(quantity),
        price: parseFloat(price)
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Item "${product_name}" added successfully`, 'success');
      document.getElementById('inventoryProduct').value = '';
      document.getElementById('inventoryQuantity').value = '';
      document.getElementById('inventoryPrice').value = '';
      loadInventory();
      loadAnalytics();
    } else {
      showToast(data.message || 'Failed to add item', 'error');
    }
  } catch (error) {
    console.error('Error adding inventory item:', error);
    showToast('Error adding inventory item', 'error');
  }
};

/**
 * Delete inventory item
 */
const deleteInventoryItem = async (id) => {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showToast('Item deleted', 'success');
      loadInventory();
      loadAnalytics();
    } else {
      showToast(data.message || 'Failed to delete item', 'error');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('Error deleting item', 'error');
  }
};

// ============= PART B: ANALYTICS =============

/**
 * Load analytics - grouped by supplier with totals
 */
const loadAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory?groupBySupplier=true`);
    const data = await response.json();

    if (data.success) {
      state.analytics = data.data;
      displayAnalytics(data.data);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    showToast('Failed to load analytics', 'error');
  }
};

/**
 * Display analytics summary
 */
const displayAnalytics = (analytics) => {
  const container = document.getElementById('analyticsList');

  if (analytics.length === 0) {
    container.innerHTML = '<p class="empty-state">No inventory data available</p>';
    return;
  }

  let html = '<div class="analytics-table-wrapper"><table class="analytics-table"><thead><tr><th>Supplier</th><th>City</th><th>Total Items</th><th>Total Quantity</th><th>Inventory Value</th></tr></thead><tbody>';

  let grandTotal = 0;
  analytics.forEach(row => {
    const value = row.total_inventory_value || 0;
    grandTotal += value;
    html += `
      <tr>
        <td><strong>${row.supplier_name}</strong></td>
        <td>${row.city}</td>
        <td>${row.total_items || 0}</td>
        <td>${row.total_quantity || 0}</td>
        <td>${formatCurrency(value)}</td>
      </tr>
    `;
  });

  html += `
      <tr class="grand-total">
        <td colspan="4"><strong>Grand Total Inventory Value</strong></td>
        <td><strong>${formatCurrency(grandTotal)}</strong></td>
      </tr>
    `;

  html += '</tbody></table></div>';
  container.innerHTML = html;
};

// ============= TAB SWITCHING =============

/**
 * Switch between tabs
 */
const setupTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });
};

/**
 * Switch between sections
 */
const setupSectionSwitching = () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');

      // Remove active class
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));

      // Add active class
      link.classList.add('active');
      document.querySelector(targetId).classList.add('active-section');
    });
  });
};

// ============= EVENT LISTENERS =============

const setupEventListeners = () => {
  // Part A: Search
  document.getElementById('searchBtn').addEventListener('click', searchInventory);
  document.getElementById('resetBtn').addEventListener('click', resetFilters);
  document.getElementById('searchInput').addEventListener('input', updateFilterBadges);
  document.getElementById('categoryFilter').addEventListener('change', updateFilterBadges);
  document.getElementById('minPriceInput').addEventListener('input', updateFilterBadges);
  document.getElementById('maxPriceInput').addEventListener('input', updateFilterBadges);

  // Part B: Suppliers
  document.getElementById('addSupplierBtn').addEventListener('click', addSupplier);

  // Part B: Inventory
  document.getElementById('addInventoryBtn').addEventListener('click', addInventoryItem);
};

// ============= INITIALIZATION =============

/**
 * Initialize app on page load
 */
const initializeApp = async () => {
  console.log('🚀 Initializing Inventory Management System...');

  try {
    // Setup UI interactions
    setupEventListeners();
    setupTabs();
    setupSectionSwitching();

    // Load initial data
    await loadCategories();
    await loadSuppliers();
    await loadInventory();
    await loadAnalytics();

    console.log('✅ App initialized successfully');
    showToast('Welcome to Inventory System!', 'success');
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('Failed to initialize app', 'error');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
