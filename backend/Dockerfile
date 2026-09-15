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

# apt-get upgrade patches stale Debian packages already baked into the base
# image layer (libgnutls30, libpcre2-8-0, libcap2, etc -- CVEs fixed
# upstream but not yet in whatever snapshot node:20-bookworm-slim was last
# published from).
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system nodeapp && \
    useradd --system --gid nodeapp --home-dir /app --shell /usr/sbin/nologin nodeapp

# The base image's bundled npm CLI (and its own vendored tooling -- tar,
# glob, minimatch, cross-spawn, sigstore, pacote, ...) is a devtool with no
# purpose in a running container that only ever execs `node server.js`.
# Removing it here, rather than patching npm's internal deps, eliminates
# that entire vulnerable dependency tree instead of chasing it version by
# version.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

ENV NODE_ENV=production

COPY --from=deps --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=deps --chown=nodeapp:nodeapp /app/prisma ./prisma
COPY --chown=nodeapp:nodeapp . .
RUN mkdir -p uploads && chown nodeapp:nodeapp uploads

USER nodeapp

EXPOSE 5003

CMD ["node", "server.js"]
