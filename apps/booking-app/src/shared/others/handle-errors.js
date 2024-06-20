"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
function handleErrors(server) {
    /**
     * Handling critical error events
     */
    process
        .on('SIGTERM', shutdownZero('SIGTERM'))
        .on('SIGINT', shutdownZero('SIGINT'))
        .on('unhandledRejection', shutdownOne('unhandledRejection'))
        .on('uncaughtException', shutdownOne('uncaughtException'));
    function shutdownZero(signal) {
        return function (err) {
            console.warn("".concat(signal, " RECEIVED. Shutting down gracefully..."), {
                name: err.name,
                message: err.message,
            });
            server.close(function () {
                console.error('Process terminated...');
                process.exit(0);
            });
        };
    }
    function shutdownOne(typeException) {
        return function (err) {
            console.error({ name: err.name, message: err.message, trace: err.stack }, "".concat(typeException, "! \uD83D\uDCA5 Shutting down..."));
            server.close(function () {
                console.error('Process terminated...');
                process.exit(1);
            });
        };
    }
}
exports.handleErrors = handleErrors;
