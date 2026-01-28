-- Tabla para nuestros clientes (Tenants)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    google_enterprise_id VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Las políticas ahora pertenecen a un Tenant
CREATE TABLE policies (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    google_policy_id VARCHAR(100) NOT NULL,
    rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name) -- El nombre de la política debe ser único por cliente
);

-- Los dispositivos ahora pertenecen a un Tenant
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    google_device_id VARCHAR(255) NOT NULL UNIQUE,
    friendly_name VARCHAR(100),
    policy_id INTEGER REFERENCES policies(id),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertamos nuestro primer cliente (tu propia empresa) para tener datos
INSERT INTO tenants (company_name, google_enterprise_id)
VALUES ('Mi Empresa (Admin)', 'enterprises/LC035ekk1v');

-- Insertamos la política por defecto para nuestro primer cliente
INSERT INTO policies (tenant_id, name, google_policy_id, rules)
VALUES (1, 'default', 'policy1', '{"screenCaptureDisabled": true, "cameraDisabled": false}');