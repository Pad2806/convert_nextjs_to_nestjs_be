import { SupabaseService } from '../supabase/supabase.service';
type SlotStat = {
    time: string;
    capacity: number;
    booked: number;
    available: number;
};
interface CreateBookingDto {
    user_id?: string;
    clinic: string;
    service: string;
    name: string;
    phone: string;
    gender?: string;
    age?: number;
    symptoms?: string;
    booking_time: string;
    amount: number;
}
export declare class BookingsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    timeToMinutes(t: string): number;
    create(createBookingDto: CreateBookingDto): Promise<{
        bookingId: any;
    }>;
    validateBooking(phone: string, appointmentDate: string): Promise<{
        valid: boolean;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateData: any): Promise<any>;
    findAll(query: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    minutesToHHMM(mins: number): string;
    findAvailableSlots(clinic_id: string, service_id: string, date: string): Promise<SlotStat[]>;
}
export {};
