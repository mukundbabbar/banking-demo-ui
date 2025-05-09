import os
import argparse
import logging
from flask import Flask, render_template, redirect, url_for, request, jsonify

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-dev-key")

# Import the global variables
import app_globals

def get_api_url(endpoint):
    """Construct full API URL based on configured domain"""
    return f"{app_globals.API_DOMAIN}/api{endpoint}"
    
def get_external_api_url(endpoint=""):
    """Construct external API URL based on configured domain"""
    if app_globals.EXTERNAL_API_URL:
        return f"{app_globals.EXTERNAL_API_URL}{endpoint}"
    return None

# Create API endpoints for demonstration purposes
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """Demo login endpoint"""
    data = request.get_json()
    # Always return successful login for demo
    return jsonify({
        "success": True,
        "token": "demo-token-12345",
        "user": {
            "id": 1,
            "name": "Demo User",
            "email": data.get("email", "demo@example.com")
        }
    })

@app.route('/api/accounts/summary', methods=['GET'])
def api_account_summary():
    """Demo account summary endpoint"""
    return jsonify({
        "accountNumber": "4242424242424242",
        "balance": 25680.52,
        "availableBalance": 24500.00,
        "accountType": "Checking",
        "lastUpdated": "2025-05-09T00:00:00Z"
    })

@app.route('/api/transactions/recent', methods=['GET'])
def api_recent_transactions():
    """Demo recent transactions endpoint"""
    return jsonify({
        "transactions": [
            {
                "id": 1,
                "date": "2025-05-08T14:22:31Z",
                "description": "Grocery Store Purchase",
                "amount": 42.67,
                "type": "debit",
                "category": "Shopping"
            },
            {
                "id": 2,
                "date": "2025-05-07T09:15:22Z",
                "description": "Salary Deposit",
                "amount": 2500.00,
                "type": "credit",
                "category": "Income"
            },
            {
                "id": 3,
                "date": "2025-05-05T18:30:15Z",
                "description": "Restaurant Payment",
                "amount": 86.23,
                "type": "debit",
                "category": "Dining"
            },
            {
                "id": 4,
                "date": "2025-05-03T11:42:55Z",
                "description": "Online Shopping",
                "amount": 124.99,
                "type": "debit",
                "category": "Shopping"
            },
            {
                "id": 5,
                "date": "2025-05-01T16:08:44Z",
                "description": "Utility Bill Payment",
                "amount": 135.50,
                "type": "debit",
                "category": "Bills"
            }
        ]
    })

@app.route('/api/transactions', methods=['GET'])
def api_transactions():
    """Demo transactions endpoint with filter support"""
    # Demo transactions data
    return jsonify({
        "transactions": [
            {
                "id": 1,
                "date": "2025-05-08T14:22:31Z",
                "description": "Grocery Store Purchase",
                "amount": 42.67,
                "type": "debit",
                "category": "Shopping",
                "balance": 25680.52
            },
            {
                "id": 2,
                "date": "2025-05-07T09:15:22Z",
                "description": "Salary Deposit",
                "amount": 2500.00,
                "type": "credit",
                "category": "Income",
                "balance": 25723.19
            },
            {
                "id": 3,
                "date": "2025-05-05T18:30:15Z",
                "description": "Restaurant Payment",
                "amount": 86.23,
                "type": "debit",
                "category": "Dining",
                "balance": 23223.19
            },
            {
                "id": 4,
                "date": "2025-05-03T11:42:55Z",
                "description": "Online Shopping",
                "amount": 124.99,
                "type": "debit",
                "category": "Shopping",
                "balance": 23309.42
            },
            {
                "id": 5,
                "date": "2025-05-01T16:08:44Z",
                "description": "Utility Bill Payment",
                "amount": 135.50,
                "type": "debit",
                "category": "Bills",
                "balance": 23434.41
            },
            {
                "id": 6,
                "date": "2025-04-28T10:12:00Z",
                "description": "ATM Withdrawal",
                "amount": 200.00,
                "type": "debit",
                "category": "Cash",
                "balance": 23569.91
            },
            {
                "id": 7,
                "date": "2025-04-25T14:00:12Z",
                "description": "Subscription Payment",
                "amount": 15.99,
                "type": "debit",
                "category": "Entertainment",
                "balance": 23769.91
            },
            {
                "id": 8,
                "date": "2025-04-22T09:18:54Z",
                "description": "Gas Station",
                "amount": 45.50,
                "type": "debit",
                "category": "Transportation",
                "balance": 23785.90
            },
            {
                "id": 9,
                "date": "2025-04-20T11:30:45Z",
                "description": "Dividend Payment",
                "amount": 112.37,
                "type": "credit",
                "category": "Investment",
                "balance": 23831.40
            },
            {
                "id": 10,
                "date": "2025-04-15T16:42:18Z",
                "description": "Rent Payment",
                "amount": 1200.00,
                "type": "debit",
                "category": "Housing",
                "balance": 23719.03
            }
        ]
    })

@app.route('/api/loans', methods=['GET'])
def api_loans():
    """Demo loans endpoint"""
    return jsonify({
        "loans": [
            {
                "id": 1,
                "amount": 10000,
                "purpose": "home",
                "term": 36,
                "interestRate": 5.5,
                "monthlyPayment": 301.96,
                "status": "approved",
                "applicationDate": "2025-03-15T00:00:00Z",
                "paymentProgress": 25
            },
            {
                "id": 2,
                "amount": 5000,
                "purpose": "education",
                "term": 24,
                "interestRate": 4.2,
                "monthlyPayment": 217.42,
                "status": "pending",
                "applicationDate": "2025-05-05T00:00:00Z",
                "paymentProgress": 0
            }
        ]
    })

@app.route('/api/loans/apply', methods=['POST'])
def api_loan_apply():
    """Demo loan application endpoint"""
    data = request.get_json()
    # Always approve loan application for demo
    return jsonify({
        "success": True,
        "message": "Loan application submitted successfully",
        "applicationId": "LN-2025-67890",
        "status": "pending"
    })

@app.route('/api/user/profile', methods=['GET'])
def api_user_profile():
    """Demo user profile endpoint"""
    return jsonify({
        "id": 1,
        "firstName": "Demo",
        "lastName": "User",
        "email": "demo@example.com",
        "phoneNumber": "+1 (555) 123-4567",
        "address": "123 Main Street",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "90210",
        "notificationPreferences": {
            "emailNotifications": True,
            "smsNotifications": False,
            "transactionAlerts": True,
            "marketingCommunications": False,
            "securityAlerts": True
        }
    })

@app.route('/api/user/profile', methods=['PUT'])
def api_update_profile():
    """Demo profile update endpoint"""
    return jsonify({
        "success": True,
        "message": "Profile updated successfully"
    })

@app.route('/api/user/change-password', methods=['POST'])
def api_change_password():
    """Demo password change endpoint"""
    return jsonify({
        "success": True,
        "message": "Password changed successfully"
    })

@app.route('/api/user/notification-preferences', methods=['PUT'])
def api_update_notifications():
    """Demo notification preferences update endpoint"""
    return jsonify({
        "success": True,
        "message": "Notification preferences updated successfully"
    })

# Configuration API
@app.route('/api/config')
def api_config():
    """Provide configuration values to the client"""
    logging.info(f"Providing config with external URL: {app_globals.EXTERNAL_API_URL}")
    return jsonify({
        "externalApiUrl": app_globals.EXTERNAL_API_URL
    })

# Navigation routes without authentication requirements
@app.route('/')
def index():
    # Trigger tracking API call
    if app_globals.EXTERNAL_API_URL:
        logging.info(f"Tracking page load: {app_globals.EXTERNAL_API_URL}/WebFrontEnd")
    return redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    # Tracking API call will be made client-side
    return render_template('login.html')

@app.route('/logout')
def logout():
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/loans')
def loans():
    return render_template('loans.html')

@app.route('/transactions')
def transactions():
    return render_template('transactions.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

if __name__ == '__main__':
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Banking Frontend Application')
    parser.add_argument('--api-domain', 
                        default='http://localhost:8000',
                        help='API domain to connect to (e.g., https://api.bankingapp.com)')
    parser.add_argument('--external-url',
                        default=None,
                        help='External API URL for tracking calls (e.g., http://example.com)')
    
    args = parser.parse_args()
    
    # Set the API domain from command-line arguments
    app_globals.API_DOMAIN = args.api_domain
    app_globals.EXTERNAL_API_URL = args.external_url
    
    logging.info(f"Using API domain: {app_globals.API_DOMAIN}")
    if app_globals.EXTERNAL_API_URL:
        logging.info(f"Using external API URL: {app_globals.EXTERNAL_API_URL}")
    
    # Start the Flask application
    app.run(host='0.0.0.0', port=81, debug=True)
