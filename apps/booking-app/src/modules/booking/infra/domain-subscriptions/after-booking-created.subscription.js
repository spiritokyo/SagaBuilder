"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfterBookingCreated = void 0;
var index_1 = require("@booking-domain/index");
var events_1 = require("@libs/common/domain/events");
/**
 * We can inject here f.e usecases
 */
var AfterBookingCreated = /** @class */ (function () {
    function AfterBookingCreated() {
        this.setupSubscriptions();
    }
    AfterBookingCreated.prototype.setupSubscriptions = function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        events_1.DomainEvents.register(this.onBookingCreated.bind(this), index_1.BookingCreatedDomainEvent.name);
    };
    AfterBookingCreated.prototype.onBookingCreated = function (event) {
        console.log("[AfterBookingCreated]:{".concat(JSON.stringify(event.bookingDetails), "}"));
        // logic to add events in event store about creating new booking
    };
    return AfterBookingCreated;
}());
exports.AfterBookingCreated = AfterBookingCreated;
