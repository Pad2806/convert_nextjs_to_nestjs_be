import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ServicesService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('services')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }
}
