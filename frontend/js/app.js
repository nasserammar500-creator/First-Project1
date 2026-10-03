const API_URL = 'http://localhost:3000/api/expenses';

let allExpenses = [];
let editModalInstance = null;

const tbody = document.getElementById('expenses-tbody');
const totalAmountEl = document.getElementById('total-amount');
const totalCountEl = document.getElementById('total-count');
const highestExpenseEl = document.getElementById('highest-expense');
const spinner = document.getElementById('loading-spinner');
const alertContainer = document.getElementById('alert-container');
const filterSelect = document.getElementById('filter-category');

const addForm = document.getElementById('add-expense-form');
const editForm = document.getElementById('edit-expense-form');

const categoryBadges = {
  Food: 'bg-danger',
  Transport: 'bg-primary',
  Bills: 'bg-warning text-dark',
  Entertainment: 'bg-info text-dark',
  Other: 'bg-secondary'
};

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('editModal');
  if (modalEl) {
    editModalInstance = new bootstrap.Modal(modalEl);
  }

  fetchExpenses();

  addForm.addEventListener('submit', handleAddExpense);
  editForm.addEventListener('submit', handleEditExpenseSubmit);
  filterSelect.addEventListener('change', handleFilterChange);
});

async function fetchExpenses() {
  showSpinner(true);
  clearAlert();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error: ${response.status}`);
    }

    allExpenses = await response.json();
    
    applyFilterAndRender();
    updateSummaryCards(allExpenses);

  } catch (error) {
    showAlert('Could not connect to the server! Make sure the backend server is running on port 3000.', 'danger');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load data from server.</td></tr>`;
  } finally {
    showSpinner(false);
  }
}

function renderExpensesTable(expenses) {
  if (expenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No matching expenses found.</td></tr>`;
    return;
  }

  tbody.innerHTML = expenses.map((item, index) => {
    const badgeClass = categoryBadges[item.category] || 'bg-secondary';
    const amountFormatted = parseFloat(item.amount).toFixed(2);
    const dateFormatted = item.date ? item.date.split('T')[0] : '';

    return `
      <tr>
        <td>${index + 1}</td>
        <td class="fw-bold">${escapeHtml(item.title)}</td>
        <td class="text-success fw-bold">${amountFormatted} JOD</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(item.category)}</span></td>
        <td>${dateFormatted}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${item.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${item.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateSummaryCards(expenses) {
  const count = expenses.length;
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const max = expenses.reduce((highest, item) => Math.max(highest, Number(item.amount)), 0);

  totalCountEl.textContent = count;
  totalAmountEl.textContent = `${total.toFixed(2)} JOD`;
  highestExpenseEl.textContent = `${max.toFixed(2)} JOD`;
}

async function handleAddExpense(e) {
  e.preventDefault();
  clearAlert();

  const title = document.getElementById('add-title').value.trim();
  const amount = parseFloat(document.getElementById('add-amount').value);
  const category = document.getElementById('add-category').value;
  
  const date = new Date().toISOString().split('T')[0];

  if (!title || isNaN(amount) || amount <= 0 || !category) {
    showAlert('Please enter valid data (amount must be greater than zero).', 'warning');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category, date })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add expense');
    }

    addForm.reset();
    showAlert('Expense added successfully!', 'success');
    await fetchExpenses();

  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

function openEditModal(id) {
  const expense = allExpenses.find(e => e.id == id);
  if (!expense) return;

  document.getElementById('edit-id').value = expense.id;
  document.getElementById('edit-title').value = expense.title;
  document.getElementById('edit-amount').value = expense.amount;
  document.getElementById('edit-category').value = expense.category;

  if (expense.date) {
  document.getElementById('edit-date').value = expense.date.split('T')[0];
}
  const modalElement = document.getElementById('editModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
  modalInstance.show();
}

async function handleEditExpenseSubmit(e) {
  e.preventDefault(); 

  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const amount = parseFloat(document.getElementById('edit-amount').value);
  const category = document.getElementById('edit-category').value;
  const date = document.getElementById('edit-date').value;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category, date })
    });

    if (!response.ok) {
      throw new Error('Failed to update expense');
    }
    const modalElement = document.getElementById('editModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }

    showAlert('Expense updated successfully!', 'success');
    await fetchExpenses();

  } catch (error) {
    showAlert(error.message, 'danger');
  }
}



async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  clearAlert();
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete expense');
    }

    showAlert('Expense deleted successfully!', 'info');
    await fetchExpenses();

  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

function handleFilterChange() {
  applyFilterAndRender();
}

function applyFilterAndRender() {
  const selectedCategory = filterSelect.value;
  if (selectedCategory === 'All') {
    renderExpensesTable(allExpenses);
  } else {
    const filtered = allExpenses.filter(item => item.category === selectedCategory);
    renderExpensesTable(filtered);
  }
}

function showSpinner(show) {
  spinner.classList.toggle('d-none', !show);
}

function showAlert(message, type = 'danger') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function clearAlert() {
  alertContainer.innerHTML = '';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
