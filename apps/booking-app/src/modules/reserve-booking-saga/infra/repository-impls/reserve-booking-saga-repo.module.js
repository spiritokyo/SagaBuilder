"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReserveBookingSagaRepoModule = void 0;
var common_1 = require("@nestjs/common");
var repository_impls_1 = require("@booking-infra/repository-impls");
var postgres_helpers_1 = require("@libs/common/dynamic-modules/postgres/postgres.helpers");
var repo_1 = require("@libs/common/saga/repo");
var config_1 = require("../../../../shared/infra/postgres/config");
var ReserveBookingSagaRepoModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [repository_impls_1.BookingRepoModule],
            providers: [
                {
                    inject: [(0, postgres_helpers_1.getConnectionToken)(config_1.dbConfig.name), repository_impls_1.BookingRepoModule.BOOKING_REPO_TOKEN],
                    provide: ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN,
                    useFactory: function (connection, bookingRepository) {
                        return repo_1.SagaRepositoryImplDatabase.initialize(connection, bookingRepository);
                    },
                },
            ],
            exports: [ReserveBookingSagaRepoModule.RESERVE_BOOKING_SAGA_REPO_TOKEN],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ReserveBookingSagaRepoModule = _classThis = /** @class */ (function () {
        function ReserveBookingSagaRepoModule_1() {
        }
        return ReserveBookingSagaRepoModule_1;
    }());
    __setFunctionName(_classThis, "ReserveBookingSagaRepoModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReserveBookingSagaRepoModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.RESERVE_BOOKING_SAGA_REPO_TOKEN = 'RESERVE_BOOKING_SAGA_REPO_TOKEN';
    (function () {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReserveBookingSagaRepoModule = _classThis;
}();
exports.ReserveBookingSagaRepoModule = ReserveBookingSagaRepoModule;
