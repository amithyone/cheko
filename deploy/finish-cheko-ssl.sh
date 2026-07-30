#!/usr/bin/env bash
# Run after DNS A record: cheko.check-outnow.com → this server (75.119.139.18)
set -euo pipefail

DOMAIN="cheko.check-outnow.com"
DEPLOY="/var/www/cheko/deploy"

echo "Checking DNS for ${DOMAIN}..."
if ! getent ahosts "${DOMAIN}" | awk '{print $1}' | grep -qE '^[0-9]+\.'; then
  echo "ERROR: No A record for ${DOMAIN}. Add DNS first, then re-run."
  exit 1
fi

cd /var/www/cheko
npm ci
npm run build
chown -R www-data:www-data dist
chmod -R a+rX dist

certbot certonly --apache -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email

cp "${DEPLOY}/apache-cheko.check-outnow.com.conf" /etc/apache2/sites-available/cheko.check-outnow.com.conf
cp "${DEPLOY}/apache-cheko.check-outnow.com-le-ssl.conf" /etc/apache2/sites-available/cheko.check-outnow.com-le-ssl.conf
a2ensite cheko.check-outnow.com-le-ssl.conf
apache2ctl configtest
systemctl reload apache2

echo "Done: https://${DOMAIN}/"
