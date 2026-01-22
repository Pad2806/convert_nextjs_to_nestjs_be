import { SupabaseService } from '../supabase/supabase.service';
export declare class DoctorsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(clinic_id?: string, service_id?: string): Promise<any[]>;
}
