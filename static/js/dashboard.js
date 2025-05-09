/**
 * Dashboard JavaScript for Banking Application
 * Handles dashboard functionality and API calls
 */

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname !== '/dashboard') {
        return;
    }
    
    // Make tracking call for page load
    trackExternalApiCall('/WebFrontEnd');
    
    // For demo, we don't need authentication checks
    // Load account summary
    loadAccountSummary();
    
    // Load recent transactions
    loadRecentTransactions();
    
    // Setup quick action buttons
    setupQuickActions();
});

/**
 * Load and display account summary information
 */
async function loadAccountSummary() {
    try {
        const accountData = await api.get('/api/accounts/summary');
        
        // Update balance display
        const balanceElement = document.getElementById('accountBalance');
        if (balanceElement && accountData.balance) {
            balanceElement.textContent = formatCurrency(accountData.balance);
        }
        
        // Update account number display
        const accountNumberElement = document.getElementById('accountNumber');
        if (accountNumberElement && accountData.accountNumber) {
            accountNumberElement.textContent = maskAccountNumber(accountData.accountNumber);
        }
        
        // Update account type
        const accountTypeElement = document.getElementById('accountType');
        if (accountTypeElement && accountData.accountType) {
            accountTypeElement.textContent = accountData.accountType;
        }
        
        // Update other account details if available
        if (accountData.lastUpdated) {
            const lastUpdatedElement = document.getElementById('lastUpdated');
            if (lastUpdatedElement) {
                lastUpdatedElement.textContent = formatDate(accountData.lastUpdated);
            }
        }
        
        // Update available balance if applicable (for credit accounts)
        if (accountData.availableBalance !== undefined) {
            const availableBalanceElement = document.getElementById('availableBalance');
            if (availableBalanceElement) {
                availableBalanceElement.textContent = formatCurrency(accountData.availableBalance);
            }
        }
        
    } catch (error) {
        console.error('Error loading account summary:', error);
        showToast('Could not load account information. Please try again later.', 'danger');
    }
}

/**
 * Load and display recent transactions
 */
async function loadRecentTransactions() {
    try {
        const transactionsData = await api.get('/api/transactions/recent');
        
        const transactionsList = document.getElementById('recentTransactions');
        if (!transactionsList || !transactionsData.transactions || !Array.isArray(transactionsData.transactions)) {
            return;
        }
        
        // Clear existing transactions
        transactionsList.innerHTML = '';
        
        if (transactionsData.transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No recent transactions to display.</p>
                </div>
            `;
            return;
        }
        
        // Add each transaction to the list
        transactionsData.transactions.forEach(transaction => {
            const isDebit = transaction.type === 'debit';
            
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item d-flex justify-content-between align-items-center p-3 border-bottom';
            
            transactionItem.innerHTML = `
                <div>
                    <h6 class="mb-0">${transaction.description}</h6>
                    <small class="text-muted">${formatDate(transaction.date)}</small>
                </div>
                <div class="text-${isDebit ? 'danger' : 'success'}">
                    ${isDebit ? '-' : '+'} ${formatCurrency(transaction.amount)}
                </div>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
        
        // Add a view all button if we have transactions
        const viewAllContainer = document.createElement('div');
        viewAllContainer.className = 'text-center p-3';
        viewAllContainer.innerHTML = `
            <a href="/transactions" class="btn btn-outline-primary btn-sm">View All Transactions</a>
        `;
        
        transactionsList.appendChild(viewAllContainer);
        
    } catch (error) {
        console.error('Error loading recent transactions:', error);
        
        const transactionsList = document.getElementById('recentTransactions');
        if (transactionsList) {
            transactionsList.innerHTML = `
                <div class="alert alert-danger">
                    Could not load recent transactions. Please try again later.
                </div>
            `;
        }
    }
}

/**
 * Setup quick action buttons
 */
function setupQuickActions() {
    // Transfer button
    const transferButton = document.getElementById('transferButton');
    if (transferButton) {
        transferButton.addEventListener('click', function() {
            // Make tracking call
            trackExternalApiCall('/WebFrontEnd/jg');
            // Show feedback toast
            showToast('Transfer functionality coming soon!', 'info');
        });
    }
    
    // Pay Bill button
    const payBillButton = document.getElementById('payBillButton');
    if (payBillButton) {
        payBillButton.addEventListener('click', function() {
            // Show feedback toast
            showToast('Bill payment functionality coming soon!', 'info');
        });
    }
    
    // Apply Loan button
    const applyLoanButton = document.getElementById('applyLoanButton');
    if (applyLoanButton) {
        applyLoanButton.addEventListener('click', function() {
            // Redirect to loan application page
            window.location.href = '/loans';
        });
    }
}

/**
 * Mask an account number for security (show only last 4 digits)
 */
function maskAccountNumber(accountNumber) {
    if (!accountNumber) return '';
    
    // Convert to string in case it's a number
    const accountStr = accountNumber.toString();
    
    // Keep only the last 4 characters, mask the rest
    return 'xxxx-xxxx-xxxx-' + accountStr.slice(-4);
}
