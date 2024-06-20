"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingState = void 0;
var BookingState;
(function (BookingState) {
    BookingState["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    BookingState["APPROVAL_PENDING"] = "APPROVAL_PENDING";
    BookingState["CANCEL_PENDING"] = "CANCEL_PENDING";
    BookingState["CONFIRMED"] = "CONFIRMED";
    BookingState["REJECTED"] = "REJECTED";
    // SAGA ERROR => Freeze booking
    BookingState["FROZEN"] = "FROZEN";
})(BookingState || (exports.BookingState = BookingState = {}));
