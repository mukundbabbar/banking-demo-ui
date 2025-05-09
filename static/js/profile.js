/**
 * Profile JavaScript for Banking Application
 * Handles user profile management and settings
 */

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname !== '/profile') {
        return;
    }
    
    // For demo, we don't need authentication checks
    // Load user profile data
    loadUserProfile();
    
    // Setup profile update form
    setupProfileForm();
    
    // Setup password change form
    setupPasswordForm();
    
    // Setup notification preferences
    setupNotificationPreferences();
});

/**
 * Load and display user profile information
 */
async function loadUserProfile() {
    try {
        const profileData = await api.get('/api/user/profile');
        
        // Update profile fields
        populateProfileFields(profileData);
        
        // Display user's current notification preferences
        updateNotificationPreferences(profileData.notificationPreferences);
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showToast('Could not load profile information. Please try again later.', 'danger');
    }
}

/**
 * Populate profile form fields with user data
 */
function populateProfileFields(profileData) {
    // Basic profile information
    if (profileData.firstName) {
        const firstNameInput = document.getElementById('firstName');
        if (firstNameInput) firstNameInput.value = profileData.firstName;
    }
    
    if (profileData.lastName) {
        const lastNameInput = document.getElementById('lastName');
        if (lastNameInput) lastNameInput.value = profileData.lastName;
    }
    
    if (profileData.email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = profileData.email;
    }
    
    if (profileData.phoneNumber) {
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) phoneInput.value = profileData.phoneNumber;
    }
    
    if (profileData.address) {
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.value = profileData.address;
    }
    
    if (profileData.city) {
        const cityInput = document.getElementById('city');
        if (cityInput) cityInput.value = profileData.city;
    }
    
    if (profileData.state) {
        const stateInput = document.getElementById('state');
        if (stateInput) stateInput.value = profileData.state;
    }
    
    if (profileData.zipCode) {
        const zipInput = document.getElementById('zipCode');
        if (zipInput) zipInput.value = profileData.zipCode;
    }
    
    // Update profile summary
    const userNameElements = document.querySelectorAll('.user-name');
    if (userNameElements.length > 0 && profileData.firstName && profileData.lastName) {
        userNameElements.forEach(element => {
            element.textContent = `${profileData.firstName} ${profileData.lastName}`;
        });
    }
    
    const userEmailElements = document.querySelectorAll('.user-email');
    if (userEmailElements.length > 0 && profileData.email) {
        userEmailElements.forEach(element => {
            element.textContent = profileData.email;
        });
    }
    
    // Update user avatar (first letter of first name)
    const userAvatarElements = document.querySelectorAll('.profile-avatar');
    if (userAvatarElements.length > 0 && profileData.firstName) {
        userAvatarElements.forEach(element => {
            element.textContent = profileData.firstName.charAt(0).toUpperCase();
        });
    }
}

/**
 * Setup profile update form submission
 */
function setupProfileForm() {
    const profileForm = document.getElementById('profileUpdateForm');
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value
        };
        
        // Validate inputs
        let isValid = true;
        
        isValid = validateInput(document.getElementById('firstName'), [
            { type: 'required', message: 'First name is required' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('lastName'), [
            { type: 'required', message: 'Last name is required' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('email'), [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('phoneNumber'), [
            { type: 'required', message: 'Phone number is required' },
            { 
                type: 'pattern', 
                pattern: /^[\d\+\-\(\) ]{10,15}$/, 
                message: 'Please enter a valid phone number' 
            }
        ]) && isValid;
        
        if (!isValid) {
            return;
        }
        
        try {
            // Submit profile update
            const response = await api.put('/api/user/profile', formData);
            
            // Handle successful update
            showToast('Profile updated successfully!', 'success');
            
            // Update profile data in storage if needed
            const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
            userData.name = `${formData.firstName} ${formData.lastName}`;
            userData.email = formData.email;
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
            // Update displayed name
            const userNameElements = document.querySelectorAll('.user-name');
            if (userNameElements.length > 0) {
                userNameElements.forEach(element => {
                    element.textContent = `${formData.firstName} ${formData.lastName}`;
                });
            }
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile. Please try again.', 'danger');
        }
    });
}

/**
 * Setup password change form submission
 */
function setupPasswordForm() {
    const passwordForm = document.getElementById('passwordChangeForm');
    if (!passwordForm) return;
    
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate inputs
        let isValid = true;
        
        isValid = validateInput(document.getElementById('currentPassword'), [
            { type: 'required', message: 'Current password is required' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('newPassword'), [
            { type: 'required', message: 'New password is required' },
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
        ]) && isValid;
        
        isValid = validateInput(document.getElementById('confirmPassword'), [
            { type: 'required', message: 'Please confirm your new password' }
        ]) && isValid;
        
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            document.getElementById('confirmPassword-error').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        try {
            // Submit password change
            const response = await api.post('/api/user/change-password', {
                currentPassword,
                newPassword
            });
            
            // Handle successful update
            showToast('Password changed successfully!', 'success');
            
            // Clear form
            passwordForm.reset();
            
        } catch (error) {
            console.error('Error changing password:', error);
            showToast('Failed to change password. Please check your current password and try again.', 'danger');
        }
    });
}

/**
 * Setup notification preferences controls
 */
function setupNotificationPreferences() {
    const notificationForm = document.getElementById('notificationPreferencesForm');
    if (!notificationForm) return;
    
    notificationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const preferences = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            transactionAlerts: document.getElementById('transactionAlerts').checked,
            marketingCommunications: document.getElementById('marketingCommunications').checked,
            securityAlerts: document.getElementById('securityAlerts').checked
        };
        
        try {
            // Submit notification preferences
            const response = await api.put('/api/user/notification-preferences', preferences);
            
            // Handle successful update
            showToast('Notification preferences updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            showToast('Failed to update notification preferences. Please try again.', 'danger');
        }
    });
}

/**
 * Update notification preference toggles
 */
function updateNotificationPreferences(preferences) {
    if (!preferences) return;
    
    // Set checkbox states based on user preferences
    if (preferences.emailNotifications !== undefined) {
        const checkbox = document.getElementById('emailNotifications');
        if (checkbox) checkbox.checked = preferences.emailNotifications;
    }
    
    if (preferences.smsNotifications !== undefined) {
        const checkbox = document.getElementById('smsNotifications');
        if (checkbox) checkbox.checked = preferences.smsNotifications;
    }
    
    if (preferences.transactionAlerts !== undefined) {
        const checkbox = document.getElementById('transactionAlerts');
        if (checkbox) checkbox.checked = preferences.transactionAlerts;
    }
    
    if (preferences.marketingCommunications !== undefined) {
        const checkbox = document.getElementById('marketingCommunications');
        if (checkbox) checkbox.checked = preferences.marketingCommunications;
    }
    
    if (preferences.securityAlerts !== undefined) {
        const checkbox = document.getElementById('securityAlerts');
        if (checkbox) checkbox.checked = preferences.securityAlerts;
    }
}
