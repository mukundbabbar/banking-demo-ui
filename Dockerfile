FROM python:3.11-slim

WORKDIR /app

# Create requirements file inline
RUN echo "flask==2.3.3\n\
flask-login==0.6.3\n\
flask-sqlalchemy==3.1.1\n\
flask-wtf==1.2.1\n\
gunicorn==23.0.0\n\
email-validator==2.1.0\n\
psycopg2-binary==2.9.9" > requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 81
EXPOSE 81

# Set default environment variable (can be overridden)
#ENV ENDPOINT_URL=http://example.com

# Start the app
ENTRYPOINT ["/app/start.sh"]
