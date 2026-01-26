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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let BookingsService = class BookingsService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    timeToMinutes(t) {
        const [hh, mm] = t.split(':');
        return Number(hh) * 60 + Number(mm);
    }
    async create(createBookingDto) {
        const client = this.supabaseService.getClient();
        const bookingTimeStr = String(createBookingDto.booking_time);
        const datePart = bookingTimeStr.split('T')[0];
        const { data: existingBooking } = await client
            .from('bookings')
            .select('id')
            .eq('patient_phone', createBookingDto.phone)
            .gte('booking_time', `${datePart}T00:00:00`)
            .lte('booking_time', `${datePart}T23:59:59`)
            .in('status', ['paid', 'pending'])
            .maybeSingle();
        if (existingBooking) {
            throw new Error('Số điện thoại này đã có lịch đặt chưa khám trong ngày hôm nay.');
        }
        const { data: booking, error: bookingError } = await client
            .from('bookings')
            .insert({
            user_id: createBookingDto.user_id ?? null,
            clinic_id: createBookingDto.clinic,
            service_id: createBookingDto.service,
            patient_name: createBookingDto.name,
            patient_phone: createBookingDto.phone,
            gender: createBookingDto.gender ?? null,
            age: createBookingDto.age ?? null,
            symptoms: createBookingDto.symptoms ?? null,
            booking_time: createBookingDto.booking_time,
            status: 'pending',
        })
            .select('id')
            .single();
        if (bookingError || !booking) {
            throw new Error(bookingError?.message ?? 'Create booking failed');
        }
        const { error: paymentError } = await client.from('payments').insert({
            booking_id: booking.id,
            amount: createBookingDto.amount,
            method: 'banking',
            status: 'pending',
        });
        if (paymentError) {
            throw new Error(paymentError.message);
        }
        return { bookingId: booking.id };
    }
    async validateBooking(phone, appointmentDate) {
        const client = this.supabaseService.getClient();
        const { data: existingBooking } = await client
            .from('bookings')
            .select('id')
            .eq('patient_phone', phone)
            .gte('booking_time', `${appointmentDate}T00:00:00`)
            .lte('booking_time', `${appointmentDate}T23:59:59`)
            .in('status', ['paid', 'pending'])
            .maybeSingle();
        if (existingBooking) {
            throw new Error('Số điện thoại này đã có lịch đặt chưa khám trong ngày này.');
        }
        return { valid: true };
    }
    async findOne(id) {
        const { data: booking, error } = await this.supabaseService
            .getClient()
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !booking) {
            throw new Error('Booking not found');
        }
        return booking;
    }
    async update(id, updateData) {
        const { data: booking, error } = await this.supabaseService
            .getClient()
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();
        if (error || !booking) {
            throw new Error('Update failed or booking not found');
        }
        return booking;
    }
    async findAll(query) {
        const { phone, status, clinicId, page = 1, limit = 20 } = query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        let q = this.supabaseService
            .getClient()
            .from('admin_booking_overview')
            .select('*', { count: 'exact' })
            .order('booking_time', { ascending: false })
            .order('created_at', { ascending: false })
            .range(from, to);
        if (clinicId)
            q = q.eq('clinic_id', clinicId);
        if (phone)
            q = q.ilike('patient_phone', `%${phone}%`);
        if (status && status !== 'all')
            q = q.eq('booking_status', status);
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
    minutesToHHMM(mins) {
        const hh = String(Math.floor(mins / 60)).padStart(2, '0');
        const mm = String(mins % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    }
    async findAvailableSlots(clinic_id, service_id, date) {
        if (!clinic_id || !service_id || !date) {
            throw new Error('Missing query params');
        }
        const client = this.supabaseService.getClient();
        const { data: service, error: serviceErr } = await client
            .from('services')
            .select('duration_minutes')
            .eq('id', service_id)
            .single();
        if (serviceErr || !service) {
            throw new Error('Service not found');
        }
        const duration = service.duration_minutes ?? 30;
        const { data: doctors, error: docErr } = await client
            .from('doctors')
            .select('id, doctor_services!inner(service_id)')
            .eq('clinic_id', clinic_id)
            .eq('is_available', true)
            .eq('doctor_services.service_id', service_id);
        if (docErr) {
            throw new Error(docErr.message);
        }
        if (!doctors?.length)
            return [];
        const doctorIds = doctors.map((d) => d.id);
        const { data: schedules, error: schErr } = await client
            .from('doctor_schedules')
            .select('doctor_id, start_time, end_time, max_patients')
            .eq('date', date)
            .eq('is_available', true)
            .in('doctor_id', doctorIds);
        if (schErr) {
            throw new Error(schErr.message);
        }
        if (!schedules?.length)
            return [];
        const { data: bookings, error: bookErr } = await client
            .from('bookings')
            .select('booking_time')
            .eq('clinic_id', clinic_id)
            .eq('service_id', service_id)
            .in('status', ['pending', 'paid'])
            .gte('booking_time', `${date} 00:00:00`)
            .lte('booking_time', `${date} 23:59:59`);
        if (bookErr) {
            throw new Error(bookErr.message);
        }
        const bookedByTime = new Map();
        for (const b of bookings ?? []) {
            const hhmm = String(b.booking_time).slice(11, 16);
            bookedByTime.set(hhmm, (bookedByTime.get(hhmm) ?? 0) + 1);
        }
        const capacityByTime = new Map();
        for (const s of schedules) {
            const start = this.timeToMinutes(String(s.start_time));
            const end = this.timeToMinutes(String(s.end_time));
            const capPerSlot = s.max_patients ?? 0;
            for (let t = start; t + duration <= end; t += duration) {
                const hhmm = this.minutesToHHMM(t);
                capacityByTime.set(hhmm, (capacityByTime.get(hhmm) ?? 0) + capPerSlot);
            }
        }
        const result = Array.from(capacityByTime.entries())
            .map(([time, capacity]) => {
            const booked = bookedByTime.get(time) ?? 0;
            const available = Math.max(capacity - booked, 0);
            return { time, capacity, booked, available };
        })
            .filter((s) => s.available > 0)
            .sort((a, b) => this.timeToMinutes(a.time) - this.timeToMinutes(b.time));
        return result;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map