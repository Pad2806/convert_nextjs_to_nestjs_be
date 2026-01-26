import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Polyfill explicitly for Supabase in case the environment misses it
  if (typeof Headers === 'undefined') {
    (global as any).Headers = globalThis.Headers;
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  const frontendUrl = process.env.FRONTEND_URL;
  const origins = [frontendUrl, 'http://localhost:3000'].filter((url): url is string => !!url);

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}`);
}
bootstrap();
