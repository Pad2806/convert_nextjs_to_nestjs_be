import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto): Promise<{
        bookingId: any;
    }>;
    findAll(query: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAvailableSlots(clinic_id: string, service_id: string, date: string): Promise<{
        time: string;
        capacity: number;
        booked: number;
        available: number;
    }[]>;
}
