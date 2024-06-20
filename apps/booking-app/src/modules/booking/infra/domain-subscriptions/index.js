"use strict";
/* eslint-disable no-new */
// Subscriptions
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBookingDomainSubscribers = void 0;
var after_booking_confirmed_subscription_1 = require("./after-booking-confirmed.subscription");
var after_booking_created_subscription_1 = require("./after-booking-created.subscription");
/**
 * Just there is no sense to check out all subscribers
 */
function initializeBookingDomainSubscribers() {
    new after_booking_created_subscription_1.AfterBookingCreated();
    new after_booking_confirmed_subscription_1.AfterBookingConfirmed();
    console.log('Initialize subscription listeners');
}
exports.initializeBookingDomainSubscribers = initializeBookingDomainSubscribers;
