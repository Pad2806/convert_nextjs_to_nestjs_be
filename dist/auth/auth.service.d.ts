import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    register(createAuthDto: any): Promise<{
        message: string;
    }>;
    validateUser(email: string, pass: string): Promise<any>;
}
