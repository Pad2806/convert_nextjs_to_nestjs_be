export class CreateBookingDto {
    clinic: string;
    service: string;
    name: string;
    phone: string;
    gender?: string;
    age?: number;
    symptoms?: string;
    booking_time: string;
    amount: number;
    user_id?: string; // Optional if not logged in or handled by auth guard
}
