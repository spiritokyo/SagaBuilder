"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMapper = void 0;
var index_1 = require("@booking-domain/index");
var unique_entity_id_1 = require("@libs/common/domain/unique-entity-id");
var BookingMapper = /** @class */ (function () {
    function BookingMapper() {
    }
    BookingMapper.prototype.toDomain = function (bookingPersistenceEntity) {
        return index_1.Booking.create({
            customerId: bookingPersistenceEntity.customer_id,
            courseId: bookingPersistenceEntity.course_id,
            paymentId: bookingPersistenceEntity.payment_id,
            email: bookingPersistenceEntity.email,
            bookingState: bookingPersistenceEntity.current_state,
            isFrozen: bookingPersistenceEntity.is_frozen,
        }, new unique_entity_id_1.UniqueEntityID(bookingPersistenceEntity.id));
    };
    BookingMapper.prototype.toPersistence = function (booking) {
        return {
            id: booking.getId(),
            customer_id: booking.getDetails().customerId,
            course_id: booking.getDetails().courseId,
            payment_id: booking.getDetails().paymentId,
            current_state: booking.getDetails().bookingState,
            is_frozen: booking.getDetails().isFrozen,
            email: booking.getDetails().email,
        };
    };
    return BookingMapper;
}());
exports.BookingMapper = BookingMapper;
