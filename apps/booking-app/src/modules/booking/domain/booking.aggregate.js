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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
var domain_1 = require("@libs/common/domain");
var booking_events_1 = require("./booking.events");
var booking_state_machine_1 = require("./booking.state-machine");
var booking_value_objects_1 = require("./booking.value-objects");
var Booking = /** @class */ (function (_super) {
    __extends(Booking, _super);
    function Booking(props, id) {
        var _this = this;
        var isBrandNew = !props.bookingState;
        if (isBrandNew) {
            props.bookingState = booking_state_machine_1.BookingState.PAYMENT_PENDING;
            props.isFrozen = false;
            props.paymentId = null;
        }
        _this = _super.call(this, props, id) || this;
        if (isBrandNew) {
            var event_1 = new booking_events_1.BookingCreatedDomainEvent(_this.getId(), _this.getDetails());
            _this.addDomainEvent(event_1);
        }
        return _this;
    }
    Booking.create = function (props, id) {
        // Should be guards
        var defaultValues = __assign({}, props);
        return new Booking(defaultValues, id);
    };
    Booking.prototype.approvePayment = function (paymentId) {
        this.props.bookingState = booking_state_machine_1.BookingState.APPROVAL_PENDING;
        this.props.paymentId = paymentId;
        // const event = new BookingPaidDomainEvent(this)
        // this.addDomainEvent(event)
    };
    Booking.prototype.refundPayment = function (paymentId) {
        this.props.bookingState = booking_state_machine_1.BookingState.CANCEL_PENDING;
        this.props.paymentId = paymentId;
        // const event = new BookingRefundedDomainEvent(this)
        // this.addDomainEvent(event)
    };
    Booking.prototype.confirmBooking = function () {
        if (Math.random() > 0.1) {
            this.props.bookingState = booking_state_machine_1.BookingState.CONFIRMED;
            var event_2 = new booking_events_1.BookingConfirmedDomainEvent(this.getId(), this.getDetails());
            this.addDomainEvent(event_2);
            return true;
        }
        return false;
    };
    Booking.prototype.cancelBooking = function () {
        this.props.bookingState = booking_state_machine_1.BookingState.REJECTED;
        // const event = new BookingCancelledDomainEvent(this)
        // this.addDomainEvent(event)
    };
    Booking.prototype.getDetails = function () {
        return new booking_value_objects_1.BookingDetailsVO(this.props.customerId, this.props.courseId, this.props.paymentId, this.props.email, this.props.bookingState, this.props.isFrozen);
    };
    Booking.prototype.freezeBooking = function () {
        this.props.isFrozen = true;
        // const event = new BookingFrozenDomainEvent(this.getId(), this.getDetails())
        // this.addDomainEvent(event)
    };
    Booking.prototype.getId = function () {
        return this.id.toString();
    };
    return Booking;
}(domain_1.AggregateRoot));
exports.Booking = Booking;
