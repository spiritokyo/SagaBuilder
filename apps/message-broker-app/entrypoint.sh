#!/bin/sh

set -e

echo "...Run app in [${NODE_ENV}] mode..."

if [  "${NODE_ENV}" = "production" ]; then
    npm run message-broker:build
elif [ "${NODE_ENV}" = "debug" ]; then
    npm run message-broker:debug
elif [ "${NODE_ENV}" = "development" ]; then
    npm run message-broker:dev
elif [ "${NODE_ENV}" = "testing" ]; then
    echo "[...Just sleep...]"
    # Sleep container, because we don't need to start application, 
    # but just have opportunity to reset DB
    # & connect to the network (for testing purposes)
    sleep infinity
else
    echo "[...Do nothing, NODE_ENV is not set...]"
fi
