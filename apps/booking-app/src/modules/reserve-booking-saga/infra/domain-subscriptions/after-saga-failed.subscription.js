"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfterSagaFailed = void 0;
var index_1 = require("@reserve-booking-saga-domain/index");
var events_1 = require("@libs/common/domain/events");
/**
 * We can inject here f.e usecases
 */
var AfterSagaFailed = /** @class */ (function () {
    function AfterSagaFailed() {
        this.setupSubscriptions();
    }
    AfterSagaFailed.prototype.setupSubscriptions = function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        events_1.DomainEvents.register(this.onSagaFailed.bind(this), index_1.ReserveBookingSagaFailedDomainEvent.name);
    };
    AfterSagaFailed.prototype.onSagaFailed = function (event) {
        console.log("[AfterSagaFailed]:{".concat(JSON.stringify(event.sagaState), "}"));
    };
    return AfterSagaFailed;
}());
exports.AfterSagaFailed = AfterSagaFailed;
