"use strict";
/* eslint-disable @typescript-eslint/no-namespace */
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
exports.DomainBookingErrors = void 0;
var DomainBookingErrors;
(function (DomainBookingErrors) {
    var BookingCreatedFailureDomainError = /** @class */ (function (_super) {
        __extends(BookingCreatedFailureDomainError, _super);
        function BookingCreatedFailureDomainError(bookingDetails) {
            var _this = _super.call(this, 'The booking is not created. Booking is not available') || this;
            _this.bookingDetails = bookingDetails;
            return _this;
        }
        BookingCreatedFailureDomainError.prototype.extractBookingInfo = function () {
            return this.bookingDetails;
        };
        return BookingCreatedFailureDomainError;
    }(Error));
    DomainBookingErrors.BookingCreatedFailureDomainError = BookingCreatedFailureDomainError;
    var BookingConfirmFailureDomainError = /** @class */ (function (_super) {
        __extends(BookingConfirmFailureDomainError, _super);
        function BookingConfirmFailureDomainError(bookingDetails) {
            var _this = _super.call(this, 'The booking confrimation has been failed') || this;
            _this.bookingDetails = bookingDetails;
            return _this;
        }
        BookingConfirmFailureDomainError.prototype.extractBookingInfo = function () {
            return this.bookingDetails;
        };
        return BookingConfirmFailureDomainError;
    }(Error));
    DomainBookingErrors.BookingConfirmFailureDomainError = BookingConfirmFailureDomainError;
    var UnsupportedStateTransitionException = /** @class */ (function (_super) {
        __extends(UnsupportedStateTransitionException, _super);
        function UnsupportedStateTransitionException(state) {
            var _this = _super.call(this, "Unsupported state transition for order: ".concat(state)) || this;
            _this.state = state;
            return _this;
        }
        return UnsupportedStateTransitionException;
    }(Error));
    DomainBookingErrors.UnsupportedStateTransitionException = UnsupportedStateTransitionException;
    var ExceptionAbortCreateBookingTransaction = /** @class */ (function (_super) {
        __extends(ExceptionAbortCreateBookingTransaction, _super);
        function ExceptionAbortCreateBookingTransaction(reason) {
            return _super.call(this, reason) || this;
        }
        return ExceptionAbortCreateBookingTransaction;
    }(Error));
    DomainBookingErrors.ExceptionAbortCreateBookingTransaction = ExceptionAbortCreateBookingTransaction;
})(DomainBookingErrors || (exports.DomainBookingErrors = DomainBookingErrors = {}));
