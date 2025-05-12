#!/bin/bash

# Test
# Insert the AppDynamics snippet if provided
if [[ -n "${APPD_JS_SNIPPET}" ]]; then
  echo "Injecting AppDynamics snippet..."
  sed -i "s|<!-- APPD_SNIPPET_PLACEHOLDER -->|${APPD_JS_SNIPPET}|" /app/templates/base.html
fi

exec python3 app.py --external-url "${ENDPOINT_URL}"