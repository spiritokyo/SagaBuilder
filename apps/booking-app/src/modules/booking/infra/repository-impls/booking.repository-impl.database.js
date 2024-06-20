"use strict";
/* eslint-disable no-restricted-syntax */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepositoryImplDatabase = void 0;
var reserve_booking_errors_1 = require("@reserve-booking-saga-controller/reserve-booking.errors");
var mapper_1 = require("@booking-infra/mapper");
var utils_1 = require("@libs/common/infra/error/utils");
var BookingRepositoryImplDatabase = /** @class */ (function () {
    function BookingRepositoryImplDatabase(client) {
        this.client = client;
        this.mapper = new mapper_1.BookingMapper();
    }
    BookingRepositoryImplDatabase.prototype.saveAggregateInDB = function (booking) {
        return __awaiter(this, void 0, void 0, function () {
            var bookingPersistenceEntity, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bookingPersistenceEntity = this.mapper.toPersistence(booking);
                        return [4 /*yield*/, this.client.query("\n      INSERT INTO \"Booking\" (\"id\", \"customer_id\", \"course_id\", \"payment_id\", \"email\", \"current_state\") \n      VALUES ($1, $2, $3, $4, $5, $6)\n      ON CONFLICT (\"id\")\n      DO UPDATE\n      SET\n        \"payment_id\" = $4,\n        \"current_state\" = $6\n      RETURNING *\n        ", [
                                bookingPersistenceEntity.id,
                                bookingPersistenceEntity.customer_id,
                                bookingPersistenceEntity.course_id,
                                bookingPersistenceEntity.payment_id,
                                bookingPersistenceEntity.email,
                                bookingPersistenceEntity.current_state,
                            ])];
                    case 1:
                        res = _a.sent();
                        console.log('DB SAVE BOOKING');
                        console.table({
                            payload: res.rows[0],
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    BookingRepositoryImplDatabase.prototype.restoreAggregateFromDB = function (bookingId) {
        return __awaiter(this, void 0, void 0, function () {
            var res, bookingPersistenceEntity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.query("\n      SELECT * FROM \"Booking\" WHERE id = \"$1\"\n      ", [bookingId])];
                    case 1:
                        res = _a.sent();
                        bookingPersistenceEntity = res.rows[0] || null;
                        return [2 /*return*/, bookingPersistenceEntity ? this.mapper.toDomain(bookingPersistenceEntity) : null];
                }
            });
        });
    };
    BookingRepositoryImplDatabase.prototype.deleteAggregateById = function (bookingId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, utils_1.emulateChaosError)(new reserve_booking_errors_1.ReserveBookingErrors.BookingRepoInfraError({ id: bookingId }), 90);
                        return [4 /*yield*/, this.client.query("\n      DELETE FROM \"Booking\" WHERE id = $1\n      ", [bookingId])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BookingRepositoryImplDatabase;
}());
exports.BookingRepositoryImplDatabase = BookingRepositoryImplDatabase;
