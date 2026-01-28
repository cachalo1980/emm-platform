const { google } = require('googleapis');
require('dotenv').config();

async function createPolicy() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });

        const client = await auth.getClient();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        const enterpriseId = process.env.ENTERPRISE_ID;
        const policyId = "policy1"; // El nombre que le damos a esta configuración

        console.log(`📡 Enviando reglas a: ${enterpriseId}/policies/${policyId}`);

        const res = await amapi.enterprises.policies.patch({
            name: `${enterpriseId}/policies/${policyId}`,
            requestBody: {
                // AQUÍ ESTÁN LAS REGLAS DEL JUEGO:
                screenCaptureDisabled: true, // Bloquea screenshots (fácil de testear)
                cameraDisabled: false,       // Permitimos cámara
                passwordRequirements: {
                    passwordQuality: "NUMERIC",
                    passwordMinimumLength: 4
                },
                // Si quisieras instalar apps, irían aquí en "applications"
            }
        });

        console.log("\n" + "=".repeat(50));
        console.log("✅ POLÍTICA CREADA/ACTUALIZADA CORRECTAMENTE");
        console.log("=".repeat(50));
        console.log("Nombre de la política: " + res.data.name);
        console.log("Versión: " + res.data.version);
        console.log("=".repeat(50));

    } catch (error) {
        console.error("❌ Error al crear política:", error.message);
    }
}

createPolicy();