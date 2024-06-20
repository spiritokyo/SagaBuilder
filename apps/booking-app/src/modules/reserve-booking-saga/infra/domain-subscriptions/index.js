"use strict";
/* eslint-disable no-new */
// Subscriptions
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeReserveBookingSagaDomainSubscribers = void 0;
var after_saga_completed_subscription_1 = require("./after-saga-completed.subscription");
var after_saga_failed_subscription_1 = require("./after-saga-failed.subscription");
function initializeReserveBookingSagaDomainSubscribers(connection) {
    new after_saga_completed_subscription_1.AfterSagaCompleted(connection);
    new after_saga_failed_subscription_1.AfterSagaFailed();
    console.log('Initialize subscription listeners');
}
exports.initializeReserveBookingSagaDomainSubscribers = initializeReserveBookingSagaDomainSubscribers;
