#!/bin/sh

set -e

echo "...Run app in [${NODE_ENV}] mode..."

if [  "${NODE_ENV}" = "production" ]; then
    npm run payment:build
elif [ "${NODE_ENV}" = "debug" ]; then
    npm run payment:debug
elif [ "${NODE_ENV}" = "development" ]; then
    npm run payment:dev
elif [ "${NODE_ENV}" = "testing" ]; then
    echo "[...Just sleep...]"
    # Sleep container, because we don't need to start application, 
    # but just have opportunity to reset DB
    # & connect to the network (for testing purposes)
    sleep infinity
else
    echo "[...Do nothing, NODE_ENV is not set...]"
fi
