import os
import logging
import app_globals
from app import app

# Set external URL for tracking
if app_globals.EXTERNAL_API_URL is None:
    # Set default external URL for tracking
    app_globals.EXTERNAL_API_URL = "http://example.com"
    logging.info(f"Setting external API URL in main.py: {app_globals.EXTERNAL_API_URL}")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
