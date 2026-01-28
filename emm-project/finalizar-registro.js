const { google } = require('googleapis');
require('dotenv').config();

// 1. PEGA TU TOKEN NUEVO AQUÍ (Entre comillas)
const SIGNUP_TOKEN = 'EAATX8CcvvXmkRP09Tpc4Macii8wJ4P5LZ4G4WYGi7L9MJsLl4AaKp9oaA56ZI_SiwqbA2xeayT-4j9jx3_0qrFSwAUrxnzvSgRe4Ow2yGvnDSslr3mB3lG4'; 
const PROJECT_ID = 'versatile-bolt-405014';

async function createEnterpriseHybrid() {
    try {
        // A. AUTENTICACIÓN (Usamos tu Service Account que SÍ tiene permisos)
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });

        const client = await auth.getClient();

        console.log(`🔐 Autenticado como Service Account. Scopes correctos.`);
        console.log(`🚀 Enviando petición RAW a Google...`);

        // B. PETICIÓN MANUAL (Idéntica al CURL que casi funcionó)
        // Construimos la URL con los parámetros "quemados" en el string para que nada los cambie
        const url = `https://androidmanagement.googleapis.com/v1/enterprises?projectId=${PROJECT_ID}&signupToken=${encodeURIComponent(SIGNUP_TOKEN)}`;

        const response = await client.request({
            url: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Enviamos un cuerpo con datos mínimos para cumplir el requisito del POST
            data: {
                enterpriseDisplayName: "Produccion"
            }
        });

        console.log("\n" + "=".repeat(50));
        console.log("✅ ¡MISIÓN CUMPLIDA! EMPRESA CREADA");
        console.log("=".repeat(50));
        console.log("🆔 COPIA ESTO INMEDIATAMENTE:");
        console.log(response.data.name); 
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\n❌ ERROR:");
        if (error.response) {
            // Si falla, veremos el error exacto que da Google
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

createEnterpriseHybrid();