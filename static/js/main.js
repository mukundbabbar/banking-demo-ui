/**
 * Main JavaScript for Banking Application
 * Handles common functionality across the application
 */

// Global configurations
const config = {
    apiTokenHeaderName: 'Authorization',
    tokenPrefix: 'Bearer ',
    toastDuration: 5000, // milliseconds
    externalApiUrl: null // Will be set from the server
};

// Fetch config on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.externalApiUrl) {
            config.externalApiUrl = data.externalApiUrl;
            console.log("External API URL configured:", config.externalApiUrl);
        }
    } catch (error) {
        console.error("Failed to load configuration:", error);
    }
});

async function trackExternalApiCall(endpoint) {
    try {
        if (!config.externalApiUrl) {
            // Try to fetch the external API URL if not already loaded
            try {
                const response = await fetch('/api/config');
                const data = await response.json();
                if (data.externalApiUrl) {
                    config.externalApiUrl = data.externalApiUrl;
                    console.log("External API URL configured:", config.externalApiUrl);
                }
            } catch (configError) {
                console.error("Failed to load configuration:", configError);
            }
        }
        
        if (config.externalApiUrl) {
            // Make a silent fetch request - we don't need the response
            const url = `${config.externalApiUrl}${endpoint}`;
            console.log(`Tracking call to: ${url}`);
            
            
            // ==== AppDynamics: Begin userData injection ====
            try {
                const parsedUrl = new URL(url, window.location.origin);
                const appId = parsedUrl.searchParams.get("appId");
                console.log("----Adding user data: " + appId);
                const config = window['adrum-config'];
                if (!config.userData) {
                    config.userData = {}; // Initialize userData if not already set
                }
                config.userData.appId = appId;
                console.log("User data set: appId = " + appId);
            } catch (e) {
                    console.warn("Failed to parse URL or set AppD userData:", e);
            }
            // ==== AppDynamics: End userData injection ====
            
            
            fetch(url, { method: 'GET' })
                .catch(err => console.error('Tracking call error (ignored):', err));
        } else {
            console.warn("No external API URL configured for tracking");
        }
    } catch (error) {
        // Silently ignore errors in tracking calls
        console.error('Error in tracking call (ignored):', error);
    }
};

// Utility functions for API interactions
const api = {
    // Get the authentication token from session storage
    getToken: () => {
        return sessionStorage.getItem('userToken') || 'demo-token-12345';
    },

    // Create headers for API requests
    getHeaders: () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = api.getToken();
        if (token) {
            headers[config.apiTokenHeaderName] = `${config.tokenPrefix}${token}`;
        }
        
        return headers;
    },

    // Make a GET request to the API
    get: async (endpoint) => {
        const loaderId = showLoader();
        try {
            // For demo, use our local API endpoints
            const localEndpoint = endpoint;
            
            const response = await fetch(localEndpoint, {
                method: 'GET',
                headers: api.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // For demo purposes, add a tiny delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return await response.json();
        } catch (error) {
            console.error('API GET error:', error);
            // For demo purposes, return some default data so UI doesn't break
            return getDemoDataForEndpoint(endpoint);
        } finally {
            hideLoader(loaderId);
        }
    },

    // Make a POST request to the API
    post: async (endpoint, data) => {
        const loaderId = showLoader();
        try {
            // For demo, use our local API endpoints
            const localEndpoint = endpoint;
            
            const response = await fetch(localEndpoint, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // For demo purposes, add a tiny delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return await response.json();
        } catch (error) {
            console.error('API POST error:', error);
            // For demo, always return success
            showToast('Demo: Request processed successfully!', 'success');
            return { success: true, message: "Demo operation successful" };
        } finally {
            hideLoader(loaderId);
        }
    },

    // Make a PUT request to the API
    put: async (endpoint, data) => {
        const loaderId = showLoader();
        try {
            // For demo, use our local API endpoints
            const localEndpoint = endpoint;
            
            const response = await fetch(localEndpoint, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // For demo purposes, add a tiny delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return await response.json();
        } catch (error) {
            console.error('API PUT error:', error);
            // For demo, always return success
            showToast('Demo: Data updated successfully!', 'success');
            return { success: true, message: "Demo update successful" };
        } finally {
            hideLoader(loaderId);
        }
    }
};

// Helper function to provide demo data if API calls fail
function getDemoDataForEndpoint(endpoint) {
    // Default demo data based on endpoint
    if (endpoint.includes('/accounts/summary')) {
        return {
            accountNumber: "4242424242424242",
            balance: 25680.52,
            availableBalance: 24500.00,
            accountType: "Checking",
            lastUpdated: "2025-05-09T00:00:00Z"
        };
    }
    
    if (endpoint.includes('/transactions/recent')) {
        return {
            transactions: [
                {
                    id: 1,
                    date: "2025-05-08T14:22:31Z",
                    description: "Grocery Store Purchase",
                    amount: 42.67,
                    type: "debit",
                    category: "Shopping"
                },
                {
                    id: 2,
                    date: "2025-05-07T09:15:22Z",
                    description: "Salary Deposit",
                    amount: 2500.00,
                    type: "credit",
                    category: "Income"
                },
                {
                    id: 3,
                    date: "2025-05-05T18:30:15Z",
                    description: "Restaurant Payment",
                    amount: 86.23,
                    type: "debit",
                    category: "Dining"
                }
            ]
        };
    }
    
    if (endpoint.includes('/transactions')) {
        return {
            transactions: [
                {
                    id: 1,
                    date: "2025-05-08T14:22:31Z",
                    description: "Grocery Store Purchase",
                    amount: 42.67,
                    type: "debit",
                    category: "Shopping",
                    balance: 25680.52
                },
                {
                    id: 2,
                    date: "2025-05-07T09:15:22Z",
                    description: "Salary Deposit",
                    amount: 2500.00,
                    type: "credit",
                    category: "Income",
                    balance: 25723.19
                }
            ]
        };
    }
    
    if (endpoint.includes('/loans')) {
        return {
            loans: [
                {
                    id: 1,
                    amount: 10000,
                    purpose: "home",
                    term: 36,
                    interestRate: 5.5,
                    monthlyPayment: 301.96,
                    status: "approved",
                    applicationDate: "2025-03-15T00:00:00Z",
                    paymentProgress: 25
                }
            ]
        };
    }
    
    if (endpoint.includes('/user/profile')) {
        return {
            id: 1,
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com",
            phoneNumber: "+1 (555) 123-4567",
            address: "123 Main Street",
            city: "Anytown",
            state: "CA",
            zipCode: "90210",
            notificationPreferences: {
                emailNotifications: true,
                smsNotifications: false,
                transactionAlerts: true,
                marketingCommunications: false,
                securityAlerts: true
            }
        };
    }
    
    // Default empty response
    return { success: true };
};

// Display toast notification
function showToast(message, type = 'info') {
    // Get or create toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.id = toastId;
    
    // Create toast content
    toast.innerHTML = `
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close" onclick="document.getElementById('${toastId}').remove()"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (document.getElementById(toastId)) {
            document.getElementById(toastId).remove();
        }
    }, config.toastDuration);
    
    return toastId;
}

// Show loading indicator
function showLoader() {
    // Get or create loader container
    let loaderContainer = document.querySelector('.loader-container');
    if (!loaderContainer) {
        loaderContainer = document.createElement('div');
        loaderContainer.className = 'loader-container position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-25';
        loaderContainer.style.zIndex = '9999';
        loaderContainer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(loaderContainer);
    }
    
    // Create loader element
    const loaderId = 'loader-' + Date.now();
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.id = loaderId;
    loader.style.display = 'block';
    loader.setAttribute('aria-hidden', 'true');
    
    // Add to container
    loaderContainer.appendChild(loader);
    loaderContainer.style.display = 'flex';
    
    // Return after a slight delay for demo purposes
    setTimeout(() => {
        hideLoader(loaderId);
    }, 500);
    
    return loaderId;
}

// Hide loading indicator
function hideLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    if (loader) {
        loader.remove();
    }
    
    // If no more loaders, hide container
    const loaderContainer = document.querySelector('.loader-container');
    if (loaderContainer && (!loaderContainer.querySelector('.loader') || loaderContainer.querySelectorAll('.loader').length === 0)) {
        loaderContainer.style.display = 'none';
    }
}

// Format currency values
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date values
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Validate form input
function validateInput(input, rules) {
    for (const rule of rules) {
        const errorElement = document.getElementById(`${input.id}-error`);
        
        // Create error element if it doesn't exist
        if (!errorElement) {
            const errorDiv = document.createElement('div');
            errorDiv.id = `${input.id}-error`;
            errorDiv.className = 'error-message';
            input.parentNode.appendChild(errorDiv);
        }
        
        // Check rules
        if (rule.type === 'required' && !input.value.trim()) {
            document.getElementById(`${input.id}-error`).textContent = rule.message || 'This field is required';
            return false;
        }
        
        if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            document.getElementById(`${input.id}-error`).textContent = rule.message || 'Please enter a valid email address';
            return false;
        }
        
        if (rule.type === 'minLength' && input.value.length < rule.value) {
            document.getElementById(`${input.id}-error`).textContent = rule.message || `Please enter at least ${rule.value} characters`;
            return false;
        }
        
        if (rule.type === 'pattern' && !rule.pattern.test(input.value)) {
            document.getElementById(`${input.id}-error`).textContent = rule.message || 'Please enter a valid value';
            return false;
        }
    }
    
    // Clear error if passes all validations
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    return true;
}

// Check if user is authenticated - for demo, always return true
function checkAuth() {
    // For demo purposes, we're not enforcing authentication
    return true;
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners or other initializations
    
    // For demo, no authentication check needed
    
    // Initialize any popovers or tooltips
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Set user name in the navigation bar for demo
    const userNameElements = document.querySelectorAll('.user-name');
    if (userNameElements.length > 0) {
        userNameElements.forEach(element => {
            element.textContent = "Demo User";
        });
    }
});
