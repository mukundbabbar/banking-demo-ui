/**
 * Loans JavaScript for Banking Application
 * Handles loan application and loan status functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname !== '/loans') {
        return;
    }
    
    // Make tracking call for page load
    trackExternalApiCall('/WebFrontEnd');
    
    // For demo, we don't need authentication checks
    // Setup loan application form
    setupLoanApplicationForm();
    
    // Load existing loans or loan status
    loadLoanStatus();
    
    // Setup loan calculator
    setupLoanCalculator();
});

/**
 * Setup loan application form validation and submission
 */
function setupLoanApplicationForm() {
    const loanForm = document.getElementById('loanApplicationForm');
    
    if (!loanForm) return;
    
    loanForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const loanAmount = document.getElementById('loanAmount').value;
        const loanPurpose = document.getElementById('loanPurpose').value;
        const loanTerm = document.getElementById('loanTerm').value;
        const employmentStatus = document.getElementById('employmentStatus').value;
        const annualIncome = document.getElementById('annualIncome').value;
        
        // Validate inputs
        let isValid = true;
        
        isValid = validateInput(document.getElementById('loanAmount'), [
            { type: 'required', message: 'Loan amount is required' },
            { 
                type: 'pattern', 
                pattern: /^\d+(\.\d{1,2})?$/, 
                message: 'Please enter a valid amount' 
            }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('loanPurpose'), [
            { type: 'required', message: 'Loan purpose is required' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('loanTerm'), [
            { type: 'required', message: 'Loan term is required' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('employmentStatus'), [
            { type: 'required', message: 'Employment status is required' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('annualIncome'), [
            { type: 'required', message: 'Annual income is required' },
            { 
                type: 'pattern', 
                pattern: /^\d+(\.\d{1,2})?$/, 
                message: 'Please enter a valid amount' 
            }
        ]) && isValid;
        
        if (!isValid) {
            return;
        }
        
        try {
            // Prepare loan application data
            const loanData = {
                amount: parseFloat(loanAmount),
                purpose: loanPurpose,
                term: parseInt(loanTerm),
                employmentStatus: employmentStatus,
                annualIncome: parseFloat(annualIncome)
            };
            
            // Submit loan application
            const response = await api.post('/api/loans/apply', loanData);
            
            // After successful submission, make tracking call with application ID
            if (response && response.applicationId) {
                // Make external tracking call for loan application with application ID
                trackExternalApiCall(`/WebFrontEnd/pgp?appId=${response.applicationId}`);
                console.log(`Tracking loan application: ${response.applicationId}`);
            }
            
            // Handle successful response
            showToast('Loan application submitted successfully!', 'success');
            
            // Clear form or hide it
            loanForm.reset();
            
            //set loan id number for UI
            document.getElementById("applicationReference").textContent = response.applicationId;
            
            // Show application confirmation
            const confirmationElement = document.getElementById('loanConfirmation');
            if (confirmationElement) {
                confirmationElement.classList.remove('d-none');
            }
            
            // Hide form
            loanForm.classList.add('d-none');
            
            // Reload loan status to show pending application
            loadLoanStatus();
            
        } catch (error) {
            console.error('Error submitting loan application:', error);
            showToast('Failed to submit loan application. Please try again.', 'danger');
        }
    });
}

/**
 * Load and display loan status or existing loans
 */
async function loadLoanStatus() {
    try {
        const loansData = await api.get('/api/loans');
        
        const loansContainer = document.getElementById('existingLoans');
        if (!loansContainer) return;
        
        // Clear existing content
        loansContainer.innerHTML = '';
        
        if (!loansData.loans || loansData.loans.length === 0) {
            loansContainer.innerHTML = `
                <div class="alert alert-info">
                    You don't have any active loans or pending applications.
                </div>
            `;
            return;
        }
        
        // Create a card for each loan
        loansData.loans.forEach(loan => {
            const loanCard = document.createElement('div');
            loanCard.className = 'card mb-4';
            
            // Set different card styles based on loan status
            let statusBadgeClass = 'bg-secondary';
            if (loan.status === 'approved') statusBadgeClass = 'bg-success';
            if (loan.status === 'pending') statusBadgeClass = 'bg-warning';
            if (loan.status === 'rejected') statusBadgeClass = 'bg-danger';
            
            loanCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Loan #${loan.id}</h5>
                    <span class="badge ${statusBadgeClass}">${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Amount:</strong> ${formatCurrency(loan.amount)}</p>
                            <p><strong>Purpose:</strong> ${loan.purpose}</p>
                            <p><strong>Term:</strong> ${loan.term} months</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Interest Rate:</strong> ${loan.interestRate}%</p>
                            <p><strong>Monthly Payment:</strong> ${formatCurrency(loan.monthlyPayment)}</p>
                            <p><strong>Application Date:</strong> ${formatDate(loan.applicationDate)}</p>
                        </div>
                    </div>
                    ${loan.status === 'approved' ? `
                        <div class="mt-3">
                            <div class="progress mb-2">
                                <div class="progress-bar" role="progressbar" style="width: ${loan.paymentProgress}%;" 
                                    aria-valuenow="${loan.paymentProgress}" aria-valuemin="0" aria-valuemax="100">
                                    ${loan.paymentProgress}%
                                </div>
                            </div>
                            <small class="text-muted">Loan repayment progress</small>
                        </div>
                    ` : ''}
                </div>
                ${loan.status === 'approved' ? `
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-primary" 
                            data-loan-id="${loan.id}" 
                            onclick="viewPaymentSchedule(${loan.id})">
                            View Payment Schedule
                        </button>
                    </div>
                ` : ''}
            `;
            
            loansContainer.appendChild(loanCard);
        });
        
    } catch (error) {
        console.error('Error loading loans data:', error);
        
        const loansContainer = document.getElementById('existingLoans');
        if (loansContainer) {
            loansContainer.innerHTML = `
                <div class="alert alert-danger">
                    Could not load loan information. Please try again later.
                </div>
            `;
        }
    }
}

/**
 * Setup loan calculator functionality
 */
function setupLoanCalculator() {
    const calculatorForm = document.getElementById('loanCalculatorForm');
    
    if (!calculatorForm) return;
    
    // Update calculation when inputs change
    const calcAmount = document.getElementById('calcLoanAmount');
    const calcTerm = document.getElementById('calcLoanTerm');
    const calcRate = document.getElementById('calcInterestRate');
    
    const updateCalculation = () => {
        const amount = parseFloat(calcAmount.value) || 0;
        const term = parseInt(calcTerm.value) || 0;
        const rate = parseFloat(calcRate.value) || 0;
        
        if (amount <= 0 || term <= 0 || rate <= 0) {
            document.getElementById('monthlyPayment').textContent = formatCurrency(0);
            document.getElementById('totalInterest').textContent = formatCurrency(0);
            document.getElementById('totalRepayment').textContent = formatCurrency(0);
            return;
        }
        
        // Calculate monthly payment
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
        
        // Calculate total payments and interest
        const totalRepayment = monthlyPayment * term;
        const totalInterest = totalRepayment - amount;
        
        // Update results
        document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
        document.getElementById('totalRepayment').textContent = formatCurrency(totalRepayment);
    };
    
    // Add event listeners to update calculation
    if (calcAmount) calcAmount.addEventListener('input', updateCalculation);
    if (calcTerm) calcTerm.addEventListener('input', updateCalculation);
    if (calcRate) calcRate.addEventListener('input', updateCalculation);
    
    // Initialize calculation
    updateCalculation();
}

/**
 * View loan payment schedule
 */
function viewPaymentSchedule(loanId) {
    // This would typically fetch the schedule from the API
    // For now, show a message
    showToast('Payment schedule feature coming soon!', 'info');
}

// Expose the function to global scope for onclick handler
window.viewPaymentSchedule = viewPaymentSchedule;
