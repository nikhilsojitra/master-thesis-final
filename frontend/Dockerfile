FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# REACT_APP_* vars are baked into the static bundle at build time (CRA),
# not read at container start -- must be supplied here as a build arg, since
# frontend/.env is gitignored and never exists in a CI checkout. Without
# this, the Stripe key silently falls back to a broken placeholder (see
# project_ec2_frontend_env_baking_bug). REACT_APP_API_URL is deliberately
# NOT set here -- its unset fallback ("/api", in src/config.js) is already
# the correct relative path for the nginx-proxied production deployment.
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=$REACT_APP_STRIPE_PUBLISHABLE_KEY

RUN npm run build


FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]