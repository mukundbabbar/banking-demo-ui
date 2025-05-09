/**
 * Transactions JavaScript for Banking Application
 * Handles transaction history and filtering functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname !== '/transactions') {
        return;
    }
    
    // For demo, we don't need authentication checks
    // Load transaction history
    loadTransactionHistory();
    
    // Setup filter functionality
    setupFilters();
    
    // Setup export functionality
    setupExport();
});

// Global state for current transactions
let currentTransactions = [];
let currentFilters = {
    dateFrom: '',
    dateTo: '',
    type: 'all',
    minAmount: '',
    maxAmount: '',
    searchTerm: ''
};

/**
 * Load and display transaction history
 */
async function loadTransactionHistory(filters = {}) {
    try {
        // Build query parameters for filter
        let queryParams = new URLSearchParams();
        
        if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
        if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
        if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
        if (filters.minAmount) queryParams.append('min_amount', filters.minAmount);
        if (filters.maxAmount) queryParams.append('max_amount', filters.maxAmount);
        if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
        
        // Fetch transactions with filters
        const endpoint = `/api/transactions?${queryParams.toString()}`;
        const transactionsData = await api.get(endpoint);
        
        // Update global state
        currentTransactions = transactionsData.transactions || [];
        
        // Render transactions
        renderTransactions(currentTransactions);
        
        // Update transaction summary
        updateTransactionSummary(currentTransactions);
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        
        const transactionsContainer = document.getElementById('transactionsContainer');
        if (transactionsContainer) {
            transactionsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Could not load transaction history. Please try again later.
                </div>
            `;
        }
    }
}

/**
 * Render transactions to the container
 */
function renderTransactions(transactions) {
    const transactionsContainer = document.getElementById('transactionsContainer');
    if (!transactionsContainer) return;
    
    // Clear existing transactions
    transactionsContainer.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        transactionsContainer.innerHTML = `
            <div class="alert alert-info">
                No transactions found matching your criteria.
            </div>
        `;
        return;
    }
    
    // Create table to display transactions
    const table = document.createElement('table');
    table.className = 'table table-hover';
    
    // Create table header
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th class="text-end">Amount</th>
                <th class="text-end">Balance</th>
            </tr>
        </thead>
        <tbody id="transactionsTableBody"></tbody>
    `;
    
    transactionsContainer.appendChild(table);
    
    const tableBody = document.getElementById('transactionsTableBody');
    
    // Add each transaction to the table
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = 'transaction-item';
        
        const isDebit = transaction.type === 'debit';
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category || 'Uncategorized'}</td>
            <td><span class="badge bg-${isDebit ? 'danger' : 'success'}">${isDebit ? 'Debit' : 'Credit'}</span></td>
            <td class="text-end text-${isDebit ? 'danger' : 'success'}">${isDebit ? '-' : '+'} ${formatCurrency(transaction.amount)}</td>
            <td class="text-end">${formatCurrency(transaction.balance)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add pagination if needed
    if (transactions.length > 0 && transactions.total_pages > 1) {
        addPagination(transactions.page, transactions.total_pages);
    }
}

/**
 * Add pagination to the transactions table
 */
function addPagination(currentPage, totalPages) {
    const transactionsContainer = document.getElementById('transactionsContainer');
    if (!transactionsContainer) return;
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container d-flex justify-content-center mt-4';
    
    const pagination = document.createElement('nav');
    pagination.setAttribute('aria-label', 'Transaction pagination');
    
    let paginationHTML = `
        <ul class="pagination">
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
    `;
    
    // Generate page links
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    `;
    
    pagination.innerHTML = paginationHTML;
    paginationContainer.appendChild(pagination);
    transactionsContainer.appendChild(paginationContainer);
    
    // Add event listeners for pagination links
    const pageLinks = document.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = parseInt(this.getAttribute('data-page'));
            if (isNaN(page) || page < 1 || page > totalPages) return;
            
            // Update current filters with the new page
            const filters = {...currentFilters, page};
            
            // Reload transactions with the new page
            loadTransactionHistory(filters);
        });
    });
}

/**
 * Update transaction summary (totals, counts)
 */
function updateTransactionSummary(transactions) {
    const summaryContainer = document.getElementById('transactionSummary');
    if (!summaryContainer || !transactions || transactions.length === 0) return;
    
    // Calculate summary
    let totalDebits = 0;
    let totalCredits = 0;
    let debitCount = 0;
    let creditCount = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'debit') {
            totalDebits += transaction.amount;
            debitCount++;
        } else {
            totalCredits += transaction.amount;
            creditCount++;
        }
    });
    
    // Update summary display
    summaryContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Transaction Summary</h5>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Total Debits:</strong> <span class="text-danger">${formatCurrency(totalDebits)}</span></p>
                        <p><strong>Total Credits:</strong> <span class="text-success">${formatCurrency(totalCredits)}</span></p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Debit Transactions:</strong> ${debitCount}</p>
                        <p><strong>Credit Transactions:</strong> ${creditCount}</p>
                    </div>
                </div>
                <p><strong>Net Change:</strong> <span class="${totalCredits - totalDebits >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(totalCredits - totalDebits)}</span></p>
            </div>
        </div>
    `;
}

/**
 * Setup transaction filters
 */
function setupFilters() {
    const filterForm = document.getElementById('transactionFilterForm');
    if (!filterForm) return;
    
    // Setup date pickers
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    if (dateFromInput) {
        dateFromInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    if (dateToInput) {
        dateToInput.value = today.toISOString().split('T')[0];
    }
    
    // Add form submission handler
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get filter values
        const filters = {
            dateFrom: document.getElementById('dateFrom').value,
            dateTo: document.getElementById('dateTo').value,
            type: document.getElementById('transactionType').value,
            minAmount: document.getElementById('minAmount').value,
            maxAmount: document.getElementById('maxAmount').value,
            searchTerm: document.getElementById('searchTerm').value
        };
        
        // Update current filters
        currentFilters = filters;
        
        // Load transactions with filters
        loadTransactionHistory(filters);
    });
    
    // Add reset filter handler
    const resetButton = document.getElementById('resetFilters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset form
            filterForm.reset();
            
            // Set default date range
            if (dateFromInput) {
                dateFromInput.value = thirtyDaysAgo.toISOString().split('T')[0];
            }
            
            if (dateToInput) {
                dateToInput.value = today.toISOString().split('T')[0];
            }
            
            // Reset current filters
            currentFilters = {
                dateFrom: dateFromInput ? dateFromInput.value : '',
                dateTo: dateToInput ? dateToInput.value : '',
                type: 'all',
                minAmount: '',
                maxAmount: '',
                searchTerm: ''
            };
            
            // Load transactions with reset filters
            loadTransactionHistory(currentFilters);
        });
    }
}

/**
 * Setup export functionality
 */
function setupExport() {
    const exportButton = document.getElementById('exportTransactions');
    if (!exportButton) return;
    
    exportButton.addEventListener('click', function() {
        if (!currentTransactions || currentTransactions.length === 0) {
            showToast('No transactions to export.', 'warning');
            return;
        }
        
        // In a real application, this would trigger an API call to
        // generate and download a CSV or PDF file
        showToast('Export functionality coming soon!', 'info');
    });
}
