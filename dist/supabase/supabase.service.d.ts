import { OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
export declare class SupabaseService implements OnModuleInit {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    getClient(): SupabaseClient<any, "public", "public", any, any>;
}
