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
exports.BookingFrozenDomainEvent = exports.BookingCancelledDomainEvent = exports.BookingRejectedDomainEvent = exports.BookingConfirmedDomainEvent = exports.BookingRefundedDomainEvent = exports.BookingPaidDomainEvent = exports.BookingCreatedFailuredDomainEvent = exports.BookingCreatedDomainEvent = exports.BookingDomainEvent = void 0;
var domain_1 = require("@libs/common/domain");
var BookingDomainEvent = /** @class */ (function () {
    function BookingDomainEvent(bookingId, bookingDetails) {
        this.dateTimeOccurred = new Date();
        this.bookingId = new domain_1.UniqueEntityID(bookingId);
        this.bookingDetails = bookingDetails;
    }
    BookingDomainEvent.prototype.getAggregateId = function () {
        return this.bookingId;
    };
    return BookingDomainEvent;
}());
exports.BookingDomainEvent = BookingDomainEvent;
// --------------------------------------------------------------
var BookingCreatedDomainEvent = /** @class */ (function (_super) {
    __extends(BookingCreatedDomainEvent, _super);
    function BookingCreatedDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingCreated';
        return _this;
    }
    return BookingCreatedDomainEvent;
}(BookingDomainEvent));
exports.BookingCreatedDomainEvent = BookingCreatedDomainEvent;
var BookingCreatedFailuredDomainEvent = /** @class */ (function (_super) {
    __extends(BookingCreatedFailuredDomainEvent, _super);
    function BookingCreatedFailuredDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingCreatedFailured';
        return _this;
    }
    return BookingCreatedFailuredDomainEvent;
}(BookingDomainEvent));
exports.BookingCreatedFailuredDomainEvent = BookingCreatedFailuredDomainEvent;
var BookingPaidDomainEvent = /** @class */ (function (_super) {
    __extends(BookingPaidDomainEvent, _super);
    function BookingPaidDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingPaid';
        return _this;
    }
    return BookingPaidDomainEvent;
}(BookingDomainEvent));
exports.BookingPaidDomainEvent = BookingPaidDomainEvent;
var BookingRefundedDomainEvent = /** @class */ (function (_super) {
    __extends(BookingRefundedDomainEvent, _super);
    function BookingRefundedDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingRefunded';
        return _this;
    }
    return BookingRefundedDomainEvent;
}(BookingDomainEvent));
exports.BookingRefundedDomainEvent = BookingRefundedDomainEvent;
var BookingConfirmedDomainEvent = /** @class */ (function (_super) {
    __extends(BookingConfirmedDomainEvent, _super);
    function BookingConfirmedDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingConfirmed';
        return _this;
    }
    return BookingConfirmedDomainEvent;
}(BookingDomainEvent));
exports.BookingConfirmedDomainEvent = BookingConfirmedDomainEvent;
var BookingRejectedDomainEvent = /** @class */ (function (_super) {
    __extends(BookingRejectedDomainEvent, _super);
    function BookingRejectedDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingRejected';
        return _this;
    }
    return BookingRejectedDomainEvent;
}(BookingDomainEvent));
exports.BookingRejectedDomainEvent = BookingRejectedDomainEvent;
var BookingCancelledDomainEvent = /** @class */ (function (_super) {
    __extends(BookingCancelledDomainEvent, _super);
    function BookingCancelledDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingCancelled';
        return _this;
    }
    return BookingCancelledDomainEvent;
}(BookingDomainEvent));
exports.BookingCancelledDomainEvent = BookingCancelledDomainEvent;
var BookingFrozenDomainEvent = /** @class */ (function (_super) {
    __extends(BookingFrozenDomainEvent, _super);
    function BookingFrozenDomainEvent(bookingId, bookingDetails) {
        var _this = _super.call(this, bookingId, bookingDetails) || this;
        _this.name = 'BookingFrozen';
        return _this;
    }
    return BookingFrozenDomainEvent;
}(BookingDomainEvent));
exports.BookingFrozenDomainEvent = BookingFrozenDomainEvent;
