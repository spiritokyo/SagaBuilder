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
exports.RabbitMQClient = void 0;
/* eslint-disable require-atomic-updates */
var amqplib_1 = require("amqplib");
var events_1 = require("events");
var constants_1 = require("@libs/common/shared/constants");
var booking_cdc_consumer_1 = require("./booking-cdc.consumer");
var command_message_publisher_1 = require("./command-message.publisher");
var reply_saga_consumer_1 = require("./reply-saga.consumer");
var RabbitMQClient = /** @class */ (function () {
    function RabbitMQClient(eventEmiiter, clientProducer, sagaReplyConsumer, bookingCDCConsumer, channels, connection) {
        this.eventEmiiter = eventEmiiter;
        this.clientProducer = clientProducer;
        this.sagaReplyConsumer = sagaReplyConsumer;
        this.bookingCDCConsumer = bookingCDCConsumer;
        this.channels = channels;
        this.connection = connection;
    }
    // TODO: extract rabbitmq config here
    RabbitMQClient.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, eventEmiiter, channels, _i, _a, channel, _b, _c, sagaReplyConsumer, bookingCDCConsumer, clientProducer, rabbitMQClient, err_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        if (RabbitMQClient.instance) {
                            return [2 /*return*/, RabbitMQClient.instance];
                        }
                        return [4 /*yield*/, (0, amqplib_1.connect)(constants_1.rabbitMQConfig.rabbitMQ.credentials)];
                    case 1:
                        connection = _d.sent();
                        eventEmiiter = new events_1.default();
                        channels = {
                            channelBookingCDC: null,
                            channelBookingSagaReplyTo: null,
                            channelPayment: null,
                        };
                        _i = 0, _a = Object.keys(channels);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        channel = _a[_i];
                        _b = channels;
                        _c = channel;
                        return [4 /*yield*/, connection.createChannel()];
                    case 3:
                        _b[_c] = _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        sagaReplyConsumer = new reply_saga_consumer_1.ReplyCreatingBookingSagaConsumerRabbitMQ(channels.channelBookingSagaReplyTo, eventEmiiter);
                        bookingCDCConsumer = new booking_cdc_consumer_1.BookingCDCConsumerRabbitMQ(channels.channelBookingCDC);
                        clientProducer = new command_message_publisher_1.CommandMessagePublisherRabbitMQ(channels.channelPayment, eventEmiiter);
                        rabbitMQClient = new RabbitMQClient(eventEmiiter, clientProducer, sagaReplyConsumer, bookingCDCConsumer, channels, connection);
                        /**
                         * Register consumer handlers
                         */
                        return [4 /*yield*/, rabbitMQClient.consumeSuccessPaymentBooking()];
                    case 6:
                        /**
                         * Register consumer handlers
                         */
                        _d.sent();
                        return [4 /*yield*/, rabbitMQClient.consumeFailurePaymentBooking()];
                    case 7:
                        _d.sent();
                        return [4 /*yield*/, rabbitMQClient.consumeBookingCDC()];
                    case 8:
                        _d.sent();
                        RabbitMQClient.instance = rabbitMQClient;
                        console.log('[RabbitMQClient]: initialized');
                        return [2 /*return*/, RabbitMQClient.instance];
                    case 9:
                        err_1 = _d.sent();
                        console.error('[RabbitMQ]', 'error', err_1);
                        throw err_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    RabbitMQClient.prototype.sendAuthorizeCardCommand = function (cmd) {
        return this.clientProducer.sendAuthorizeCardCommand(cmd);
    };
    RabbitMQClient.prototype.sendAuthorizeRefundCardCommand = function (cmd) {
        return this.clientProducer.sendAuthorizeRefundCardCommand(cmd);
    };
    RabbitMQClient.prototype.consumeSuccessPaymentBooking = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sagaReplyConsumer.consumeSuccessPaymentBooking()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RabbitMQClient.prototype.consumeFailurePaymentBooking = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sagaReplyConsumer.consumeFailurePaymentBooking()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RabbitMQClient.prototype.consumeBookingCDC = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bookingCDCConsumer.publishDomainEvents()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RabbitMQClient.instance = null;
    return RabbitMQClient;
}());
exports.RabbitMQClient = RabbitMQClient;
