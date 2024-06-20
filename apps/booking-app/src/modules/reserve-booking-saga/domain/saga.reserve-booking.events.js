"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReserveBookingSagaFailedDomainEvent = exports.ReserveBookingSagaCompletedDomainEvent = exports.ReserveBookingSagaDomainEvent = void 0;
var domain_1 = require("@libs/common/domain");
var ReserveBookingSagaDomainEvent = /** @class */ (function () {
    function ReserveBookingSagaDomainEvent(sagaId, sagaState) {
        this.dateTimeOccurred = new Date();
        this.sagaId = new domain_1.UniqueEntityID(sagaId);
        this.sagaState = sagaState;
    }
    ReserveBookingSagaDomainEvent.prototype.getAggregateId = function () {
        return this.sagaId;
    };
    return ReserveBookingSagaDomainEvent;
}());
exports.ReserveBookingSagaDomainEvent = ReserveBookingSagaDomainEvent;
// --------------------------------------------------------------
var ReserveBookingSagaCompletedDomainEvent = /** @class */ (function (_super) {
    __extends(ReserveBookingSagaCompletedDomainEvent, _super);
    function ReserveBookingSagaCompletedDomainEvent(sagaId, sagaState) {
        var _this = _super.call(this, sagaId, sagaState) || this;
        _this.name = 'ReserveBookingSagaCompleted';
        return _this;
    }
    return ReserveBookingSagaCompletedDomainEvent;
}(ReserveBookingSagaDomainEvent));
exports.ReserveBookingSagaCompletedDomainEvent = ReserveBookingSagaCompletedDomainEvent;
var ReserveBookingSagaFailedDomainEvent = /** @class */ (function (_super) {
    __extends(ReserveBookingSagaFailedDomainEvent, _super);
    function ReserveBookingSagaFailedDomainEvent(sagaId, sagaState) {
        var _this = _super.call(this, sagaId, sagaState) || this;
        _this.name = 'ReserveBookingSagaFailed';
        return _this;
    }
    return ReserveBookingSagaFailedDomainEvent;
}(ReserveBookingSagaDomainEvent));
exports.ReserveBookingSagaFailedDomainEvent = ReserveBookingSagaFailedDomainEvent;
