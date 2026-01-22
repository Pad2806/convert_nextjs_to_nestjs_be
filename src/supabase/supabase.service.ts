import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL or Key is missing in configuration');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getClient() {
        return this.supabase;
    }
}
