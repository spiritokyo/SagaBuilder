FROM node:20-alpine AS development

WORKDIR /usr/src/app

RUN apk update && apk add bash
RUN npm install -g pnpm

COPY ./wait-for-it.sh ./wait-for-it.sh

RUN chmod +x ./wait-for-it.sh

ENTRYPOINT ["./wait-for-it.sh", "rabbitmq:5672", "-s", "--timeout=30", "--", "pnpm run message-broker-migration:dev" ]

#############################################

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json tsconfig.build.json ./
COPY libs libs
COPY scripts/message-broker-migration scripts/message-broker-migration

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --recursive
RUN pnpm run message-broker-migration:build

############################################

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY --from=build /usr/src/app/dist/scripts/message-broker-migration/ ./dist/scripts/message-broker-migration

RUN npm install -g pnpm

# CMD ["sleep", "infinite"]
ENTRYPOINT ["pnpm", "run", "message-broker-migration:prod"]
