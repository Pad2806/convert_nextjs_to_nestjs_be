import { SupabaseService } from '../supabase/supabase.service';
export declare class ClinicsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<{
        id: any;
        name: any;
    }[]>;
}
