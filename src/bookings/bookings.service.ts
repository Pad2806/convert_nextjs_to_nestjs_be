import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

type SlotStat = {
  time: string;
  capacity: number;
  booked: number;
  available: number;
};

// Assuming CreateBookingDto is defined elsewhere, e.g., in a DTO file
// For the purpose of this edit, we'll assume its structure based on usage.
interface CreateBookingDto {
  user_id?: string;
  clinic: string;
  service: string;
  name: string;
  phone: string;
  gender?: string;
  age?: number;
  symptoms?: string;
  booking_time: string; // ISO string or similar
  amount: number;
}

@Injectable()
export class BookingsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  timeToMinutes(t: string) {
    const [hh, mm] = t.split(':');
    return Number(hh) * 60 + Number(mm);
  }

  async create(createBookingDto: CreateBookingDto) {
    const client = this.supabaseService.getClient();

    const bookingTimeStr = String(createBookingDto.booking_time);
    const datePart = bookingTimeStr.split('T')[0];

    // Duplicate check
    const { data: existingBooking } = await client
      .from('bookings')
      .select('id')
      .eq('patient_phone', createBookingDto.phone)
      .gte('booking_time', `${datePart}T00:00:00`)
      .lte('booking_time', `${datePart}T23:59:59`)
      .in('status', ['paid', 'pending'])
      .maybeSingle();

    if (existingBooking) {
      throw new Error(
        'Số điện thoại này đã có lịch đặt chưa khám trong ngày hôm nay.',
      );
    }

    // Insert booking
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

    // Insert Payment
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

  async validateBooking(phone: string, appointmentDate: string) {
    const client = this.supabaseService.getClient();

    // Duplicate check
    const { data: existingBooking } = await client
      .from('bookings')
      .select('id')
      .eq('patient_phone', phone)
      .gte('booking_time', `${appointmentDate}T00:00:00`)
      .lte('booking_time', `${appointmentDate}T23:59:59`)
      .in('status', ['paid', 'pending'])
      .maybeSingle();

    if (existingBooking) {
      throw new Error(
        'Số điện thoại này đã có lịch đặt chưa khám trong ngày này.',
      );
    }

    return { valid: true };
  }

  async findOne(id: string) {
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

  async update(id: string, updateData: any) {
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

  async findAll(query: any) {
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

    if (clinicId) q = q.eq('clinic_id', clinicId);
    if (phone) q = q.ilike('patient_phone', `%${phone}%`);
    if (status && status !== 'all') q = q.eq('booking_status', status);

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

  minutesToHHMM(mins: number) {
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  async findAvailableSlots(clinic_id: string, service_id: string, date: string) {
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
    if (!doctors?.length) return [];

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
    if (!schedules?.length) return [];

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

    const bookedByTime = new Map<string, number>();
    for (const b of bookings ?? []) {
      // Use Date object to reliably extract HH:mm from ISO string or timestamp
      const dt = new Date(b.booking_time);
      if (isNaN(dt.getTime())) continue; // Skip invalid dates

      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      const hhmm = `${hh}:${mm}`;

      bookedByTime.set(hhmm, (bookedByTime.get(hhmm) ?? 0) + 1);
    }

    const capacityByTime = new Map<string, number>();

    for (const s of schedules) {
      const start = this.timeToMinutes(String(s.start_time));
      const end = this.timeToMinutes(String(s.end_time));
      const capPerSlot = s.max_patients ?? 0;

      for (let t = start; t + duration <= end; t += duration) {
        const hhmm = this.minutesToHHMM(t);
        capacityByTime.set(hhmm, (capacityByTime.get(hhmm) ?? 0) + capPerSlot);
      }
    }

    const result: SlotStat[] = Array.from(capacityByTime.entries())
      .map(([time, capacity]) => {
        const booked = bookedByTime.get(time) ?? 0;
        const available = Math.max(capacity - booked, 0);
        return { time, capacity, booked, available };
      })
      .filter((s) => s.available > 0)
      .sort((a, b) => this.timeToMinutes(a.time) - this.timeToMinutes(b.time));

    return result;
  }
}
