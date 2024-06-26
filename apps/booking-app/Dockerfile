# Development, debug or testing mode
FROM node:20-alpine AS development

WORKDIR /usr/src/app

RUN apk update && apk add bash
RUN npm install -g pnpm

COPY ./wait-for-it.sh ./wait-for-it.sh
COPY ./apps/booking-app/entrypoint.sh ./apps/booking-app/entrypoint.sh

RUN chmod +x ./wait-for-it.sh
RUN chmod +x ./apps/booking-app/entrypoint.sh

ENTRYPOINT ["./wait-for-it.sh", "rabbitmq:5672", "-s", "--timeout=30", "--", "./apps/booking-app/entrypoint.sh" ]

#############################################

FROM node:20-alpine AS build

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY libs libs
COPY apps/booking-app apps/booking-app

RUN NODE_ENV=development pnpm install --frozen-lockfile --recursive
RUN pnpm run booking:build

############################################

FROM node:20-alpine AS production

WORKDIR /usr/src/app

RUN apk update && apk add bash
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY --from=build /usr/src/app/dist/apps/booking-app/ ./dist/apps/booking-app

RUN pnpm install --prod --recursive
RUN chmod +x ./wait-for-it.sh

ENTRYPOINT [ "./wait-for-it.sh", "rabbitmq:5672", "-s", "--timeout=30", "--", "npm", "run", "booking:prod" ]
