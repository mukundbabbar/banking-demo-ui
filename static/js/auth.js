/**
 * Authentication JavaScript for Banking Application
 * Handles login and authentication functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Make tracking call for page load
    trackExternalApiCall('/WebFrontEnd');
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value || "demo@example.com";
            const password = document.getElementById('password').value || "password";
            
            // Make external tracking call for login
            trackExternalApiCall('/LoginService');
            console.log('Making tracking call to LoginService endpoint');
            
            // For demo purposes, skip validation
            try {
                // Show loader
                const loaderId = showLoader();
                
                // Prepare request to demo API
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                // Hide loader
                hideLoader(loaderId);
                
                const data = await response.json();
                
                // Store demo user data
                sessionStorage.setItem('userToken', data.token);
                
                if (data.user) {
                    sessionStorage.setItem('userData', JSON.stringify(data.user));
                }
                
                // Show success message for demo
                showToast('Successfully logged in! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
                
            } catch (error) {
                console.error('Login error:', error);
                // For demo, just redirect anyway
                showToast('Demo login successful! Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            }
        });
    }
    
    // Handle logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // For demo purposes, just redirect without validation
            window.location.href = '/login';
        });
    }
    
    // Set user information for demo
    const userNameElements = document.querySelectorAll('.user-name');
    if (userNameElements.length > 0) {
        userNameElements.forEach(element => {
            element.textContent = "Demo User";
        });
    }
});
