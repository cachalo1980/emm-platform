const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { google } = require('googleapis');
require('dotenv').config();

// --- CONFIGURACIÓN DE LA APLICACIÓN ---
const app = express();
app.use(cors()); // Habilita CORS para que el frontend pueda conectarse
app.use(express.json({ // Middleware para parsear JSON y leer el cuerpo crudo para webhooks
    verify: (req, res, buf) => {
        req.rawBody = buf;
    },
}));
const port = process.env.PORT || 3000;
const PROJECT_ID = 'versatile-bolt-405014'; // Tu Project ID de Google Cloud

// --- CONEXIONES ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/androidmanagement'],
});
const amapi = google.androidmanagement({ version: 'v1' });

// =================================================================
// --- LÓGICA DE WEBHOOK (Google Pub/Sub) ---
// =================================================================
const PUB_SUB_TOPIC = `projects/${PROJECT_ID}/topics/android-management-updates`;

async function setupEnterpriseWebhooks() {
    try {
        const client = await auth.getClient();
        google.options({ auth: client });
        console.log('📢 Configurando notificaciones Pub/Sub para cada cliente...');
        const { rows: tenants } = await pool.query('SELECT google_enterprise_id FROM tenants');
        for (const tenant of tenants) {
            const enterpriseId = tenant.google_enterprise_id;
            await amapi.enterprises.patch({
                name: enterpriseId,
                updateMask: 'pubsubTopic,enabledNotificationTypes',
                requestBody: {
                    pubsubTopic: PUB_SUB_TOPIC,
                    enabledNotificationTypes: ["ENROLLMENT", "STATUS_REPORT"],
                },
            });
            console.log(`   -> Webhook configurado para ${enterpriseId}`);
        }
    } catch (error) {
        console.error('❌ Error fatal al configurar Webhooks:', error.message);
    }
}

app.post('/api/webhook', async (req, res) => {
    if (!req.body || !req.body.message || !req.body.message.data) {
        console.warn('⚠️  Mensaje de prueba o malformado recibido. Ignorando.');
        return res.status(200).send();
    }
    try {
        const message = JSON.parse(Buffer.from(req.body.message.data, 'base64').toString('utf8'));
        console.log('📱 Notificación REAL recibida:', message);
        const { enterpriseName, deviceName, notificationType } = message;
        if (notificationType === 'ENROLLMENT') {
            const { rows: tenants } = await pool.query('SELECT id FROM tenants WHERE google_enterprise_id = $1', [enterpriseName]);
            if (tenants.length > 0) {
                const tenantId = tenants[0].id;
                await pool.query('INSERT INTO devices (tenant_id, google_device_id) VALUES ($1, $2) ON CONFLICT (google_device_id) DO NOTHING', [tenantId, deviceName]);
                console.log(`✅ Nuevo dispositivo ${deviceName} guardado para el tenant ${tenantId}.`);
            }
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.status(500).send();
    }
});

// =================================================================
// --- ENDPOINTS DE LA API (CRUD de Políticas) ---
// =================================================================

app.get('/', (req, res) => res.send('🚀 EMM SaaS API v2.2 (con Edición de Políticas) está funcionando!'));

// GET /api/tenants/:tenantId/policies - Obtiene todas las políticas de un cliente
app.get('/api/tenants/:tenantId/policies', async (req, res) => {
    const { tenantId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM policies WHERE tenant_id = $1 ORDER BY id ASC', [tenantId]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/tenants/:tenantId/devices - Obtiene todos los dispositivos de un cliente
app.get('/api/tenants/:tenantId/devices', async (req, res) => {
    const { tenantId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM devices WHERE tenant_id = $1 ORDER BY enrolled_at DESC', [tenantId]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/policies - Crea una nueva política
app.post('/api/policies', async (req, res) => {
    const { tenantId, name, rules, google_policy_id } = req.body;
    if (!tenantId || !name || !rules || !google_policy_id) {
        return res.status(400).json({ error: 'Faltan campos' });
    }

    let finalRules = rules;
    if (google_policy_id === 'policyKiosco') {
        console.log("Aplicando reglas de Quiosco Multi-App...");
        delete rules.applications;
        finalRules = {
            ...rules,
            kioskCustomLauncherEnabled: true,
            applications: [
                { packageName: "com.whatsapp.w4b", installType: "FORCE_INSTALLED" },
                { packageName: "com.google.android.gm", installType: "FORCE_INSTALLED" },
                { packageName: "com.google.android.calendar", installType: "FORCE_INSTALLED" },
                { packageName: "com.google.android.contacts", installType: "FORCE_INSTALLED" },
                { packageName: "com.google.android.dialer", installType: "FORCE_INSTALLED" },
                { packageName: "com.google.android.apps.messaging", installType: "FORCE_INSTALLED" },
            ],
            statusBarDisabled: false,
        };
    }

    try {
        const tenantResult = await pool.query('SELECT google_enterprise_id FROM tenants WHERE id = $1', [tenantId]);
        if (tenantResult.rowCount === 0) return res.status(404).json({ error: 'Tenant no encontrado' });
        const enterpriseId = tenantResult.rows[0].google_enterprise_id;

        await amapi.enterprises.policies.patch({ auth, name: `${enterpriseId}/policies/${google_policy_id}`, requestBody: finalRules });

        const result = await pool.query(
            'INSERT INTO policies (tenant_id, name, google_policy_id, rules) VALUES ($1, $2, $3, $4) RETURNING *',
            [tenantId, name, google_policy_id, finalRules]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data.error.message : error.message });
    }
});

// PUT /api/policies/:id - Actualiza una política existente
app.put('/api/policies/:id', async (req, res) => {
    const { id } = req.params;
    const { rules } = req.body;
    if (!rules) {
        return res.status(400).json({ error: 'Faltan las reglas (rules)' });
    }

    try {
        const policyResult = await pool.query(
            `SELECT p.google_policy_id, t.google_enterprise_id FROM policies p JOIN tenants t ON p.tenant_id = t.id WHERE p.id = $1`, [id]
        );
        if (policyResult.rowCount === 0) return res.status(404).json({ error: 'Política no encontrada' });

        const { google_policy_id, google_enterprise_id } = policyResult.rows[0];

        await amapi.enterprises.policies.patch({
            auth,
            name: `${google_enterprise_id}/policies/${google_policy_id}`,
            updateMask: Object.keys(rules).join(','),
            requestBody: rules
        });

        const updateResult = await pool.query(
            'UPDATE policies SET rules = $1 WHERE id = $2 RETURNING *',
            [rules, id]
        );
        res.json(updateResult.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// POST /api/tenants/:tenantId/enrollment-tokens - Genera un QR
app.post('/api/tenants/:tenantId/enrollment-tokens', async (req, res) => {
    const { tenantId } = req.params;
    const { policy_id } = req.body;
    if (!policy_id) return res.status(400).json({ error: 'Falta policy_id' });
    try {
        const dbResult = await pool.query(`SELECT t.google_enterprise_id, p.google_policy_id FROM tenants t JOIN policies p ON t.id = p.tenant_id WHERE t.id = $1 AND p.id = $2`, [tenantId, policy_id]);
        if (dbResult.rowCount === 0) return res.status(404).json({ error: 'Tenant o Política no encontrada.' });
        const { google_enterprise_id, google_policy_id } = dbResult.rows[0];
        const policyName = `${google_enterprise_id}/policies/${google_policy_id}`;
        const tokenRes = await amapi.enterprises.enrollmentTokens.create({ auth, parent: google_enterprise_id, requestBody: { policyName } });
        res.json({ qrCode: tokenRes.data.qrCode, value: tokenRes.data.value });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- INICIAR SERVIDOR ---
app.listen(port, '0.0.0.0', async () => {
    console.log(`✅ Servidor EMM SaaS API escuchando en http://0.0.0.0:${port}`);
    await setupEnterpriseWebhooks();
});