# Configuración de Nuevo Proyecto Google Cloud desde Cero

Crear un proyecto completamente nuevo de Google Cloud para eliminar cualquier restricción heredada del proyecto anterior y permitir el enrollment de dispositivos.

## User Review Required

> [!IMPORTANT]
> **Cuenta de Google a usar**: Confirmar si usar `manuelfrioneto@gmail.com` o crear una cuenta completamente nueva.

> [!WARNING]
> **Migración de datos**: Este proceso creará un nuevo enterprise. Los dispositivos enrollados previamente (si existen) tendrán que ser re-enrollados.

## Proposed Changes

### 1. Google Cloud Console - Crear Nuevo Proyecto

**Pasos manuales en la consola de Google Cloud:**

1. **Ir a**: https://console.cloud.google.com/
2. **Iniciar sesión** con la cuenta deseada (ej: `manuelfrioneto@gmail.com`)
3. **Crear nuevo proyecto**:
   - Click en "Select a project" → "New Project"
   - Nombre: `emm-platform-prod-v2` (o el que prefieras)
   - Organization: Ninguna (dejar vacío)
   - Click "Create"
4. **Anotar el Project ID** que Google asigna (ej: `emm-platform-prod-v2-xxxx`)

---

### 2. Google Cloud Console - Habilitar Android Management API

**Continuar en la consola:**

1. **Ir a**: https://console.cloud.google.com/apis/library/androidmanagement.googleapis.com
2. **Asegurarse** de que el proyecto correcto esté seleccionado (arriba a la izquierda)
3. Click en **"Enable"**
4. Esperar confirmación

---

### 3. Google Cloud Console - Crear Service Account

**Crear cuenta de servicio con permisos:**

1. **Ir a**: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click en **"Create Service Account"**
3. **Detalles**:
   - Service account name: `emm-backend`
   - Service account ID: se generará automáticamente
   - Description: "EMM Backend API Service Account"
   - Click "Create and Continue"
4. **Permisos** (Grant this service account access to project):
   - Role 1: `Editor`
   - Role 2: `Android Management User`
   - Click "Continue"
5. **Skip** la sección "Grant users access" (opcional)
6. Click "Done"

---

### 4. Google Cloud Console - Generar Credenciales JSON

**Descargar la llave de servicio:**

1. En la lista de Service Accounts, click en `emm-backend@...`
2. Ir a la pestaña **"Keys"**
3. Click en **"Add Key"** → "Create new key"
4. Tipo: **JSON**
5. Click "Create"
6. Se descargará un archivo JSON (ej: `emm-platform-prod-v2-xxxx-yyyyyyy.json`)
7. **Renombrar** el archivo a `google-key-new.json`

---

### 5. VPS - Respaldar Configuración Actual

#### [MODIFY] Backup en VPS

```bash
# Crear backup de la configuración actual
cd /home/manuel/emm-platform/emm-project
cp google-key.json google-key-old-backup.json
cp .env.production .env.production.backup
```

---

### 6. VPS - Subir Nuevas Credenciales

**Transferir el nuevo archivo desde tu máquina local al VPS:**

Opción A - Usando SCP (desde tu máquina local):
```bash
scp google-key-new.json manuel@onetoemm:/home/manuel/emm-platform/emm-project/google-key.json
```

Opción B - Copiar contenido manualmente:
```bash
# En el VPS
nano /home/manuel/emm-platform/emm-project/google-key.json
# Pegar el contenido del nuevo JSON
# Guardar: Ctrl+O, Enter, Ctrl+X
```

---

### 7. Código Local - Actualizar Project ID

#### [MODIFY] [create-enterprise.js](file:///home/manuel/emm-oneto/emm-project/create-enterprise.js)

Cambiar el `PROJECT_ID` al nuevo:
```javascript
const PROJECT_ID = 'emm-platform-prod-v2-xxxx'; // Reemplazar con el Project ID real
```

#### [MODIFY] [server.js](file:///home/manuel/emm-oneto/emm-project/server.js)

Cambiar el `PROJECT_ID`:
```javascript
const PROJECT_ID = 'emm-platform-prod-v2-xxxx'; // Reemplazar con el Project ID real
```

Commit y push:
```bash
git add emm-project/create-enterprise.js emm-project/server.js
git commit -m "feat: Update to new Google Cloud project"
git push origin dev
```

---

### 8. VPS - Generar Nuevas Credenciales de Enterprise

```bash
cd /home/manuel/emm-platform/emm-project

# Pull cambios
git pull origin dev

# Generar nuevo signup URL
docker exec -it emm_api_server node test-google.js
```

**Anotar:**
- `signupUrlName`: (ej: `signupUrls/Cxxxxxx`)
- URL de registro

---

### 9. Manual - Completar Registro de Enterprise

1. Abrir la URL del paso anterior en modo **incógnito**
2. Iniciar sesión con `manuelfrioneto@gmail.com` (o la cuenta elegida)
3. Aceptar términos y completar registro
4. Copiar el **Enterprise Token** que aparece al final

---

### 10. Código Local - Actualizar create-enterprise.js

#### [MODIFY] [create-enterprise.js](file:///home/manuel/emm-oneto/emm-project/create-enterprise.js)

Actualizar con los nuevos valores:
```javascript
const ENTERPRISE_TOKEN = 'NUEVO_TOKEN_AQUI';
const SIGNUP_URL_NAME = 'signupUrls/Cxxxxxx';
const PROJECT_ID = 'emm-platform-prod-v2-xxxx';
```

Commit y push:
```bash
git add emm-project/create-enterprise.js
git commit -m "feat: Update enterprise token for fresh project"
git push origin dev
```

---

### 11. VPS - Crear Nuevo Enterprise

```bash
cd /home/manuel/emm-platform/emm-project

# Pull cambios
git pull origin dev

# Reconstruir contenedor
docker compose down api
docker compose up -d --build api
sleep 10

# Ejecutar creación
docker exec -it emm_api_server node create-enterprise.js
```

**Anotar** el nuevo `Enterprise ID` (ej: `enterprises/LCxxxxxxx`)

---

### 12. VPS - Actualizar .env.production

```bash
cd /home/manuel/emm-platform/emm-project
nano .env.production
```

Actualizar:
```env
GOOGLE_CLOUD_PROJECT=emm-platform-prod-v2-xxxx
ENTERPRISE_ID=enterprises/LCxxxxxxx
```

Guardar y reiniciar:
```bash
docker compose restart api
sleep 5
```

---

### 13. Código Local - Actualizar docker-compose.yml (si necesario)

Verificar que `docker-compose.yml` tenga la variable dinámica:
```yaml
environment:
  - ENTERPRISE_ID=${ENTERPRISE_ID}
```

---

## Verification Plan

### Automated Tests

```bash
# 1. Verificar que el nuevo enterprise esté configurado
docker exec emm_api_server env | grep ENTERPRISE
docker exec emm_postgres_db psql -U admin -d emm_db -c "SELECT google_enterprise_id FROM tenants;"

# 2. Verificar que se puede generar token
docker exec -it emm_api_server node -e "
const { google } = require('googleapis');
const { Pool } = require('pg');
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/androidmanagement'],
});
auth.getClient().then(async client => {
  const amapi = google.androidmanagement({ version: 'v1', auth: client });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query('SELECT google_enterprise_id FROM tenants WHERE id = 1');
  const enterpriseId = result.rows[0].google_enterprise_id;
  console.log('✅ Enterprise ID:', enterpriseId);
  const tokenRes = await amapi.enterprises.enrollmentTokens.create({
    parent: enterpriseId,
    requestBody: { policyName: enterpriseId + '/policies/policy1' }
  });
  console.log('✅ Token generado exitosamente');
  await pool.end();
});
"

# 3. Listar dispositivos enrollados
docker exec emm_postgres_db psql -U admin -d emm_db -c "SELECT COUNT(*) FROM devices;"
```

### Manual Verification

1. **Dashboard**: Acceder a https://androide.caruao.cloud
2. **Políticas**: Verificar que aparezca al menos la política "default"
3. **Generar QR**: Crear QR para la política "default"
4. **Dispositivo**: Factory reset de un dispositivo Android
5. **Escanear**: Escanear el QR durante el setup inicial
6. **Verificar Enrollment**: Confirmar que el dispositivo se enrolle SIN error de límite
7. **Dashboard**: Verificar que el dispositivo aparezca en la lista

### Success Criteria

- ✅ Nuevo enterprise creado en Google Cloud
- ✅ Token de enrollment se genera sin errores
- ✅ Dispositivo se enrolla exitosamente (sin error de "límite alcanzado")
- ✅ Dispositivo aparece en el Dashboard
- ✅ Políticas se pueden aplicar desde el Dashboard
