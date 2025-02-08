FROM node:20-slim as base
# https://vercel.com/guides/corepack-errors-github-actions
RUN npm i -g corepack@latest
RUN corepack enable pnpm
# panda codegen 을 위해 필요
RUN npm i -g @pandacss/dev

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --prod --frozen-lockfile 

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

ARG NEXT_PUBLIC_DEPLOY_TYPE
ENV NEXT_PUBLIC_DEPLOY_TYPE $NEXT_PUBLIC_DEPLOY_TYPE
RUN pnpm panda
RUN pnpm build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next

EXPOSE 3000
CMD [ "pnpm", "start" ]