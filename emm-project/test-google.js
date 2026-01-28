const { google } = require('googleapis');
require('dotenv').config();

async function startEnterpriseSignup() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        console.log(`🚀 Iniciando registro para el proyecto: ${projectId}`);

        // PASO REAL: Crear un enlace de registro
        // Este enlace es el que vería tu "cliente" para darte permiso de administrar sus móviles
        const signupUrl = await amapi.signupUrls.create({
            projectId: projectId,
            callbackUrl: 'https://google.com',
        });

        console.log("\n------------------------------------------------------------");
        console.log("⚠️  IMPORTANTE: GUARDA ESTE NOMBRE:");
        console.log(`signupUrlName: ${signupUrl.data.name}`);
        console.log("------------------------------------------------------------");

        console.log("\n------------------------------------------------------------");
        console.log("✅ ¡CONEXIÓN TOTALMENTE FUNCIONAL!");
        console.log("------------------------------------------------------------");
        console.log("\n🔗 ABRE ESTE ENLACE EN TU NAVEGADOR PARA VINCULAR TU EMPRESA:");
        console.log(signupUrl.data.url);
        console.log("\n⚠️  Nota: Al terminar el registro en ese link, te pedirá un 'Enterprise Token'.");
        console.log("------------------------------------------------------------");

    } catch (error) {
        console.error("❌ ERROR:");
        if (error.response && error.response.status === 403) {
            console.error("La API de Android Management no está habilitada o no tienes permisos.");
            console.log("👉 Ve a: https://console.cloud.google.com/apis/library/androidmanagement.googleapis.com");
        } else {
            console.error(error.message);
        }
    }
}

startEnterpriseSignup();