FROM node:20-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

# Drop devDependencies (prisma CLI, eslint, jest, ...) but keep the generated
# @prisma/client, since it lives under node_modules/@prisma/client as a
# regular dependency, not a devDependency.
RUN npm prune --omit=dev


FROM node:20-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system nodeapp && \
    useradd --system --gid nodeapp --home-dir /app --shell /usr/sbin/nologin nodeapp

ENV NODE_ENV=production

COPY --from=deps --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=deps --chown=nodeapp:nodeapp /app/prisma ./prisma
COPY --chown=nodeapp:nodeapp . .
RUN mkdir -p uploads && chown nodeapp:nodeapp uploads

USER nodeapp

EXPOSE 5003

CMD ["npm", "start"]
