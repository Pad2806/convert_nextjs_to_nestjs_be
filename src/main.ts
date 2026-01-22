import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Polyfill explicitly for Supabase in case the environment misses it
  if (typeof Headers === 'undefined') {
    (global as any).Headers = globalThis.Headers;
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
