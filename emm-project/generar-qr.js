const { google } = require('googleapis');
const qrcode = require('qrcode');
require('dotenv').config();

async function generateEnrollmentToken() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });

        const client = await auth.getClient();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        // Usamos el ID de tu empresa y la política que acabamos de crear
        const enterpriseId = 'enterprises/LC035ekk1v';
        const policyName = `${enterpriseId}/policies/policy1`;

        console.log("⏳ Generando token de enrolamiento...");

        const res = await amapi.enterprises.enrollmentTokens.create({
            parent: enterpriseId,
            requestBody: {
                policyName: policyName,
                // Esto hace que el QR no caduque nunca (útil para pruebas)
                duration: '315360000s' // 10 años
            }
        });

        const qrData = res.data.qrCode;

        console.log("\n" + "=".repeat(50));
        console.log("✅ ¡QR GENERADO EXITOSAMENTE!");
        console.log("=".repeat(50));
        console.log("Toma tu teléfono Android (Restaurado de fábrica)");
        console.log("Toca 6 veces en la pantalla de bienvenida y escanea esto:");
        console.log("=".repeat(50) + "\n");

        // Pintamos el QR en la terminal
        qrcode.toString(qrData, { type: 'terminal', small: true }, function (err, url) {
            if (err) throw err;
            console.log(url);
        });

        console.log("\n(Si no puedes escanearlo, usa este JSON en un generador de QR online):");
        console.log(qrData);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

generateEnrollmentToken();