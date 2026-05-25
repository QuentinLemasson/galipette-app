#!/bin/sh
set -eu

PORT="${PORT:-8080}"
API_UPSTREAM="${API_UPSTREAM:-api.railway.internal:3001}"

sed -e "s/listen 8080;/listen ${PORT};/" \
    -e "s|API_UPSTREAM|${API_UPSTREAM}|g" \
    /etc/nginx/nginx.conf > /tmp/nginx.conf

echo "web: port=${PORT} api_upstream=${API_UPSTREAM}"
exec nginx -c /tmp/nginx.conf -g 'daemon off;'
