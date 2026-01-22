import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DoctorsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(clinic_id?: string, service_id?: string) {
    if (!clinic_id || !service_id) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('doctors')
      .select('*, users!inner(name), doctor_services!inner(service_id)')
      .eq('clinic_id', clinic_id)
      .eq('is_available', true)
      .eq('doctor_services.service_id', service_id);

    if (error) {
      throw new Error(error.message);
    }

    const doctors = data?.map((doc: any) => ({
      ...doc,
      name: doc.users?.name || 'Bác sĩ',
    }));

    return doctors ?? [];
  }
}
