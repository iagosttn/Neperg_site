const app = require('./app');
const dataStore = require('./services/dataStore');
const authService = require('./services/authService');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

async function bootstrap() {
    await dataStore.ensureRuntimeReady();
    
    const data = await dataStore.readData();
    if (authService.isSetupLocked(data)) {
        console.warn(
            "ADMIN_SETUP_TOKEN nao configurado. O primeiro acesso administrativo ficara bloqueado ate a variavel ser definida em producao."
        );
    }

    app.listen(port, host, () => {
        console.log(`NEPERG CMS running on ${host}:${port}`);
    });
}

bootstrap().catch((error) => {
    console.error("Server failed to start:", error);
    process.exitCode = 1;
});
