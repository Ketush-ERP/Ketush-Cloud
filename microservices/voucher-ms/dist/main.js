"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const config_1 = require("./config");
async function bootstrap() {
    const logger = new common_1.Logger('Vouchers-main');
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.NATS,
        options: {
            servers: config_1.envs.natsServers,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    await app.listen();
    logger.log(`Voucher Microservice running on port ${config_1.envs.port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map