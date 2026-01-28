const { google } = require('googleapis');
const { Pool } = require('pg');
require('dotenv').config();

const ENTERPRISE_TOKEN = 'EABKJ9YBIi6Ks_Vse9OuQW92lJtMDqXYT365De-KmaLczi50Y0c904bAfIJ_qoL2Hy_Vp7oegE70Wj5h8IDvgCoAfS5eOqXDl4LDmPrdtngRA8oRc5DoKRsg';
const SIGNUP_URL_NAME = 'signupUrls/Cebbf35ff8d950b54';
const PROJECT_ID = 'emm-platform-production';

async function createEnterprise() {
    try {
        // 1. Conexión a Google
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/androidmanagement'],
        });
        const client = await auth.getClient();
        const amapi = google.androidmanagement({ version: 'v1', auth: client });

        console.log("🚀 Creando empresa en Google...");

        // 2. Crear la Empresa
        const res = await amapi.enterprises.create({
            projectId: PROJECT_ID,
            signupUrlName: SIGNUP_URL_NAME,
            enterpriseToken: ENTERPRISE_TOKEN
        });

        const newEnterprise = res.data;
        console.log("✅ Empresa Creada Exitosamente:");
        console.log(`   ID: ${newEnterprise.name}`);
        console.log(`   Nombre: ${newEnterprise.enterpriseDisplayName || 'EMM Platform Production'}`);

        // 3. Actualizar la Base de Datos
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });

        console.log("\n💾 Actualizando base de datos...");

        // Actualizamos el tenant existente (ID 1)
        const companyName = newEnterprise.enterpriseDisplayName || 'EMM Platform Production';
        await pool.query('UPDATE tenants SET google_enterprise_id = $1, company_name = $2 WHERE id = 1',
            [newEnterprise.name, companyName]);

        // Borramos políticas viejas que apuntaban a la empresa anterior (para evitar conflictos)
        await pool.query('DELETE FROM policies WHERE tenant_id = 1');

        // Re-creamos la política default
        const defaultPolicyId = 'policy1';
        const defaultRules = {
            screenCaptureDisabled: true,
            cameraDisabled: false
        };

        // Subimos la política a Google (nueva empresa)
        await amapi.enterprises.policies.patch({
            name: `${newEnterprise.name}/policies/${defaultPolicyId}`,
            requestBody: defaultRules
        });

        // Guardamos en DB
        await pool.query(
            'INSERT INTO policies (tenant_id, name, google_policy_id, rules) VALUES ($1, $2, $3, $4)',
            [1, 'default', defaultPolicyId, defaultRules]
        );

        console.log("✅ Base de datos actualizada con la nueva Empresa y Política.");
        process.exit(0);

    } catch (e) {
        console.error("❌ Error:", e.message);
        if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
        process.exit(1);
    }
}

createEnterprise();
