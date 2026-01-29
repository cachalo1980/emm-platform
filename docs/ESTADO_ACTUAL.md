# Estado Actual del Proyecto EMM Platform

**Fecha**: 2026-01-29  
**Estado**: ⏸️ **EN ESPERA - Pendiente de aprobación de Google**

---

## 🚨 Bloqueador Principal

**Google Android Management API requiere aprobación para producción**.

- **Límite actual**: ~10 dispositivos en modo desarrollo
- **Para producción**: Necesitas completar el formulario de solicitud
- **Formulario**: https://goo.gle/android-enterprise-response
- **Documentación**: https://developers.google.com/android/management/permissible-usage

---

## 🌐 URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | https://androide.caruao.cloud | ✅ Funcionando |
| **Backend API** | https://apiemmoneto.caruao.cloud | ✅ Funcionando |
| **VPS SSH** | `ssh manuel@onetoemm` (vía Cloudflare Tunnel) | ✅ Configurado |
| **GitHub Repo** | https://github.com/cachalo1980/emm-platform | ✅ Branch `dev` |

---

## 🔧 Configuración del VPS

**Servidor**: `onetoemm` (186.23.239.234)  
**Usuario**: `manuel`  
**Path del proyecto**: `/home/manuel/emm-platform`

### Servicios Docker en Ejecución

```bash
# Ver estado
docker ps

# Logs
docker logs emm_api_server
docker logs emm_frontend
docker logs emm_postgres_db
```

**Contenedores**:
- `emm_api_server` - Backend API (puerto 3001)
- `emm_frontend` - Frontend Next.js (puerto 3002)
- `emm_postgres_db` - PostgreSQL (puerto 5432)

---

## ☁️ Google Cloud - Configuración Actual

### Proyecto de Google Cloud

- **Project ID**: `emm-platform-production`
- **Cuenta admin**: `implementaciones@frioneto.com.ar`
- **Service Account**: `emm-backend@emm-platform-production.iam.gserviceaccount.com`
- **Credenciales**: `/home/manuel/emm-platform/emm-project/google-key.json` (en VPS)

### Enterprise Actual

- **Enterprise ID**: `enterprises/LC01gexap1`
- **Cuenta vinculada**: `manuelfrioneto@gmail.com`
- **Políticas disponibles**:
  - `policy1` - Política por defecto ✅

### Estado de la Base de Datos

```sql
-- Ver tenant actual
SELECT * FROM tenants;

-- Ver políticas
SELECT * FROM policies;

-- Ver dispositivos (debería estar vacío)
SELECT * FROM devices;
```

**Enterprise ID en BD**: `enterprises/LC01gexap1`

---

## 📋 Archivos de Configuración

### En el VPS: `/home/manuel/emm-platform/emm-project/.env.production`

```env
DATABASE_URL=postgresql://admin:admin123@db:5432/emm_db
GOOGLE_APPLICATION_CREDENTIALS=/app/google-key.json
GOOGLE_CLOUD_PROJECT=emm-platform-production
PORT=3001
NODE_ENV=production
WEBHOOK_URL=https://emmoneto.caruao.cloud/webhook
ENTERPRISE_ID=enterprises/LC01gexap1
```

### Repositorio Local: `/home/manuel/emm-oneto`

- Branch principal: `dev`
- Último commit: Actualización de enterprise token

---

## ✅ Lo Que Funciona

1. ✅ **VPS deployado** - Docker Compose corriendo
2. ✅ **Frontend accesible** - Dashboard funcionando en https://androide.caruao.cloud
3. ✅ **Backend API** - Endpoints respondiendo correctamente
4. ✅ **Base de datos** - PostgreSQL con schema correcto
5. ✅ **Google Cloud configurado** - APIs habilitadas, service account con permisos
6. ✅ **Enterprise creado** - `LC01gexap1` vinculado a `manuelfrioneto@gmail.com`
7. ✅ **Generación de QR** - Tokens de enrollment se generan correctamente
8. ✅ **Cloudflare Tunnel** - SSL/HTTPS configurado

---

## ❌ Lo Que NO Funciona (Bloqueador)

**Enrollment de dispositivos**: Al escanear el QR, Android devuelve:

> "No se puede configurar el dispositivo. Dado que su organización alcanzó los límites de uso, no se puede configurar este dispositivo."

**Causa**: Google limita a ~10 dispositivos en modo desarrollo. Necesitas aprobación para producción.

---

## 🚀 Próximos Pasos (Cuando Retomes)

### Opción 1: Solicitar Aprobación de Google (Recomendado)

1. Completar formulario: https://goo.gle/android-enterprise-response
2. Proporcionar:
   - Nombre de la empresa
   - Caso de uso (gestión de dispositivos empresariales)
   - Número estimado de dispositivos
   - Project ID: `emm-platform-production`
3. Esperar respuesta (puede tardar 1-2 semanas)
4. Una vez aprobado, probar enrollment

### Opción 2: Proyecto Completamente Nuevo

Si necesitas probar antes de la aprobación:

1. Crear un **nuevo proyecto de Google Cloud** con otra cuenta
2. Seguir el plan en [`implementation_plan.md`](file:///home/manuel/.gemini/antigravity/brain/e03e2d54-4146-40c2-9377-af9758cbc12d/implementation_plan.md)
3. Aún así tendrás límite de ~10 dispositivos

---

## 📚 Documentación Útil

- [Android Management API - Uso Permitido](https://developers.google.com/android/management/permissible-usage)
- [Formulario de Solicitud](https://goo.gle/android-enterprise-response)
- [Documentación EMM API](https://developers.google.com/android/management)

---

## 🔍 Comandos Útiles para Debugging

### En el VPS

```bash
# Ver enterprise ID activo
docker exec emm_api_server env | grep ENTERPRISE

# Ver enterprise en base de datos
docker exec emm_postgres_db psql -U admin -d emm_db -c "SELECT google_enterprise_id FROM tenants;"

# Generar token de prueba
docker exec -it emm_api_server node -e "
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/androidmanagement'],
});
auth.getClient().then(async client => {
  const amapi = google.androidmanagement({ version: 'v1', auth: client });
  const tokenRes = await amapi.enterprises.enrollmentTokens.create({
    parent: 'enterprises/LC01gexap1',
    requestBody: { policyName: 'enterprises/LC01gexap1/policies/policy1' }
  });
  console.log('QR:', tokenRes.data.qrCode.substring(0, 100));
});
"

# Ver policies en Google Cloud
docker exec -it emm_api_server node -e "
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/androidmanagement'],
});
auth.getClient().then(client => {
  const amapi = google.androidmanagement({ version: 'v1', auth: client });
  amapi.enterprises.policies.list({ parent: 'enterprises/LC01gexap1' })
    .then(res => console.log('Policies:', res.data.policies?.map(p => p.name)));
});
"
```

---

## 📝 Notas Importantes

- **No crear más enterprises**: Ya alcanzamos el límite de vinculaciones EMM para las cuentas utilizadas
- **Backup de credenciales**: El archivo `google-key.json` es crítico, hay backup en `google-key-old-backup.json`
- **Branch de trabajo**: Siempre trabajar en `dev`, no en `main`
- **Deployment**: Para desplegar cambios:
  ```bash
  # En VPS
  cd /home/manuel/emm-platform
  git pull origin dev
  cd emm-project
  docker compose down api
  docker compose up -d --build api
  ```

---

**Resumen**: Todo está configurado correctamente. El único bloqueador es la aprobación de Google para permitir más de 10 dispositivos en producción.
