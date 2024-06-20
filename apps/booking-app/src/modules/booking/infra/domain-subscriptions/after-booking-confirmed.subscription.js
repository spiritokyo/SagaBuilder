"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfterBookingConfirmed = void 0;
var index_1 = require("@booking-domain/index");
var events_1 = require("@libs/common/domain/events");
/**
 * We can inject here f.e usecases
 */
var AfterBookingConfirmed = /** @class */ (function () {
    function AfterBookingConfirmed() {
        this.setupSubscriptions();
    }
    AfterBookingConfirmed.prototype.setupSubscriptions = function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        events_1.DomainEvents.register(this.onBookingConfirmed.bind(this), index_1.BookingConfirmedDomainEvent.name);
    };
    AfterBookingConfirmed.prototype.onBookingConfirmed = function (event) {
        console.log("[AfterBookingConfirmed]:{".concat(JSON.stringify(event.bookingDetails), "}"));
        // logic to send notification to customer via email
    };
    return AfterBookingConfirmed;
}());
exports.AfterBookingConfirmed = AfterBookingConfirmed;
