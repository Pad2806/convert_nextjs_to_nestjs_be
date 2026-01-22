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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    supabaseService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async processSePayWebhook(payload) {
        this.logger.log('🔔 SEPAY WEBHOOK PAYLOAD:', payload);
        if (payload?.transferType !== 'in') {
            return { ok: true };
        }
        const rawContent = payload?.content ?? payload?.description ?? '';
        if (!rawContent.includes('DATLICH')) {
            this.logger.error('❌ NO DATLICH TAG:', rawContent);
            return { ok: true };
        }
        let bookingId = rawContent.replace('BankAPINotify', '').trim();
        if (bookingId.startsWith('DATLICH_')) {
            bookingId = bookingId.replace('DATLICH_', '');
        }
        else if (bookingId.startsWith('DATLICH')) {
            bookingId = bookingId.replace('DATLICH', '');
        }
        bookingId = bookingId.trim();
        if (!bookingId) {
            this.logger.error('❌ EMPTY BOOKING ID');
            return { ok: true };
        }
        const paidAmount = Number(payload?.transferAmount ?? 0);
        const client = this.supabaseService.getClient();
        const { data: booking, error: bookingErr } = await client
            .from('bookings')
            .select('id, status')
            .eq('id', bookingId)
            .single();
        if (bookingErr || !booking) {
            this.logger.error('❌ BOOKING NOT FOUND:', bookingId);
            return { ok: true };
        }
        if (booking.status === 'paid') {
            return { ok: true, alreadyPaid: true };
        }
        const { data: payment, error: payErr } = await client
            .from('payments')
            .select('id, amount, status')
            .eq('booking_id', booking.id)
            .eq('status', 'pending')
            .single();
        if (payErr || !payment) {
            this.logger.error('❌ PAYMENT NOT FOUND:', bookingId);
            return { ok: true };
        }
        if (paidAmount < Number(payment.amount)) {
            this.logger.error(`❌ AMOUNT NOT ENOUGH: ${paidAmount} EXPECTED: ${payment.amount}`);
            return { ok: true };
        }
        await client
            .from('payments')
            .update({
            status: 'paid',
            method: 'sepay',
            transaction_code: payload?.referenceCode ?? null,
            payment_date: new Date().toISOString(),
        })
            .eq('id', payment.id);
        await client
            .from('bookings')
            .update({ status: 'paid' })
            .eq('id', booking.id);
        this.logger.log('✅ BOOKING PAID:', bookingId);
        return { success: true };
    }
    async findAll(query) {
        const { phone, status, clinicId, page = 1, limit = 20 } = query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        let q = this.supabaseService
            .getClient()
            .from('admin_payment_overview')
            .select('*', { count: 'exact' })
            .order('payment_created_at', { ascending: false })
            .range(from, to);
        if (clinicId)
            q = q.eq('clinic_id', clinicId);
        if (phone)
            q = q.ilike('patient_phone', `%${phone}%`);
        if (status && status !== 'all')
            q = q.eq('payment_status', status);
        const { data, count, error } = await q;
        if (error) {
            throw new Error(error.message);
        }
        return {
            data: data ?? [],
            total: count ?? 0,
            page: Number(page),
            limit: Number(limit),
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map