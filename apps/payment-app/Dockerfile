FROM node:20-alpine AS development

WORKDIR /usr/src/app

RUN apk update && apk add bash
RUN npm install -g pnpm

COPY ./wait-for-it.sh ./wait-for-it.sh
COPY ./apps/payment-app/entrypoint.sh ./apps/payment-app/entrypoint.sh

RUN chmod +x ./wait-for-it.sh
RUN chmod +x ./apps/payment-app/entrypoint.sh

ENTRYPOINT ["./wait-for-it.sh", "rabbitmq:5672", "-s", "--timeout=30", "--", "./apps/payment-app/entrypoint.sh" ]

#############################################

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json tsconfig.build.json ./
COPY libs libs
COPY apps/payment-app apps/payment-app

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --recursive
RUN pnpm run message-broker:build

COPY apps/payment-app/package.json apps/payment-app/dist/apps/payment-app/

RUN rm -rf ./apps/

############################################

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY --from=build /usr/src/app/apps/payment-app/dist ./

RUN npm install -g pnpm
RUN pnpm install --prod --recursive

