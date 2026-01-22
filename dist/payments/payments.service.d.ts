import { SupabaseService } from '../supabase/supabase.service';
export declare class PaymentsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    processSePayWebhook(payload: any): Promise<{
        ok: boolean;
        alreadyPaid?: undefined;
        success?: undefined;
    } | {
        ok: boolean;
        alreadyPaid: boolean;
        success?: undefined;
    } | {
        success: boolean;
        ok?: undefined;
        alreadyPaid?: undefined;
    }>;
    findAll(query: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
}
