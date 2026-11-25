# Static site in nginx:alpine (multi-arch; runs on the Pi's armhf Docker).
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/
HEALTHCHECK --interval=60s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
