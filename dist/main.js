"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    if (typeof Headers === 'undefined') {
        global.Headers = globalThis.Headers;
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendUrl = process.env.FRONTEND_URL;
    const origins = [frontendUrl, 'http://localhost:3000'].filter((url) => !!url);
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
//# sourceMappingURL=main.js.map