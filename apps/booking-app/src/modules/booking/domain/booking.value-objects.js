"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingDetailsVO = void 0;
var BookingDetailsVO = /** @class */ (function () {
    function BookingDetailsVO(customerId, courseId, paymentId, email, bookingState, isFrozen) {
        this.customerId = customerId;
        this.courseId = courseId;
        this.paymentId = paymentId;
        this.email = email;
        this.bookingState = bookingState;
        this.isFrozen = isFrozen;
    }
    return BookingDetailsVO;
}());
exports.BookingDetailsVO = BookingDetailsVO;
