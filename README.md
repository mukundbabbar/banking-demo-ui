# Banking Frontend Application

A basic banking frontend application with 5 HTML pages that connects to existing backend endpoints.

## Features

- Login and authentication (demo/prototype mode)
- Dashboard with account summary and recent transactions
- Loan application and loan status
- Transaction history with filtering
- User profile management
- External API tracking for analytics

## Running Locally

### Prerequisites

- Python 3.11 or later
- Required packages: flask, flask-login, flask-sqlalchemy, flask-wtf, gunicorn, email-validator

### Command Line Options

The application accepts the following command-line arguments:

- `--api-domain`: API domain to connect to (default: http://localhost:8000)
- `--external-url`: External API URL for tracking calls (default: None)

### Starting the Application

Basic usage:
```bash
python app.py
```

With external tracking URL:
```bash
python app.py --external-url http://your-tracking-endpoint.com
```

With custom API domain:
```bash
python app.py --external-url http://your-tracking-endpoint.com --api-domain http://your-api-domain.com
```

## Using Docker

### Building the Docker Image

```bash
docker build -t banking-frontend .
```

### Running the Docker Container

Basic usage:
```bash
docker run -p 5000:5000 banking-frontend
```

With custom tracking URL:
```bash
docker run -p 5000:5000 -e EXTERNAL_URL=http://your-tracking-endpoint.com banking-frontend
```

With custom API domain:
```bash
docker run -p 5000:5000 -e EXTERNAL_URL=http://your-tracking-endpoint.com -e API_DOMAIN=http://your-api-domain.com banking-frontend
```

## External API Tracking

The application supports tracking user actions by making fetch calls to an external API endpoint. The following actions are tracked:

- Page loads: `{EXTERNAL_URL}/WebFrontEnd`
- Login attempts: `{EXTERNAL_URL}/WebFrontEnd`
- Fund transfers: `{EXTERNAL_URL}/WebFrontEnd/jg`
- Loan applications: `{EXTERNAL_URL}/WebFrontEnd/pgp?appId={applicationId}`

The external API URL is configured via command-line arguments or environment variables.