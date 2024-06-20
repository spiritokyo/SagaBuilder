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
exports.ReserveBookingErrors = void 0;
var core_1 = require("@libs/common/core");
var ReserveBookingErrors;
(function (ReserveBookingErrors) {
    var BookingRepoInfraError = /** @class */ (function (_super) {
        __extends(BookingRepoInfraError, _super);
        function BookingRepoInfraError(bookingDetails) {
            var _this = _super.call(this, BookingRepoInfraError.message) || this;
            _this.bookingDetails = bookingDetails;
            return _this;
        }
        BookingRepoInfraError.prototype.extractBookingInfo = function () {
            return this.bookingDetails;
        };
        BookingRepoInfraError.message = 'Booking repository error';
        return BookingRepoInfraError;
    }(core_1.UseCaseError));
    ReserveBookingErrors.BookingRepoInfraError = BookingRepoInfraError;
    var SagaBookingRepoInfraError = /** @class */ (function (_super) {
        __extends(SagaBookingRepoInfraError, _super);
        function SagaBookingRepoInfraError(message) {
            return _super.call(this, message || BookingRepoInfraError.message) || this;
        }
        SagaBookingRepoInfraError.message = 'Saga booking repository error';
        return SagaBookingRepoInfraError;
    }(core_1.UseCaseError));
    ReserveBookingErrors.SagaBookingRepoInfraError = SagaBookingRepoInfraError;
    var BookingPaymentInfraError = /** @class */ (function (_super) {
        __extends(BookingPaymentInfraError, _super);
        function BookingPaymentInfraError(_a, bookingDetails) {
            var paymentId = _a.paymentId;
            var _this = _super.call(this, 'The booking payment has been failed') || this;
            _this.paymentDetails = { paymentId: paymentId };
            _this.bookingDetails = bookingDetails;
            return _this;
        }
        BookingPaymentInfraError.prototype.extractBookingInfo = function () {
            return this.bookingDetails;
        };
        BookingPaymentInfraError.prototype.extractPaymentInfo = function () {
            return this.paymentDetails;
        };
        return BookingPaymentInfraError;
    }(core_1.UseCaseError));
    ReserveBookingErrors.BookingPaymentInfraError = BookingPaymentInfraError;
})(ReserveBookingErrors || (exports.ReserveBookingErrors = ReserveBookingErrors = {}));
