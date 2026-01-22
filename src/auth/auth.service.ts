import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async register(createAuthDto: any) {
    const { name, email, password } = createAuthDto;

    if (!email || !password || !name) {
      throw new Error('Vui lòng điền đầy đủ thông tin');
    }

    const client = this.supabaseService.getClient();

    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Email này đã được đăng ký');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await client.from('users').insert({
      email,
      name,
      password: hashedPassword,
      provider: 'credentials',
      is_active: true,
      role: 'patient',
    });

    if (error) {
      throw new Error('Đã có lỗi xảy ra khi đăng ký ' + error.message);
    }

    return { message: 'Đăng ký thành công' };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const client = this.supabaseService.getClient();
    const { data: user } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (user && user.password) {
      const isValid = await bcrypt.compare(pass, user.password);
      if (isValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }
}
