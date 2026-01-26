"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async create(createBookingDto) {
        try {
            return await this.bookingsService.create(createBookingDto);
        }
        catch (error) {
            throw new common_1.HttpException({ error: error.message }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async validate(body) {
        try {
            return await this.bookingsService.validateBooking(body.phone, body.appointmentDate);
        }
        catch (error) {
            throw new common_1.HttpException({ error: error.message }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async update(id, body) {
        try {
            return await this.bookingsService.update(id, body);
        }
        catch (error) {
            throw new common_1.HttpException({ error: error.message }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findOne(id) {
        try {
            return await this.bookingsService.findOne(id);
        }
        catch (error) {
            throw new common_1.HttpException({ error: error.message }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async findAll(query) {
        try {
            return await this.bookingsService.findAll(query);
        }
        catch (error) {
            throw new common_1.HttpException({ error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAvailableSlots(clinic_id, service_id, date) {
        try {
            return await this.bookingsService.findAvailableSlots(clinic_id, service_id, date);
        }
        catch (error) {
            const status = error.message === 'Service not found'
                ? common_1.HttpStatus.NOT_FOUND
                : common_1.HttpStatus.BAD_REQUEST;
            throw new common_1.HttpException({ error: error.message }, status);
        }
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "validate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available-slots'),
    __param(0, (0, common_1.Query)('clinic_id')),
    __param(1, (0, common_1.Query)('service_id')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAvailableSlots", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map