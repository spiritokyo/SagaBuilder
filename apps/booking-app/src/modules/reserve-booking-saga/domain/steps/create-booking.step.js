"use strict";
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
exports.CreateBookingStep = void 0;
var index_1 = require("@booking-domain/index");
var index_2 = require("apps/booking-app/src/modules/reserve-booking-saga/controller/index");
var utils_1 = require("@libs/common/infra/error/utils");
var CreateBookingStep = /** @class */ (function () {
    function CreateBookingStep(eventBus) {
        this.eventBus = eventBus;
        this.boookingDomainService = new index_1.BookingDomainService();
        this.circutBreaker = (0, utils_1.buildCircuitBreaker)([index_2.ReserveBookingErrors.BookingRepoInfraError], CreateBookingStep.STEP_NAME);
    }
    Object.defineProperty(CreateBookingStep.prototype, "name", {
        get: function () {
            return CreateBookingStep.STEP_NAME;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CreateBookingStep.prototype, "nameCompensation", {
        get: function () {
            return CreateBookingStep.STEP_NAME_COMPENSATION;
        },
        enumerable: false,
        configurable: true
    });
    CreateBookingStep.prototype.invoke = function (booking) {
        return __awaiter(this, void 0, void 0, function () {
            var isAvailable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.boookingDomainService.checkBookingAvailability(booking.getDetails().courseId)];
                    case 1:
                        isAvailable = _a.sent();
                        if (isAvailable) {
                            this.eventBus.emit('update:saga-state', CreateBookingStep.STEP_NAME);
                            // Means that booking is persisted (will be stored in DB on the next iteration of saving)
                            this.eventBus.emit('update:child-aggregate-persistence', true);
                            return [2 /*return*/];
                        }
                        // TODO: should remove empty booking aggregate
                        throw new index_1.DomainBookingErrors.BookingCreatedFailureDomainError(booking.getDetails());
                }
            });
        });
    };
    CreateBookingStep.prototype.withCompensation = function (booking) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.circutBreaker.execute(function () { return booking.cancelBooking(); })];
                    case 1:
                        _a.sent();
                        this.eventBus.emit('update:saga-state', CreateBookingStep.STEP_NAME_COMPENSATION);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        throw new index_1.DomainBookingErrors.ExceptionAbortCreateBookingTransaction(err_1.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CreateBookingStep.STEP_NAME = 'CreateBookingStep';
    CreateBookingStep.STEP_NAME_COMPENSATION = 'CreateBookingStepCompensation';
    return CreateBookingStep;
}());
exports.CreateBookingStep = CreateBookingStep;
