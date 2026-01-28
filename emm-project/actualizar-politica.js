const { google } = require('googleapis');
require('dotenv').config();

// --- NO CAMBIA NADA AQUÍ ---
const ENTERPRISE_ID = 'enterprises/LC035ekk1v';
const POLICY_ID = 'policy1';

async function updatePolicy() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-key.json',
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });
        const client = await auth.getClient();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        console.log(`📡 Actualizando la política: ${ENTERPRISE_ID}/policies/${POLICY_ID}`);

        // ===================================================================
        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ AQUÍ ES DONDE HACES LOS CAMBIOS ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
        // ===================================================================
        const newRules = {
            // --- Ejemplo 1: Bloquear la cámara ---
            "cameraDisabled": true,

            // --- Ejemplo 2: Instalar una App a la fuerza ---
            // (Busca el "Package Name" en la URL de la Play Store)
            "applications": [
                {
                    "packageName": "org.mozilla.firefox", // Firefox
                    "installType": "FORCE_INSTALLED"
                },
                {
                    "packageName": "com.microsoft.office.outlook", // Outlook
                    "installType": "FORCE_INSTALLED"
                }
            ],
            
            // --- Ejemplo 3: Poner el teléfono en "Modo Quiosco" ---
            // (Solo se podrá usar una App, ideal para puntos de venta)
            // "kioskCustomLauncherEnabled": true,
            // "applications": [
            //     {
            //         "packageName": "com.android.chrome",
            //         "installType": "KIOSK" // La app que se abrirá en modo quiosco
            //     }
            // ],

            // Mantenemos lo que ya teníamos
            "screenCaptureDisabled": true,
            "passwordRequirements": {
                "passwordQuality": "NUMERIC",
                "passwordMinimumLength": 4
            }
        };
        // ===================================================================
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
        // ===================================================================

        const res = await amapi.enterprises.policies.patch({
            name: `${ENTERPRISE_ID}/policies/${POLICY_ID}`,
            updateMask: Object.keys(newRules).join(','), // IMPORTANTE: Esto le dice a Google qué campos actualizar
            requestBody: newRules
        });

        console.log("\n✅ Política actualizada a la versión:", res.data.version);

    } catch (error) {
        console.error("❌ Error al actualizar política:", error.message);
    }
}

updatePolicy();