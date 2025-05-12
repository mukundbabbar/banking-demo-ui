#!/bin/bash
set -e

# Inject snippet into base.html at runtime
sed -i "/<!-- APPD_SNIPPET_PLACEHOLDER -->/ {
    r /app/config/snippet.js
    d
}" /app/templates/base.html

exec python3 app.py --external-url "${ENDPOINT_URL}"