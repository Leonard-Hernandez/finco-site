# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# ---- Runtime stage ----
# Runtime configuration (one image for every deployment), written to /env.js at startup:
#   FINCO_API_URL    finco API base URL        (default: /finco-api/v1, same origin)
#   AUTHCO_URL       authco issuer URL         (default: /authco, same origin)
#   OAUTH_CLIENT_ID  authco client id          (default: finco-site)
#   FINCO_RESOURCE   RFC 8707 resource         (default: absolute FINCO_API_URL)
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-finco-env.sh /docker-entrypoint.d/40-finco-env.sh
COPY --from=build /app/dist/finco-site/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
